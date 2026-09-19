import "dotenv/config";
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Seed Admin User
  const adminEmail = 'kibwanacyp@gmail.com';
  const passwordHash = await bcrypt.hash('Kibwana@8084', 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Kibwana',
      passwordHash,
      role: 'ADMIN',
      failedAttempts: 0,
      lockedUntil: null,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: adminEmail,
      name: 'Kibwana',
      passwordHash,
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
    },
  });
  console.log('Admin user seeded (kibwanacyp@gmail.com)');

  // 2. Seed verified dashboard user
  const userEmail = 'malomoanderson@gmail.com';
  const userPasswordHash = await bcrypt.hash('maina@8084.1', 12);
  await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      name: 'Malomo Anderson',
      passwordHash: userPasswordHash,
      role: 'USER',
      failedAttempts: 0,
      lockedUntil: null,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: userEmail,
      name: 'Malomo Anderson',
      passwordHash: userPasswordHash,
      role: 'USER',
      emailVerifiedAt: new Date(),
    },
  });
  console.log('Verified user seeded (malomoanderson@gmail.com)');

  // 3. Seed Governors
  const governors = [
    {
      name: 'H.E. Abdulswamad Shariff Nassir',
      county: 'Mombasa',
      role: 'Governor',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    },
    {
      name: 'H.E. Fatuma Achani',
      county: 'Kwale',
      role: 'Vice Chair',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    },
    {
      name: 'H.E. Gideon Mung\'aro',
      county: 'Kilifi',
      role: 'Chairman',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80',
    },
    {
      name: 'H.E. Dhadho Godhana',
      county: 'Tana River',
      role: 'Governor',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    },
    {
      name: 'H.E. Issa Timamy',
      county: 'Lamu',
      role: 'Governor',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
    {
      name: 'H.E. Andrew Mwadime',
      county: 'Taita Taveta',
      role: 'Governor',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    },
  ];

  for (const gov of governors) {
    const existing = await prisma.governor.findFirst({
      where: { county: gov.county },
    });
    if (!existing) {
      await prisma.governor.create({ data: gov });
      console.log(`Seeded Governor of ${gov.county}`);
    }
  }

  // 3. Seed Secretariat
  const secretariat = [
    {
      name: 'Dr. Emmanuel Nzuki',
      role: 'Chief Executive Officer',
      bio: 'Dr. Nzuki has over 15 years of experience in regional integration and economic planning at the coast.',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    },
    {
      name: 'Sarah Mwangi',
      role: 'Program Manager - Blue Economy',
      bio: 'Sarah leads JKP\'s initiatives in promoting marine resources conservation and aquaculture.',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    },
  ];

  for (const sec of secretariat) {
    const existing = await prisma.secretariatMember.findFirst({
      where: { name: sec.name },
    });
    if (!existing) {
      await prisma.secretariatMember.create({ data: sec });
      console.log(`Seeded Secretariat Member: ${sec.name}`);
    }
  }

  // 4. Seed News
  const newsPosts: Prisma.NewsCreateInput[] = [];

  for (const post of newsPosts) {
    const existing = await prisma.news.findUnique({
      where: { slug: post.slug },
    });
    if (!existing) {
      await prisma.news.create({ data: post });
      console.log(`Seeded News Post: ${post.title}`);
    }
  }

  // 5. Seed Events
  const events = [
    {
      title: 'Coastal Youth Innovation Summit',
      description: 'A 2-day workshop focused on digital skills, entrepreneurship, and ocean solutions.',
      location: 'Mombasa Beach Hotel, Mombasa',
      date: new Date('2026-09-22T08:00:00Z'),
      status: 'UPCOMING',
      imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80',
    },
  ];

  for (const event of events) {
    const existing = await prisma.event.findFirst({
      where: { title: event.title },
    });
    if (!existing) {
      await prisma.event.create({ data: event });
      console.log(`Seeded Event: ${event.title}`);
    }
  }

  // 6. Seed Resources
  const resources = [
    {
      title: 'Jumuiya Economic Blueprint 2030',
      description: 'The master plan for the economic development of the six coastal counties.',
      fileUrl: '/resources/JKP_Blueprint_2030.pdf',
      category: 'Blueprints',
      downloadsCount: 142,
    },
    {
      title: 'JABEIC 2026 Brochure',
      description: 'Sponsorship packages and event schedule for the JABEIC conference.',
      fileUrl: '/resources/JABEIC_2026_Brochure.pdf',
      category: 'Reports',
      downloadsCount: 57,
    },
  ];

  for (const res of resources) {
    const existing = await prisma.resource.findFirst({
      where: { title: res.title },
    });
    if (!existing) {
      await prisma.resource.create({ data: res });
      console.log(`Seeded Resource: ${res.title}`);
    }
  }

  // 7. Seed Election Positions
  // First, get or create the main CYP election
  let election = await prisma.election.findFirst({
    where: { title: { contains: 'CYP' } },
  });

  if (!election) {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@jkp.org' },
    });
    election = await prisma.election.create({
      data: {
        title: '2026 CYP Elections',
        description: 'Election for the CYP leadership positions',
        status: 'draft',
        startsAt: new Date('2026-10-01T08:00:00Z'),
        endsAt: new Date('2026-10-02T18:00:00Z'),
        createdBy: admin?.id || 'system',
      },
    });
  }

  // Seed the 5 election positions
  const positions = [
    {
      title: 'COUNTY YOUTH GOVERNOR',
      description: 'Responsible for leading youth programs at the county level',
    },
    {
      title: 'SECRETARY GENERAL',
      description: 'Handles administrative and documentation duties',
    },
    {
      title: 'DELEGATE FOR GENDER AND INCLUSION',
      description: 'Ensures gender equality and inclusion in all programs',
    },
    {
      title: 'DELEGATE FOR PWDS AND SPECIAL INTERESTS',
      description: 'Advocates for persons with disabilities and special interest groups',
    },
    {
      title: 'LIAISON OFFICER',
      description: 'Facilitates communication between CYP and external stakeholders',
    },
  ];

  for (const pos of positions) {
    const existing = await prisma.electionPosition.findFirst({
      where: {
        electionId: election.id,
        title: pos.title,
      },
    });
    if (!existing) {
      await prisma.electionPosition.create({
        data: {
          electionId: election.id,
          title: pos.title,
          description: pos.description,
          isOpen: false, // Start with positions closed, admin opens them later
          maxApplicants: 100,
        },
      });
      console.log(`Seeded Election Position: ${pos.title}`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
