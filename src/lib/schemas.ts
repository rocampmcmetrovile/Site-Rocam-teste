import { z } from "zod";
import { ArrestOutcome, OfficerStatus, Rank, RequestStatus, WarningLevel } from "@/generated/prisma";

/** Mandatory first-login form (src/app/onboarding). Rank is never included
 * here — it always comes from the Discord role sync. */
export const onboardingSchema = z.object({
  characterName: z.string().trim().min(1, "Nome IC obrigatório"),
  passport: z.string().trim().min(1, "Passaporte obrigatório"),
  badge: z.string().trim().optional().default(""),
});

/** Supervisor+ editing an existing roster member from the Efetivo tab.
 * Deliberately excludes `rank` (Discord-driven) and any account/auth
 * fields (discordId, isStaffMaster, username). */
export const officerUpdateSchema = z.object({
  characterName: z.string().trim().min(1, "Nome obrigatório").optional(),
  passport: z.string().trim().min(1, "Passaporte obrigatório").optional(),
  badge: z.string().trim().optional(),
  status: z.enum(OfficerStatus).optional(),
});

export const arrestSchema = z.object({
  qru: z.string().trim().min(1, "Nome da QRU obrigatório"),
  passport: z.string().trim().min(1, "Passaporte do responsável obrigatório"),
  bo: z.string().trim().min(1, "Número do B.O obrigatório"),
  unidade: z.string().trim().min(1),
  outcome: z.enum(ArrestOutcome).default("SUCESSO"),
  imageUrl: z.string().trim().optional().default(""),
  userIds: z.array(z.string()).min(1, "Selecione ao menos um oficial"),
});

export const evalRequestSchema = z.object({
  studentName: z.string().trim().min(1),
  studentPassport: z.string().trim().min(1),
  startTime: z.string().trim().min(1),
  endTime: z.string().trim().min(1),
  date: z.string().trim().min(1),
  dept: z.string().trim().min(1),
  evaluatorTarget: z.string().trim().min(1),
});

export const finalizeEvalSchema = z.object({
  answers: z
    .array(
      z.object({
        questionText: z.string(),
        score: z.number().int().min(0).max(10),
        comment: z.string().optional().default(""),
      })
    )
    .min(1),
});

export const absenceSchema = z.object({
  officer: z.string().trim().min(1),
  passport: z.string().trim().min(1),
  startDate: z.string().trim().min(1),
  endDate: z.string().trim().min(1),
  reason: z.string().trim().min(1),
});

export const absenceStatusSchema = z.object({
  status: z.enum(RequestStatus),
});

export const promotionSchema = z.object({
  userId: z.string().trim().min(1),
  newRank: z.enum(Rank),
});

export const promotionStatusSchema = z.object({
  status: z.enum(RequestStatus),
});

export const warningSchema = z.object({
  userId: z.string().trim().min(1),
  level: z.enum(WarningLevel),
  reason: z.string().trim().min(1),
});

export const uniformSchema = z.object({
  title: z.string().trim().min(1),
  badge: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1),
  details: z.string().trim().min(1),
});

export const questionSchema = z.object({
  text: z.string().trim().min(1),
});

export const staffMemberSchema = z.object({
  name: z.string().trim().min(1),
  passport: z.string().trim().min(1),
  discordHandle: z.string().trim().min(1),
  cargo: z.string().trim().min(1),
});
