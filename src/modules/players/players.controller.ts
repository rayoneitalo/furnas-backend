import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreatePlayerDto } from './dto/create-player.dto'
import { RemovePlayerDto } from './dto/remove-player.dto'
import { PlayersService } from './players.service'

@ApiTags('players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtém a lista atual de jogadores com indicação de convidados.',
  })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  list() {
    return this.playersService.listCurrentPlayers()
  }

  @Post()
  @ApiOperation({ summary: 'Inscreve um jogador na lista.' })
  @ApiResponse({ status: 201, description: 'Jogador inscrito com sucesso.' })
  create(@Body() dto: CreatePlayerDto) {
    return this.playersService.create(dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um jogador da lista.' })
  @ApiBody({ type: RemovePlayerDto })
  @ApiResponse({ status: 200, description: 'Jogador removido com sucesso.' })
  async remove(@Param('id') id: string, @Body() dto: RemovePlayerDto) {
    await this.playersService.remove(id, dto)
    return { message: 'Player removed successfully.' }
  }

  @Get('export')
  @ApiOperation({ summary: 'Exporta a lista completa em formato Markdown.' })
  @ApiResponse({
    status: 200,
    description: 'Markdown contendo a lista de jogadores.',
  })
  export() {
    return this.playersService.exportList()
  }
}
