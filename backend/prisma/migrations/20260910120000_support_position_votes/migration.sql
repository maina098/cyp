ALTER TABLE "Vote" ADD COLUMN "positionId" TEXT;

UPDATE "Vote" AS vote
SET "positionId" = candidate."positionId"
FROM "Candidate" AS candidate
WHERE vote."candidateId" = candidate."id";

DROP INDEX IF EXISTS "Vote_electionId_voterId_key";

CREATE UNIQUE INDEX "Vote_electionId_positionId_voterId_key"
ON "Vote"("electionId", "positionId", "voterId");

ALTER TABLE "Vote"
ADD CONSTRAINT "Vote_positionId_fkey"
FOREIGN KEY ("positionId") REFERENCES "ElectionPosition"("id")
ON DELETE SET NULL ON UPDATE CASCADE;