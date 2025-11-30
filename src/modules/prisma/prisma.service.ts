import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from 'prisma/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'


@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit {

  private readonly _logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {

    const connectionString = configService.get<string>('DATABASE_URL');
    const adapter = new PrismaPg({ connectionString });

    super({ adapter });
  }

  async onModuleInit() {

    try {

      await this.$connect();

      this._logger.log('Database connected successfully');


    } catch (err) {

      this._logger.error('Failed to connect to the database', err);

      throw err

    }
  }
}
