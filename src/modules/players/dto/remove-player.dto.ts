import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength } from 'class-validator'

export class RemovePlayerDto {
  @ApiProperty({
    description: 'Identificador do usuário que realizou a inscrição.',
  })
  @IsString()
  @MaxLength(255)
  userId: string
}
