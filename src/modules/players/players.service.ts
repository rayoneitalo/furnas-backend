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
      where: { rg: dto.rg },
    })

    if (existing) {
      throw new ConflictException(
        'A player with this RG already has an active entry in the list.',
      )
    }

    // Para calcular a capacidade da lista principal, exclui jogadores com perfil RESENHA
    const mainCount = await this.prisma.player.count({
      where: { 
        status: ListStatus.MAIN,
        profile: { not: 'RESENHA' }, // Não conta RESENHA na lista principal
      },
    })

    // Jogadores RESENHA sempre vão para MAIN (não ocupam vaga), outros seguem a lógica normal
    const status =
      dto.profile === 'RESENHA' || mainCount < MAIN_LIST_CAPACITY
        ? ListStatus.MAIN
        : ListStatus.WAITLIST

    return this.prisma.player.create({
      data: {
        name: dto.name,
        rg: dto.rg,
        phone: dto.phone,
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

    if (player.rg !== dto.rg) {
      throw new ForbiddenException(
        'You do not have permission to remove this player. RG does not match.',
      )
    }

    if (player.status === ListStatus.MAIN) {
      await this.prisma.$transaction(async (tx) => {
        await tx.player.delete({ where: { id: playerId } })

        // Promove o próximo da lista de espera, excluindo jogadores com perfil RESENHA
        const promotionCandidate = await tx.player.findFirst({
          where: { 
            status: ListStatus.WAITLIST,
            profile: { not: 'RESENHA' }, // Não promove RESENHA
          },
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
    Array<PlayerModel & { invitedBy?: { name: string; userId: string } }>
  > {
    const players = await this.prisma.player.findMany({
      orderBy: [{ status: 'asc' }, { joinTimestamp: 'asc' }],
      select: {
        id: true,
        userId: true,
        name: true,
        rg: true,
        phone: true,
        profile: true,
        status: true,
        joinTimestamp: true,
        isGuest: true,
        invitedByPlayerId: true,
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

        // Ordena: MAIN primeiro, depois WAITLIST
        return a.status === ListStatus.MAIN ? -1 : 1
      })
      .map((player) => ({
        id: player.id,
        userId: player.userId,
        name: player.name,
        rg: player.rg,
        phone: player.phone,
        profile: player.profile,
        status: player.status,
        joinTimestamp: player.joinTimestamp,
        isGuest: player.isGuest,
        invitedByPlayerId: player.invitedByPlayerId,
        invitedBy: player.invitedBy
          ? {
              name: player.invitedBy.name,
              userId: player.invitedBy.userId,
            }
          : undefined,
      }))
  }
}
