import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('message')
  submitMessage(@Body() data: { name: string; email: string; subject: string; message: string }) {
    return this.contactService.submitMessage(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages')
  getMessages() {
    return this.contactService.getMessages();
  }
}
