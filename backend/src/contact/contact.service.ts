import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private prisma: PrismaService) {}

  async submitMessage(data: { name: string; email: string; subject: string; message: string }) {
    try {
      this.logger.log(`Submitting contact message from ${data.email}`);
      return await this.prisma.contactMessage.create({ data });
    } catch (error) {
      this.logger.error(`Failed to create contact message: ${error.message}`);
      throw new BadRequestException('Failed to submit message. Please try again.');
    }
  }

  async getMessages() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
