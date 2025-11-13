import { Injectable } from '@nestjs/common';

import { ListState } from '@prisma/client';
import { getNextMondayMidnight } from '../../common/utils/date.utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListStateService {
  constructor(private readonly prisma: PrismaService) { }

  async getState(): Promise<ListState | null> {
    return this.prisma.listState.findUnique({ where: { id: 1 } });
  }

  async reset(): Promise<ListState> {
    const nextMonday = getNextMondayMidnight();

    return this.prisma.$transaction(async (tx) => {
      await tx.player.deleteMany();

      return tx.listState.upsert({
        where: { id: 1 },
        create: {
          id: 1,
          listOpenTimestamp: nextMonday,
          listResetCount: 0,
        },
        update: {
          listOpenTimestamp: nextMonday,
          listResetCount: { increment: 1 },
        },
      });
    });
  }
}
