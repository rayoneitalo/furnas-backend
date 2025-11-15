import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'

export class CreateInviteDto {
  @ApiProperty({
    description: 'RG do jogador titular que está gerando o convite.',
    example: '12.345.678-9',
  })
  @IsString()
  @MaxLength(20)
  rg: string
}
