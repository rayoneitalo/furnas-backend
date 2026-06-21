import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ListStateService } from './list-state.service'

@ApiTags('list-state')
@Controller('list-state')
export class ListStateController {
  constructor(private readonly listStateService: ListStateService) {}

  @Get()
  @ApiOperation({ summary: 'Obtém o estado atual da lista.' })
  @ApiResponse({
    status: 200,
    description: 'Estado atual retornado com sucesso.',
  })
  getState() {
    return this.listStateService.getState()
  }

  @Post('reset')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reseta a lista e define o próximo horário de abertura.',
  })
  @ApiResponse({ status: 201, description: 'Lista resetada com sucesso.' })
  reset() {
    return this.listStateService.reset()
  }
}
