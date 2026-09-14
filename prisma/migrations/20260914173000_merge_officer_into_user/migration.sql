-- DropForeignKey
ALTER TABLE "ArrestOfficer" DROP CONSTRAINT "ArrestOfficer_officerId_fkey";

-- DropForeignKey
ALTER TABLE "Officer" DROP CONSTRAINT "Officer_userId_fkey";

-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_officerId_fkey";

-- DropForeignKey
ALTER TABLE "Warning" DROP CONSTRAINT "Warning_officerId_fkey";

-- AlterTable
ALTER TABLE "ArrestOfficer" DROP CONSTRAINT "ArrestOfficer_pkey",
DROP COLUMN "officerId",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "ArrestOfficer_pkey" PRIMARY KEY ("arrestId", "userId");

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "officerId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "arrestsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "badge" TEXT,
ADD COLUMN     "characterName" TEXT,
ADD COLUMN     "discordNick" TEXT,
ADD COLUMN     "passport" TEXT,
ADD COLUMN     "status" "OfficerStatus" NOT NULL DEFAULT 'ATIVO',
ADD COLUMN     "warningsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Warning" DROP COLUMN "officerId",
ADD COLUMN     "userId" TEXT;

-- DropTable
DROP TABLE "Officer";

-- CreateIndex
CREATE UNIQUE INDEX "User_passport_key" ON "User"("passport");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- AddForeignKey
ALTER TABLE "ArrestOfficer" ADD CONSTRAINT "ArrestOfficer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

