import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { InvitesModule } from './modules/invites/invites.module'
import { ListStateModule } from './modules/list-state/list-state.module'
import { PlayersModule } from './modules/players/players.module'
import { PrismaModule } from './modules/prisma/prisma.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development'],
    }),
    PrismaModule,
    AuthModule,
    PlayersModule,
    ListStateModule,
    InvitesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
