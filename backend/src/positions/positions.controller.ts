import { Controller, Get, Patch, Param, Body, UseGuards, BadRequestException, Query } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('positions')
export class PositionsController {
  constructor(private positionsService: PositionsService) {}

  /**
   * GET /positions - Get positions for an election (with optional query parameters)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getPositions(@Query('electionId') electionId?: string) {
    if (!electionId) {
      throw new BadRequestException('electionId query parameter is required');
    }
    return this.positionsService.findAll(electionId);
  }

  /**
   * GET /positions/election/:electionId - Get all positions for an election (admin)
   */
  @Get('election/:electionId')
  @UseGuards(JwtAuthGuard)
  async getAllPositions(@Param('electionId') electionId: string) {
    return this.positionsService.findAll(electionId);
  }

  /**
   * GET /positions/open/:electionId - Get only open positions available for user applications
   */
  @Get('open/:electionId')
  async getOpenPositions(@Param('electionId') electionId: string) {
    return this.positionsService.findOpen(electionId);
  }

  /**
   * GET /positions/:id - Get a single position with applications
   */
  @Get(':id')
  async getPosition(@Param('id') id: string) {
    const position = await this.positionsService.findOne(id);
    if (!position) {
      throw new BadRequestException('Position not found');
    }
    return position;
  }

  /**
   * PATCH /positions/:id/status - Open or close a position (admin only)
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updatePositionStatus(
    @Param('id') id: string,
    @Body() body: { isOpen: boolean },
  ) {
    if (typeof body.isOpen !== 'boolean') {
      throw new BadRequestException('isOpen must be a boolean');
    }
    return this.positionsService.updateStatus(id, body.isOpen);
  }

  /**
   * GET /positions/stats/:electionId - Get position statistics
   */
  @Get('stats/:electionId')
  @UseGuards(JwtAuthGuard)
  async getStats(@Param('electionId') electionId: string) {
    return this.positionsService.getPositionStats(electionId);
  }
}
