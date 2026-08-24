export class CreateEventDto {
  title: string;
  description: string;
  location: string;
  date: Date;
  status?: string;
  imageUrl?: string;
}
