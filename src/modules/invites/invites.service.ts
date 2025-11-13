import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InviteStatus, ListStatus, Prisma } from '@prisma/client'
import { randomUUID } from 'node:crypto'

import {
  MAIN_LIST_CAPACITY,
  MAX_GUESTS_PER_PLAYER,
} from '../../common/rules/functional-rules'
import {
  calculateInviteExpiration,
  isWithinInviteWindow,
} from '../../common/utils/invite-window.util'
import { PrismaService } from '../prisma/prisma.service'
import { AcceptInviteDto } from './dto/accept-invite.dto'
import { CreateInviteDto } from './dto/create-invite.dto'

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  private async expireOutdatedInvites(
    now: Date,
    tx: Prisma.TransactionClient | PrismaService = this.prisma,
  ): Promise<void> {
    await tx.invite.updateMany({
      where: {
        status: InviteStatus.PENDING,
        expiresAt: { lte: now },
      },
      data: {
        status: InviteStatus.EXPIRED,
      },
    })
  }

  async createInvite(
    hostPlayerId: string,
    dto: CreateInviteDto,
  ): Promise<{ token: string; expiresAt: Date }> {
    const now = new Date()

    if (!isWithinInviteWindow(now)) {
      throw new BadRequestException('Invites are not available at this time.')
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await this.expireOutdatedInvites(now, tx)

      const host = await tx.player.findUnique({ where: { id: hostPlayerId } })

      if (!host) {
        throw new NotFoundException('Host player not found.')
      }

      if (host.userId !== dto.hostUserId) {
        throw new ForbiddenException(
          'You are not allowed to generate invites for this player.',
        )
      }

      if (host.isGuest) {
        throw new BadRequestException('Guests cannot generate invites.')
      }

      if (host.status !== ListStatus.MAIN) {
        throw new BadRequestException(
          'Only main list players can generate invites.',
        )
      }

      const guestCount = await tx.player.count({
        where: { invitedByPlayerId: host.id },
      })

      const pendingInvites = await tx.invite.count({
        where: {
          invitedByPlayerId: host.id,
          status: InviteStatus.PENDING,
        },
      })

      if (guestCount + pendingInvites >= MAX_GUESTS_PER_PLAYER) {
        throw new BadRequestException('Invite limit reached for this player.')
      }

      const expiresAt = calculateInviteExpiration(now)

      const invite = await tx.invite.create({
        data: {
          token: randomUUID(),
          invitedByPlayerId: host.id,
          invitedByUserId: host.userId,
          expiresAt,
        },
        select: {
          token: true,
          expiresAt: true,
        },
      })

      return invite
    })

    return result
  }

  async acceptInvite(dto: AcceptInviteDto) {
    const now = new Date()

    if (!isWithinInviteWindow(now)) {
      throw new BadRequestException('Invites are not available at this time.')
    }

    const player = await this.prisma.$transaction(async (tx) => {
      await this.expireOutdatedInvites(now, tx)

      const invite = await tx.invite.findUnique({ where: { token: dto.token } })

      if (!invite || invite.status !== InviteStatus.PENDING) {
        throw new NotFoundException('Invite is invalid or already used.')
      }

      if (invite.expiresAt <= now) {
        await tx.invite.update({
          where: { id: invite.id },
          data: {
            status: InviteStatus.EXPIRED,
          },
        })

        throw new BadRequestException('Invite has expired.')
      }

      const existingPlayer = await tx.player.findUnique({
        where: { userId: dto.userId },
      })

      if (existingPlayer) {
        throw new ConflictException('This user already has an active entry.')
      }

      if (invite.invitedByPlayerId) {
        const guestCount = await tx.player.count({
          where: { invitedByPlayerId: invite.invitedByPlayerId },
        })

        if (guestCount >= MAX_GUESTS_PER_PLAYER) {
          throw new BadRequestException(
            'Guest limit reached for this host player.',
          )
        }
      }

      const mainCount = await tx.player.count({
        where: { status: ListStatus.MAIN },
      })

      const status =
        mainCount < MAIN_LIST_CAPACITY ? ListStatus.MAIN : ListStatus.WAITLIST

      const createdPlayer = await tx.player.create({
        data: {
          name: dto.name,
          userId: dto.userId,
          profile: dto.profile,
          status,
          isGuest: true,
          invitedByPlayerId: invite.invitedByPlayerId,
        },
      })

      await tx.invite.update({
        where: { id: invite.id },
        data: {
          status: InviteStatus.USED,
          usedAt: now,
          acceptedPlayerId: createdPlayer.id,
        },
      })

      return createdPlayer
    })

    return player
  }
}
