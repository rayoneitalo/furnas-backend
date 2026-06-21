import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  login(dto: LoginDto): { access_token: string } {
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD')
    if (dto.password !== adminPassword) {
      throw new UnauthorizedException('Senha incorreta')
    }
    const token = this.jwtService.sign({ role: 'admin' })
    return { access_token: token }
  }
}
