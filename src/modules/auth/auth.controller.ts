import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autentica o admin e retorna um JWT.' })
  @ApiResponse({ status: 201, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Senha incorreta.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }
}
