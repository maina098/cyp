import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('news')
  getNews() {
    return this.adminService.getNews();
  }

  @Post('news')
  createNews(@Body() data: any) {
    return this.adminService.createNews(data);
  }

  @Patch('news/:id')
  updateNews(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateNews(id, data);
  }

  @Delete('news/:id')
  deleteNews(@Param('id') id: string) {
    return this.adminService.deleteNews(id);
  }

  @Get('events')
  getEvents() {
    return this.adminService.getEvents();
  }

  @Get('member-submissions/events')
  getMemberEventSubmissions() {
    return this.adminService.getMemberEventSubmissions();
  }

  @Get('member-submissions/community-services')
  getMemberCommunityServices() {
    return this.adminService.getMemberCommunityServices();
  }

  @Post('events')
  createEvent(@Body() data: any) {
    return this.adminService.createEvent(data);
  }

  @Patch('events/:id')
  updateEvent(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateEvent(id, data);
  }

  @Delete('events/:id')
  deleteEvent(@Param('id') id: string) {
    return this.adminService.deleteEvent(id);
  }

  @Get('resources')
  getResources() {
    return this.adminService.getResources();
  }

  @Post('resources')
  createResource(@Body() data: any) {
    return this.adminService.createResource(data);
  }

  @Post('resources/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_request, _file, callback) => { mkdirSync('./uploads/resources', { recursive: true }); callback(null, './uploads/resources'); },
      filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: 25 * 1024 * 1024 },
  }))
  uploadResource(@UploadedFile() file: { filename: string; originalname: string; mimetype: string; size: number } | undefined) {
    if (!file) throw new BadRequestException('A resource file is required');
    return { url: `/uploads/resources/${file.filename}`, originalName: file.originalname, mediaType: file.mimetype, size: file.size };
  }

  @Patch('resources/:id')
  updateResource(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateResource(id, data);
  }

  @Delete('resources/:id')
  deleteResource(@Param('id') id: string) {
    return this.adminService.deleteResource(id);
  }

  // Election Positions Management
  @Post('elections/:electionId/positions')
  createPosition(
    @Param('electionId') electionId: string,
    @Body() data: { title: string; description?: string; maxApplicants?: number }
  ) {
    return this.adminService.createPosition(electionId, data);
  }

  @Get('elections/:electionId/positions')
  getPositions(@Param('electionId') electionId: string) {
    return this.adminService.getPositions(electionId);
  }

  @Patch('positions/:positionId/open')
  async openPosition(
    @Param('positionId') positionId: string,
    @Body() body: { electionId: string }
  ) {
    if (!body.electionId) {
      throw new BadRequestException('electionId is required');
    }
    return this.adminService.openPosition(body.electionId, positionId);
  }

  @Patch('positions/:positionId/close')
  async closePosition(
    @Param('positionId') positionId: string,
    @Body() body: { electionId: string }
  ) {
    if (!body.electionId) {
      throw new BadRequestException('electionId is required');
    }
    return this.adminService.closePosition(body.electionId, positionId);
  }

  @Get('positions/:positionId/applications')
  getApplicationsByPosition(@Param('positionId') positionId: string) {
    return this.adminService.getApplicationsByPosition(positionId);
  }

  @Get('elections/:electionId/applications/stats')
  getApplicationStats(@Param('electionId') electionId: string) {
    return this.adminService.getApplicationStats(electionId);
  }

  // User Activity Tracking
  @Get('activity')
  @ApiOperation({ summary: 'Get user activity with pagination' })
  getUserActivity(
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.adminService.getUserActivity(limitNum, pageNum);
  }

  @Get('activity/stats')
  @ApiOperation({ summary: 'Get user activity statistics' })
  getUserActivityStats() {
    return this.adminService.getUserActivityStats();
  }

  // Applications Management
  @Get('applications')
  @ApiOperation({ summary: 'Get all applications with pagination' })
  getAllApplications(
    @Query() query: { electionId?: string; positionId?: string; status?: string; county?: string; page?: string; limit?: string },
  ) {
    const { electionId, positionId, status, county, page, limit } = query;
    return this.adminService.getAllApplications(
      { electionId, positionId, status, county },
      { page: page ? parseInt(page, 10) : 1, limit: limit ? parseInt(limit, 10) : 50 },
    );
  }

  @Patch('applications/:applicationId/status')
  updateApplicationStatus(
    @Param('applicationId') applicationId: string,
    @Body() body: { status: string }
  ) {
    return this.adminService.updateApplicationStatus(applicationId, body.status);
  }
}
