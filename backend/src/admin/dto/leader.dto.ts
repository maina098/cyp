import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateLeaderDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  bio?: string | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsEmail()
  contactEmail?: string | null;

  @IsOptional()
  @IsString()
  contactPhone?: string | null;

  @IsOptional()
  @IsUUID()
  userId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateLeaderDto extends PartialType(CreateLeaderDto) {}
