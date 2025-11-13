import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { ListStatus, Player as PlayerModel } from '@prisma/client'
import { MAIN_LIST_CAPACITY } from '../../common/rules/functional-rules'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePlayerDto } from './dto/create-player.dto'
import { RemovePlayerDto } from './dto/remove-player.dto'

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlayerDto): Promise<PlayerModel> {
    const existing = await this.prisma.player.findUnique({
      where: { userId: dto.userId },
    })

    if (existing) {
      throw new ConflictException(
        'The user already has an active entry in the list.',
      )
    }

    const mainCount = await this.prisma.player.count({
      where: { status: ListStatus.MAIN },
    })

    const status =
      mainCount < MAIN_LIST_CAPACITY ? ListStatus.MAIN : ListStatus.WAITLIST

    return this.prisma.player.create({
      data: {
        name: dto.name,
        userId: dto.userId,
        profile: dto.profile,
        status,
        isGuest: false,
      },
    })
  }

  async remove(playerId: string, dto: RemovePlayerDto): Promise<void> {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
    })

    if (!player) {
      throw new NotFoundException('Player not found.')
    }

    if (player.userId !== dto.userId) {
      throw new ForbiddenException(
        'You do not have permission to remove this player.',
      )
    }

    if (player.status === ListStatus.MAIN) {
      await this.prisma.$transaction(async (tx) => {
        await tx.player.delete({ where: { id: playerId } })

        const promotionCandidate = await tx.player.findFirst({
          where: { status: ListStatus.WAITLIST },
          orderBy: { joinTimestamp: 'asc' },
        })

        if (promotionCandidate) {
          await tx.player.update({
            where: { id: promotionCandidate.id },
            data: { status: ListStatus.MAIN },
          })
        }
      })
    } else {
      await this.prisma.player.delete({ where: { id: playerId } })
    }
  }

  async exportList(): Promise<string> {
    const players = await this.prisma.player.findMany()

    const ordered = players.sort((a, b) => {
      if (a.status === b.status) {
        return a.joinTimestamp.getTime() - b.joinTimestamp.getTime()
      }

      return a.status === ListStatus.MAIN ? -1 : 1
    })

    const lines = [
      '| Nome | Perfil | Status | Convidado |',
      '| --- | --- | --- | --- |',
      ...ordered.map(
        (player) =>
          `| ${player.name} | ${player.profile} | ${player.status} | ${player.isGuest ? 'Sim' : 'Não'} |`,
      ),
    ]

    return lines.join('\n')
  }

  async listCurrentPlayers(): Promise<
    Array<{
      name: string
      isGuest: boolean
      invitedBy?: { name: string; userId: string }
    }>
  > {
    const players = await this.prisma.player.findMany({
      orderBy: [{ status: 'asc' }, { joinTimestamp: 'asc' }],
      select: {
        name: true,
        isGuest: true,
        status: true,
        joinTimestamp: true,
        invitedBy: {
          select: {
            name: true,
            userId: true,
          },
        },
      },
    })

    return players
      .sort((a, b) => {
        if (a.status === b.status) {
          return a.joinTimestamp.getTime() - b.joinTimestamp.getTime()
        }

        return a.status === ListStatus.MAIN ? -1 : 1
      })
      .map(({ name, isGuest, invitedBy }) => ({
        name,
        isGuest,
        invitedBy: invitedBy
          ? {
              name: invitedBy.name,
              userId: invitedBy.userId,
            }
          : undefined,
      }))
  }
}
