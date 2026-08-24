import { PartialType } from '@nestjs/mapped-types';
import { CreateElectionDto } from './create-election.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateElectionDto extends PartialType(CreateElectionDto) {
  @IsOptional()
  @IsEnum(['draft', 'scheduled', 'active', 'closed'])
  status?: 'draft' | 'scheduled' | 'active' | 'closed';
}
