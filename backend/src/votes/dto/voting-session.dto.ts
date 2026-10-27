import { IsString, IsUUID, Matches } from 'class-validator';

export class VerifyVotingOtpDto {
  @IsUUID()
  otpId: string;

  @IsString()
  @Matches(/^\d{6}$/)
  otpCode: string;
}

export class CreateVotingSessionDto {
  @IsUUID()
  otpId: string;
}
