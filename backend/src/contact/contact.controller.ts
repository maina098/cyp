import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('message')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  submitMessage(@Body() data: { name: string; email: string; subject: string; message: string }) {
    return this.contactService.submitMessage(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('messages')
  getMessages() {
    return this.contactService.getMessages();
  }
}
