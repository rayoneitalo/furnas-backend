import { Injectable } from '@nestjs/common'

import { ListState } from '@prisma/client'
import {
  getCurrentWeekListOpening,
  getListClosingFromOpening,
  getNextWeekListOpening,
} from '../../common/utils/date.utils'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ListStateService {
  constructor(private readonly prisma: PrismaService) {}

  async getState(): Promise<ListState | null> {
    return this.prisma.listState.findUnique({ where: { id: 1 } })
  }

  async reset(): Promise<ListState> {
    const now = new Date()
    const currentOpening = getCurrentWeekListOpening(now)
    const currentClosing = getListClosingFromOpening(currentOpening)
    const targetOpening =
      now > currentClosing
        ? getNextWeekListOpening(currentOpening)
        : currentOpening

    await this.prisma.player.deleteMany()

    return this.prisma.listState.upsert({
      where: { id: 1 },
      create: { id: 1, listOpenTimestamp: targetOpening, listResetCount: 0 },
      update: { listOpenTimestamp: targetOpening, listResetCount: { increment: 1 } },
    })
  }
}
