import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ElectionOrchestratorService } from './election-orchestrator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('elections')
export class ElectionOrchestratorController {
  constructor(private orchestrator: ElectionOrchestratorService) {}

  /**
   * POST /elections/:id/initialize
   * Initialize election with default CYP positions
   */
  @Post(':id/initialize')
  @UseGuards(JwtAuthGuard)
  initializeElection(@Param('id') electionId: string, @Request() req) {
    return this.orchestrator.initializeElectionWithPositions(electionId, req.user.id, req.user.role);
  }

  /**
   * PATCH /elections/:id/status
   * Transition election status with cascading effects
   */
  @Patch(':id/transition-status')
  @UseGuards(JwtAuthGuard)
  transitionStatus(
    @Param('id') electionId: string,
    @Body() body: { status: 'draft' | 'scheduled' | 'active' | 'closed' },
    @Request() req,
  ) {
    return this.orchestrator.transitionElectionStatus(
      electionId,
      body.status,
      req.user.id,
      req.user.role,
    );
  }

  @Post(':id/candidates')
  @UseGuards(JwtAuthGuard)
  addCandidate(
    @Param('id') electionId: string,
    @Body() body: { name: string; bio?: string; photoUrl?: string; position?: number; positionId?: string },
    @Request() req,
  ) {
    return this.orchestrator.addCandidate(electionId, body, req.user.id, req.user.role);
  }

  @Delete(':id/candidates/:candidateId')
  @UseGuards(JwtAuthGuard)
  removeCandidate(
    @Param('id') electionId: string,
    @Param('candidateId') candidateId: string,
    @Request() req,
  ) {
    return this.orchestrator.removeCandidate(electionId, candidateId, req.user.id, req.user.role);
  }

  /**
   * POST /elections/:id/open-positions
   * Admin opens specific positions for applications
   */
  @Post(':id/open-positions')
  @UseGuards(JwtAuthGuard)
  openPositions(
    @Param('id') electionId: string,
    @Body() body: { positionIds: string[] },
    @Request() req,
  ) {
    return this.orchestrator.openPositionsForApplications(
      electionId,
      body.positionIds,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * POST /elections/:id/close-positions
   * Admin closes specific positions for applications
   */
  @Post(':id/close-positions')
  @UseGuards(JwtAuthGuard)
  closePositions(
    @Param('id') electionId: string,
    @Body() body: { positionIds: string[] },
    @Request() req,
  ) {
    return this.orchestrator.closePositionsForApplications(
      electionId,
      body.positionIds,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * GET /elections/:id/dashboard-stats
   * Comprehensive dashboard statistics
   */
  @Get(':id/dashboard-stats')
  getDashboardStats(@Param('id') electionId: string) {
    return this.orchestrator.getElectionDashboardStats(electionId);
  }

  /**
   * GET /elections/:id/timeline
   * Election lifecycle timeline
   */
  @Get(':id/timeline')
  getTimeline(@Param('id') electionId: string) {
    return this.orchestrator.getElectionTimeline(electionId);
  }

  /**
   * GET /elections/:id/applications
   * Get all applications for election with filters
   */
  @Get(':id/applications')
  @UseGuards(JwtAuthGuard)
  getApplications(
    @Param('id') electionId: string,
    @Query() filters: { status?: string; positionId?: string; county?: string },
  ) {
    return this.orchestrator.getElectionApplications(electionId, filters);
  }

  /**
   * POST /elections/:id/applications/:appId/approve
   * Approve application and create candidate
   */
  @Post(':id/applications/:appId/approve')
  @UseGuards(JwtAuthGuard)
  approveApplication(
    @Param('id') electionId: string,
    @Param('appId') applicationId: string,
    @Request() req,
  ) {
    return this.orchestrator.approveApplicationAndCreateCandidate(
      applicationId,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * POST /elections/:id/applications/:appId/reject
   * Reject application
   */
  @Post(':id/applications/:appId/reject')
  @UseGuards(JwtAuthGuard)
  rejectApplication(
    @Param('id') electionId: string,
    @Param('appId') applicationId: string,
    @Request() req,
  ) {
    return this.orchestrator.rejectApplication(applicationId, req.user.id, req.user.role);
  }

  /**
   * GET /system/activity
   * Real-time system activity feed for admin
   */
  @Get('system/activity')
  @UseGuards(JwtAuthGuard)
  getSystemActivity(@Query('limit') limit: string) {
    return this.orchestrator.getSystemActivity(limit ? parseInt(limit, 10) : 50);
  }
}
