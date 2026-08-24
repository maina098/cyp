import { Controller, Get } from '@nestjs/common';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('overview')
  getOverview() {
    return this.contentService.getDashboardOverview();
  }

  @Get('news')
  getNews() {
    return this.contentService.getPublishedNews();
  }

  @Get('events')
  getEvents() {
    return this.contentService.getUpcomingEvents();
  }

  @Get('resources')
  getResources() {
    return this.contentService.getResources();
  }

  @Get('governors')
  getGovernors() {
    return this.contentService.getGovernors();
  }

  @Get('secretariat')
  getSecretariat() {
    return this.contentService.getSecretariat();
  }
}
