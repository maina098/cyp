import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ChangePasswordDto,
  CreateCommunityServiceDto,
  CreateEventParticipationDto,
  RecordContentReadDto,
  UpdateProfileDto,
} from './users.dto';
import { UsersService } from './users.service';

const allowedMemberUploadMimes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function normalizeUploadName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .slice(0, 120)
    || 'upload';
}

const uploadStorage = diskStorage({
  destination: (_request, _file, callback) => {
    const destination = './uploads/member-submissions';
    mkdirSync(destination, { recursive: true });
    callback(null, destination);
  },
  filename: (_request, file, callback) => callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
});

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Patch()
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('file', {
    storage: uploadStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      const allowed = file.mimetype.startsWith('image/') && allowedMemberUploadMimes.has(file.mimetype);
      callback(allowed ? null : new Error('Image uploads must be JPG, PNG, GIF, or WebP'), allowed);
    },
  }))
  uploadProfilePicture(@Request() req: any, @UploadedFile() file: { filename: string } | undefined) {
    if (!file) throw new BadRequestException('An image file is required');
    return this.usersService.updateProfile(req.user.id, { profileImageUrl: `/uploads/member-submissions/${file.filename}` });
  }

  @Post('uploads')
  @UseInterceptors(FileInterceptor('file', {
    storage: uploadStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_request, file, callback) => {
      const allowed = allowedMemberUploadMimes.has(file.mimetype) || file.mimetype.startsWith('image/');
      callback(allowed ? null : new Error('Unsupported file type'), allowed);
    },
  }))
  uploadMemberFile(@UploadedFile() file: { filename: string; originalname: string; mimetype: string; size: number } | undefined) {
    if (!file) throw new BadRequestException('A picture, PDF, or Word document is required');
    return {
      url: `/uploads/member-submissions/${file.filename}`,
      originalName: file.originalname,
      mediaType: file.mimetype,
      size: file.size,
    };
  }

  @Patch('password')
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.usersService.getDashboard(req.user.id);
  }

  @Get('activities')
  getActivities(@Request() req: any) {
    return this.usersService.getActivities(req.user.id);
  }

  @Post('content-reads')
  recordContentRead(@Request() req: any, @Body() dto: RecordContentReadDto) {
    return this.usersService.recordContentRead(req.user.id, dto);
  }

  @Get('events')
  getEvents(@Request() req: any) {
    return this.usersService.getEvents(req.user.id);
  }

  @Post('events/:eventId/participation')
  addEventParticipation(@Request() req: any, @Param('eventId') eventId: string, @Body() dto: CreateEventParticipationDto) {
    return this.usersService.addEventParticipation(req.user.id, eventId, dto);
  }

  @Post('community-services')
  addCommunityService(@Request() req: any, @Body() dto: CreateCommunityServiceDto) {
    return this.usersService.addCommunityService(req.user.id, dto);
  }
}
