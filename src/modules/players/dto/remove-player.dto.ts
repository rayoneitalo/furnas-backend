import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'

export class RemovePlayerDto {
  @ApiProperty({
    description: 'Número do RG do jogador para confirmar a remoção.',
  })
  @IsString()
  @MaxLength(20)
  rg: string
}
