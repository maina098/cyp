import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { ResultsGateway } from '../results/results.gateway';

class VerifyOtpDto {
  otpId: string;
  otpCode: string;
}

@Controller()
export class VotesController {
  constructor(
    private votesService: VotesService,
    private resultsGateway: ResultsGateway,
  ) {}

  @Post('elections/:id/vote')
  @UseGuards(JwtAuthGuard)
  castVote(@Param('id') electionId: string, @Body() castVoteDto: CastVoteDto, @Request() req) {
    return this.votesService.castVote(electionId, castVoteDto, req.user.id, this.resultsGateway);
  }

  @Get('elections/:id/my-vote')
  @UseGuards(JwtAuthGuard)
  getUserVote(@Param('id') electionId: string, @Request() req) {
    return this.votesService.getUserVote(electionId, req.user.id);
  }

  @Post('elections/:id/vote/otp/request')
  @UseGuards(JwtAuthGuard)
  requestVotingOtp(@Param('id') electionId: string, @Request() req) {
    return this.votesService.requestVotingOtp(electionId, req.user.id);
  }

  @Post('elections/:id/vote/otp/verify')
  @UseGuards(JwtAuthGuard)
  verifyVotingOtp(@Param('id') electionId: string, @Body() body: VerifyOtpDto, @Request() req) {
    return this.votesService.verifyVotingOtp(electionId, req.user.id, body.otpId, body.otpCode);
  }

  @Post('elections/:id/vote/session')
  @UseGuards(JwtAuthGuard)
  createVotingSession(@Param('id') electionId: string, @Body() body: { otpId: string }, @Request() req) {
    return this.votesService.createVotingSession(electionId, req.user.id, body.otpId);
  }

  @Get('elections/:id/votes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getElectionVotes(@Param('id') electionId: string) {
    return this.votesService.getElectionVotes(electionId);
  }
}
