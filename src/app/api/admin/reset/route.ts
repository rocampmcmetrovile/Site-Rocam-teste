import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRank, withApiErrorHandling } from "@/lib/api-auth";
import { logActivity } from "@/lib/activity-log";
import { Rank } from "@/generated/prisma";

/**
 * Wipes all operational data (roster/Efetivo fields, arrests, evaluations,
 * absences, promotions, warnings) while keeping Uniforms/Questions/
 * StaffMembers and every `User` account (login/rank/Discord identity are
 * untouched — only roster fields are cleared, so nobody gets logged out;
 * they'll just be prompted to redo the onboarding form). Restricted to
 * Staff given this is a real, persisted database.
 */
export const POST = withApiErrorHandling(async () => {
  const actor = await requireRank(Rank.STAFF);

  await prisma.$transaction([
    prisma.evalAnswer.deleteMany(),
    prisma.completedEval.deleteMany(),
    prisma.evalRequest.deleteMany(),
    prisma.arrestOfficer.deleteMany(),
    prisma.arrest.deleteMany(),
    prisma.absence.deleteMany(),
    prisma.warning.deleteMany(),
    prisma.promotion.deleteMany(),
    prisma.user.updateMany({
      data: {
        characterName: null,
        passport: null,
        badge: null,
        status: "ATIVO",
        arrestsCount: 0,
        warningsCount: 0,
      },
    }),
  ]);

  await logActivity({
    type: "SISTEMA",
    title: "Painel Restaurado",
    detail: `Dados operacionais zerados por ${actor.name}.`,
    actor,
  });

  return NextResponse.json({ ok: true });
});
