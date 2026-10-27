import { IsNotEmpty, IsUUID } from 'class-validator';

export class CastVoteDto {
  @IsUUID()
  candidateId: string;

  @IsNotEmpty()
  @IsUUID()
  positionId: string;

  @IsNotEmpty()
  @IsUUID()
  sessionId: string;
}
