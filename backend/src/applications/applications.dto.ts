import { IsString, IsEmail, IsInt, IsOptional, Min, Max, IsUUID, IsIn, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApplicationDto {
  @ApiProperty({ description: 'Position ID to apply for' })
  @IsUUID()
  positionId: string;

  @ApiProperty({ description: 'Election ID' })
  @IsUUID()
  electionId: string;

  @ApiProperty({ example: 'John Doe', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'Mombasa' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  county: string;

  @ApiPropertyOptional({ example: 'Nyali' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  constituency?: string;

  @ApiProperty({ example: 25, minimum: 16, maximum: 120 })
  @IsInt()
  @Min(16)
  @Max(120)
  age: number;

  @ApiProperty({ description: 'Brief description about yourself', maxLength: 2000 })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({ description: 'Reason for applying', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reasonForApplying?: string;

  @ApiProperty({ description: 'What change would you like to champion for', maxLength: 1000 })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  changeChampion: string;

  @ApiPropertyOptional({ description: 'Additional comments', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comments?: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ['pending', 'approved', 'rejected', 'withdrawn'] })
  @IsString()
  @IsIn(['pending', 'approved', 'rejected', 'withdrawn'])
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
}
