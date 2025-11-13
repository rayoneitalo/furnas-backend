import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'

export class CreateInviteDto {
  @ApiProperty({
    description:
      'Identificador do usuário titular que está enviando o convite.',
  })
  @IsString()
  @MaxLength(255)
  hostUserId: string
}
