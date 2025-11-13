import { ApiProperty } from '@nestjs/swagger'
import { PlayerProfile } from '@prisma/client'
import { IsEnum, IsString, MaxLength } from 'class-validator'

export class CreatePlayerDto {
  @ApiProperty({ description: 'Identificador único do usuário na aplicação.' })
  @IsString()
  @MaxLength(255)
  userId: string

  @ApiProperty({ description: 'Nome do jogador apresentado na lista.' })
  @IsString()
  @MaxLength(255)
  name: string

  @ApiProperty({
    enum: PlayerProfile,
    description: 'Perfil do jogador conforme regras de negócio.',
  })
  @IsEnum(PlayerProfile)
  profile: PlayerProfile
}
