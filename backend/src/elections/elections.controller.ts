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
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ElectionsService } from './elections.service';
import { CreateElectionDto } from './dto/create-election.dto';
import { UpdateElectionDto } from './dto/update-election.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('elections')
@Controller('elections')
export class ElectionsController {
  constructor(private electionsService: ElectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new election' })
  create(@Body() createElectionDto: CreateElectionDto, @Request() req) {
    return this.electionsService.create(createElectionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all elections with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() pagination: PaginationDto) {
    return this.electionsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get election by ID' })
  findOne(@Param('id') id: string) {
    return this.electionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an election' })
  update(
    @Param('id') id: string,
    @Body() updateElectionDto: UpdateElectionDto,
    @Request() req,
  ) {
    return this.electionsService.update(id, updateElectionDto, req.user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update election status' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'draft' | 'scheduled' | 'active' | 'closed' },
    @Request() req,
  ) {
    return this.electionsService.updateStatus(id, body.status, req.user.id);
  }

  @Patch(':id/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule an election' })
  schedule(
    @Param('id') id: string,
    @Body() body: { startsAt?: string; endsAt?: string },
    @Request() req,
  ) {
    return this.electionsService.scheduleElection(id, body, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an election' })
  delete(@Param('id') id: string, @Request() req) {
    return this.electionsService.delete(id, req.user.id);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get election results' })
  getResults(@Param('id') id: string) {
    return this.electionsService.getResults(id);
  }
}
