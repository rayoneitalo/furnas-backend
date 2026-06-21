import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AcceptInviteDto } from './dto/accept-invite.dto'
import { CreateInviteDto } from './dto/create-invite.dto'
import { InvitesService } from './invites.service'

@ApiTags('invites')
@Controller()
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Get('invites/window')
  @ApiOperation({ summary: 'Retorna se a janela de convites está aberta.' })
  getInviteWindow() {
    return this.invitesService.getInviteWindowStatus()
  }

  @Post('invites/create')
  @ApiOperation({
    summary: 'Gera um novo link de convite. Requer RG de jogador titular não-convidado.',
  })
  @ApiResponse({ status: 201, description: 'Convite gerado com sucesso.' })
  createInvite(@Body() dto: CreateInviteDto) {
    return this.invitesService.createInvite(dto)
  }

  @Post('invites/accept')
  @ApiOperation({
    summary: 'Aceita um convite e cria a inscrição do convidado.',
  })
  @ApiResponse({ status: 201, description: 'Convite aceito e jogador criado.' })
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.invitesService.acceptInvite(dto)
  }
}
