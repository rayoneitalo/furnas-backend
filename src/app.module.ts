import { Module } from '@nestjs/common'
import { InvitesModule } from './modules/invites/invites.module'
import { ListStateModule } from './modules/list-state/list-state.module'
import { PlayersModule } from './modules/players/players.module'
import { PrismaModule } from './modules/prisma/prisma.module'

@Module({
  imports: [PrismaModule, PlayersModule, ListStateModule, InvitesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
