import { IsIn, IsString, MinLength } from 'class-validator';

export class CreateBroadcastDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsIn(['ANNOUNCEMENT', 'MEMO'])
  type: 'ANNOUNCEMENT' | 'MEMO';
}
