import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatMessageType } from '@prisma/client';

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  roomId: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: ChatMessageType, default: 'TEXT' })
  @IsOptional()
  @IsEnum(ChatMessageType)
  type?: ChatMessageType;
}
