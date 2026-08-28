ALTER TABLE "Candidate" ADD COLUMN "positionId" TEXT;

CREATE INDEX "Candidate_positionId_idx" ON "Candidate"("positionId");

ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_positionId_fkey"
  FOREIGN KEY ("positionId") REFERENCES "ElectionPosition"("id") ON DELETE SET NULL ON UPDATE CASCADE;