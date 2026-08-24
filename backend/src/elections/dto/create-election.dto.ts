import { IsString, IsOptional, IsDateString, IsArray, IsEnum } from 'class-validator';

export class CreateElectionDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['draft', 'scheduled', 'active', 'closed'])
  status?: 'draft' | 'scheduled' | 'active' | 'closed';

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsArray()
  candidates: Array<{
    name: string;
    bio?: string;
    photoUrl?: string;
    position?: number;
  }>;
}
