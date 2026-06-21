import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InviteStatus, ListStatus } from '@prisma/client'
import { randomUUID } from 'node:crypto'

import {
  MAIN_LIST_CAPACITY,
  MAX_GUESTS_PER_PLAYER,
} from '../../common/rules/functional-rules'
import {
  calculateInviteExpiration,
  getInviteWindowEndDate,
  isWithinInviteWindow,
} from '../../common/utils/invite-window.util'
import { PrismaService } from '../prisma/prisma.service'
import { AcceptInviteDto } from './dto/accept-invite.dto'
import { CreateInviteDto } from './dto/create-invite.dto'

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  getInviteWindowStatus(): { open: boolean; windowEnd: Date | null } {
    const now = new Date()
    const open = isWithinInviteWindow(now)
    return { open, windowEnd: open ? getInviteWindowEndDate(now) : null }
  }

  private async expireOutdatedInvites(now: Date): Promise<void> {
    await this.prisma.invite.updateMany({
      where: { status: InviteStatus.PENDING, expiresAt: { lte: now } },
      data: { status: InviteStatus.EXPIRED },
    })
  }

  async createInvite(dto: CreateInviteDto): Promise<{ token: string; expiresAt: Date }> {
    const now = new Date()

    if (!isWithinInviteWindow(now)) {
      throw new BadRequestException('Invites are not available at this time.')
    }

    await this.expireOutdatedInvites(now)

    const host = await this.prisma.player.findUnique({ where: { rg: dto.rg } })

    if (!host) {
      throw new NotFoundException('Player not found with this RG.')
    }

    if (host.isGuest) {
      throw new BadRequestException(
        'Guests cannot generate invites. Only main list players can create invite links.',
      )
    }

    if (host.status !== ListStatus.MAIN) {
      throw new BadRequestException('Only main list players can generate invites.')
    }

    const guestCount = await this.prisma.player.count({
      where: { invitedByPlayerId: host.id },
    })

    const pendingInvites = await this.prisma.invite.count({
      where: { invitedByPlayerId: host.id, status: InviteStatus.PENDING },
    })

    if (guestCount + pendingInvites >= MAX_GUESTS_PER_PLAYER) {
      throw new BadRequestException('Invite limit reached for this player.')
    }

    const expiresAt = calculateInviteExpiration(now)

    return this.prisma.invite.create({
      data: {
        token: randomUUID(),
        invitedByPlayerId: host.id,
        invitedByUserId: host.userId,
        expiresAt,
      },
      select: { token: true, expiresAt: true },
    })
  }

  async acceptInvite(dto: AcceptInviteDto) {
    const now = new Date()

    if (!isWithinInviteWindow(now)) {
      throw new BadRequestException('Invites are not available at this time.')
    }

    await this.expireOutdatedInvites(now)

    const invite = await this.prisma.invite.findUnique({ where: { token: dto.token } })

    if (!invite || invite.status !== InviteStatus.PENDING) {
      throw new NotFoundException('Invite is invalid or already used.')
    }

    if (invite.expiresAt <= now) {
      await this.prisma.invite.update({
        where: { id: invite.id },
        data: { status: InviteStatus.EXPIRED },
      })
      throw new BadRequestException('Invite has expired.')
    }

    const existingPlayer = await this.prisma.player.findUnique({ where: { rg: dto.rg } })

    if (existingPlayer) {
      throw new ConflictException('A player with this RG already has an active entry.')
    }

    if (invite.invitedByPlayerId) {
      const guestCount = await this.prisma.player.count({
        where: { invitedByPlayerId: invite.invitedByPlayerId },
      })

      if (guestCount >= MAX_GUESTS_PER_PLAYER) {
        throw new BadRequestException('Guest limit reached for this host player.')
      }
    }

    const mainCount = await this.prisma.player.count({
      where: { status: ListStatus.MAIN, profile: { not: 'RESENHA' } },
    })

    const status =
      dto.profile === 'RESENHA' || mainCount < MAIN_LIST_CAPACITY
        ? ListStatus.MAIN
        : ListStatus.WAITLIST

    const createdPlayer = await this.prisma.player.create({
      data: {
        name: dto.name,
        rg: dto.rg,
        phone: dto.phone,
        profile: dto.profile,
        status,
        isGuest: true,
        invitedByPlayerId: invite.invitedByPlayerId,
      },
    })

    await this.prisma.invite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.USED, usedAt: now, acceptedPlayerId: createdPlayer.id },
    })

    return createdPlayer
  }
}
