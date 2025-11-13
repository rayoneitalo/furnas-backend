import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { ListStateController } from './list-state.controller'
import { ListStateService } from './list-state.service'

@Module({
  imports: [PrismaModule],
  controllers: [ListStateController],
  providers: [ListStateService],
})
export class ListStateModule {}
