import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AcceptInviteDto } from './dto/accept-invite.dto'
import { CreateInviteDto } from './dto/create-invite.dto'
import { InvitesService } from './invites.service'

@ApiTags('invites')
@Controller()
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post('invites/create')
  @ApiOperation({
    summary: 'Gera um novo link de convite para um jogador titular usando o RG.',
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
