import { ApiProperty } from '@nestjs/swagger';
import { PlayerProfile } from '@prisma/client';
import { IsEnum, IsString, IsUUID, MaxLength } from 'class-validator';

export class AcceptInviteDto {
  @ApiProperty({ description: 'Token do convite recebido.' })
  @IsUUID()
  token: string;

  @ApiProperty({ description: 'Identificador do usuário convidado.' })
  @IsString()
  @MaxLength(255)
  userId: string;

  @ApiProperty({ description: 'Nome do convidado.' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ enum: PlayerProfile, description: 'Perfil escolhido pelo convidado.' })
  @IsEnum(PlayerProfile)
  profile: PlayerProfile;
}
