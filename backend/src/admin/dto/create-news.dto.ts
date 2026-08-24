export class CreateNewsDto {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  imageUrl?: string;
}
