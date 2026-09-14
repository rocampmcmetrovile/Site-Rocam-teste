-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('STAFF', 'GESTOR', 'SUBGESTOR', 'SUPERVISOR', 'ELITE', 'GRADUADOS', 'PROBATORIOS');

-- CreateEnum
CREATE TYPE "OfficerStatus" AS ENUM ('ATIVO', 'LICENCA', 'INATIVO');

-- CreateEnum
CREATE TYPE "ArrestOutcome" AS ENUM ('SUCESSO', 'SEM_SUCESSO');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "EvalRequestStatus" AS ENUM ('PENDENTE', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "WarningLevel" AS ENUM ('LEVE', 'MEDIA', 'GRAVE');

-- CreateEnum
CREATE TYPE "ActivityLogType" AS ENUM ('SISTEMA', 'STAFF', 'EFETIVO', 'PRISIONAL', 'AVALIACAO', 'AUSENCIA', 'PROMOCAO', 'PUNICAO', 'FARDAMENTO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "rank" "Rank" NOT NULL DEFAULT 'PROBATORIOS',
    "isStaffMaster" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Officer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passport" TEXT NOT NULL,
    "badge" TEXT,
    "rank" "Rank" NOT NULL DEFAULT 'PROBATORIOS',
    "status" "OfficerStatus" NOT NULL DEFAULT 'ATIVO',
    "arrestsCount" INTEGER NOT NULL DEFAULT 0,
    "warningsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Officer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arrest" (
    "id" TEXT NOT NULL,
    "qru" TEXT NOT NULL,
    "passport" TEXT NOT NULL,
    "bo" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "outcome" "ArrestOutcome" NOT NULL DEFAULT 'SUCESSO',
    "imageUrl" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Arrest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrestOfficer" (
    "arrestId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,

    CONSTRAINT "ArrestOfficer_pkey" PRIMARY KEY ("arrestId","officerId")
);

-- CreateTable
CREATE TABLE "EvalRequest" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentPassport" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "evaluatorTarget" TEXT NOT NULL,
    "status" "EvalRequestStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletedEval" (
    "id" TEXT NOT NULL,
    "evalRequestId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentPassport" TEXT NOT NULL,
    "evaluator" TEXT NOT NULL,
    "averageScore" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompletedEval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalAnswer" (
    "id" TEXT NOT NULL,
    "completedEvalId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,

    CONSTRAINT "EvalAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Absence" (
    "id" TEXT NOT NULL,
    "officer" TEXT NOT NULL,
    "passport" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Absence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "officerId" TEXT,
    "officerName" TEXT NOT NULL,
    "newRank" "Rank" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDENTE',
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warning" (
    "id" TEXT NOT NULL,
    "officerId" TEXT,
    "officerName" TEXT NOT NULL,
    "level" "WarningLevel" NOT NULL,
    "reason" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Uniform" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Uniform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passport" TEXT NOT NULL,
    "discordHandle" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "type" "ActivityLogType" NOT NULL DEFAULT 'SISTEMA',
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "userRankAtTime" "Rank",
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE INDEX "User_rank_idx" ON "User"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "Officer_passport_key" ON "Officer"("passport");

-- CreateIndex
CREATE INDEX "Officer_rank_idx" ON "Officer"("rank");

-- CreateIndex
CREATE INDEX "Officer_status_idx" ON "Officer"("status");

-- CreateIndex
CREATE INDEX "Arrest_outcome_idx" ON "Arrest"("outcome");

-- CreateIndex
CREATE INDEX "Arrest_date_idx" ON "Arrest"("date");

-- CreateIndex
CREATE INDEX "EvalRequest_status_idx" ON "EvalRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CompletedEval_evalRequestId_key" ON "CompletedEval"("evalRequestId");

-- CreateIndex
CREATE INDEX "Absence_status_idx" ON "Absence"("status");

-- CreateIndex
CREATE INDEX "Promotion_status_idx" ON "Promotion"("status");

-- CreateIndex
CREATE INDEX "Warning_level_idx" ON "Warning"("level");

-- CreateIndex
CREATE INDEX "ActivityLog_type_idx" ON "ActivityLog"("type");

-- CreateIndex
CREATE INDEX "ActivityLog_timestamp_idx" ON "ActivityLog"("timestamp");

-- AddForeignKey
ALTER TABLE "ArrestOfficer" ADD CONSTRAINT "ArrestOfficer_arrestId_fkey" FOREIGN KEY ("arrestId") REFERENCES "Arrest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArrestOfficer" ADD CONSTRAINT "ArrestOfficer_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "Officer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedEval" ADD CONSTRAINT "CompletedEval_evalRequestId_fkey" FOREIGN KEY ("evalRequestId") REFERENCES "EvalRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalAnswer" ADD CONSTRAINT "EvalAnswer_completedEvalId_fkey" FOREIGN KEY ("completedEvalId") REFERENCES "CompletedEval"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "Officer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "Officer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
