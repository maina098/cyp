import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResultsGateway } from '../results/results.gateway';

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

  @Get('elections/:id/votes')
  @UseGuards(JwtAuthGuard)
  getElectionVotes(@Param('id') electionId: string) {
    return this.votesService.getElectionVotes(electionId);
  }
}
