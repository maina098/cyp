CREATE TABLE "Leader" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bio" TEXT,
    "imageUrl" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "userId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leader_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MemberBroadcast" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ANNOUNCEMENT',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberBroadcast_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Leader_userId_key" ON "Leader"("userId");
CREATE INDEX "Leader_sortOrder_idx" ON "Leader"("sortOrder");
CREATE INDEX "MemberBroadcast_publishedAt_idx" ON "MemberBroadcast"("publishedAt");
CREATE INDEX "MemberBroadcast_type_publishedAt_idx" ON "MemberBroadcast"("type", "publishedAt");

ALTER TABLE "Leader"
ADD CONSTRAINT "Leader_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MemberBroadcast"
ADD CONSTRAINT "MemberBroadcast_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "User"
SET "role" = 'ADMIN', "sessionVersion" = "sessionVersion" + 1
WHERE "email" = 'kibwanacyp@gmail.com';

INSERT INTO "Leader" ("id", "name", "title", "bio", "imageUrl", "contactEmail", "userId", "sortOrder", "updatedAt")
VALUES
  ('00000000-0000-4000-8000-000000000001', 'KIBWANA H. JUMA', 'Pioneer and President', 'Leads the Parliament’s vision, strategic priorities, executive team, and partnerships advancing coastal youth participation and development.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/Hon.Kibwana.jpeg.jpeg', 'kibwanacyp@gmail.com', (SELECT "id" FROM "User" WHERE "email" = 'kibwanacyp@gmail.com' LIMIT 1), 0, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000002', 'HON. KHADIJA JILLO', 'Deputy President', 'Coordinates executive priorities, monitors agreed actions, and supports continuity and accountability across the leadership team.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-10-21%20at%204.06.09%20AM.jpeg', NULL, NULL, 1, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000003', 'HON. NASSIB JUMA', 'Prime Cabinet Secretary', 'Coordinates work across the Cabinet, supports aligned plans, and follows up on cross-department decisions.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2011.56.41%20AM.jpeg', NULL, NULL, 2, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000004', 'HON. ALI KUBO', 'Speaker of the House', 'Maintains orderly parliamentary proceedings and promotes fair representation and legislative oversight.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/630959814_26425337237072696_7273013418810656639_n.jpg', NULL, NULL, 3, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000005', 'HON. DULLA', 'Secretary General', 'Coordinates official communication, meeting preparation, leadership records, and follow-up on decisions.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%202.19.38%20AM.jpeg', NULL, NULL, 4, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000006', 'HON. AISHA YUSUF', 'Attorney General', 'Advises on legal and constitutional matters and supports fair procedures and sound governance frameworks.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-10-21%20at%204.06.11%20AM.jpeg', NULL, NULL, 5, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000007', 'HON. EMMANUEL MAINGI', 'Cabinet Secretary for Treasury', 'Leads financial planning, budget priorities, resource monitoring, and responsible financial management.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2012.12.22%20PM.jpeg', NULL, NULL, 6, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000008', 'HON. BARKE RASHID', 'Cabinet Secretary for Mining, Blue Economy and Maritime Affairs', 'Promotes responsible mineral development and sustainable coastal and marine opportunities, investment, and livelihoods.', '/images/barke-rashid.jpg', NULL, NULL, 7, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000009', 'HON. MKASI HAMISI', 'Deputy Cabinet Secretary for Finance', 'Supports budget preparation, expenditure tracking, financial records, and transparent programme planning.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-10-18%20at%208.52.20%20PM.jpeg', NULL, NULL, 8, CURRENT_TIMESTAMP),
  ('00000000-0000-4000-8000-000000000010', 'HON. ANDERSON MAINA', 'Cabinet Secretary for ICT', 'Oversees digital systems, secure access to information, digital skills, and technology-enabled coordination.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2012.31.16%20PM.jpeg', NULL, NULL, 9, CURRENT_TIMESTAMP);
