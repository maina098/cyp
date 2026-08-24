import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  Query,
  Request,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './applications.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  /**
   * POST /applications - Submit a new application
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateApplicationDto, @Request() req: any) {
    return this.applicationsService.create(dto, req.user.id);
  }

  /**
   * GET /applications/mine - Get user's own applications
   */
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async getUserApplications(@Request() req: any) {
    return this.applicationsService.findByUser(req.user.id);
  }

  /**
   * GET /applications - Get all applications (admin) with optional filters
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(@Query() filters: any) {
    return this.applicationsService.findAll({
      electionId: filters.electionId,
      positionId: filters.positionId,
      status: filters.status,
      county: filters.county,
    });
  }

  /**
   * GET /applications/:id - Get a single application
   * Users can only view their own applications, admins can view all
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(@Param('id') id: string, @Request() req: any) {
    const application = await this.applicationsService.findOne(id);
    if (!application) {
      throw new BadRequestException('Application not found');
    }
    // Allow admin or owner to view
    if (application.userId !== req.user.id && req.user.role !== 'ADMIN') {
      throw new BadRequestException('You do not have permission to view this application');
    }
    return application;
  }

  /**
   * PATCH /applications/:id/status - Update application status (admin only)
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @Request() req: any,
  ) {
    return this.applicationsService.updateStatus(id, dto, req.user.id, req.user.role);
  }

  /**
   * GET /applications/position/:positionId - Get all applications for a position
   */
  @Get('position/:positionId')
  @UseGuards(JwtAuthGuard)
  async getByPosition(@Param('positionId') positionId: string) {
    return this.applicationsService.findByPosition(positionId);
  }

  /**
   * GET /applications/stats/:electionId - Get application statistics
   */
  @Get('stats/:electionId')
  @UseGuards(JwtAuthGuard)
  async getStats(@Param('electionId') electionId: string) {
    return this.applicationsService.getApplicationStats(electionId);
  }
}
