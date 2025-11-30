import { ApiProperty } from '@nestjs/swagger'
import { PlayerProfile } from 'prisma/generated/client'
import { IsEnum, IsString, IsUUID, Matches, MaxLength } from 'class-validator'

export class AcceptInviteDto {
  @ApiProperty({ description: 'Token do convite recebido.' })
  @IsUUID()
  token: string

  @ApiProperty({ description: 'Nome completo do convidado (primeiro e segundo nome).' })
  @IsString()
  @MaxLength(255)
  name: string

  @ApiProperty({ description: 'Número do RG do convidado.' })
  @IsString()
  @MaxLength(20)
  rg: string

  @ApiProperty({
    description: 'Telefone celular no formato (99)99999-9999',
    example: '(11)98765-4321',
  })
  @IsString()
  @Matches(/^\(\d{2}\)\d{5}-\d{4}$/, {
    message: 'Phone must be in format (99)99999-9999',
  })
  phone: string

  @ApiProperty({
    enum: PlayerProfile,
    description: 'Perfil escolhido pelo convidado.',
  })
  @IsEnum(PlayerProfile)
  profile: PlayerProfile
}
