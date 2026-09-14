import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRank, withApiErrorHandling } from "@/lib/api-auth";
import { absenceStatusSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { Rank } from "@/generated/prisma";

export const PATCH = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.SUPERVISOR);
  const id = new URL(req.url).pathname.split("/").pop()!;
  const body = absenceStatusSchema.parse(await req.json());

  const absence = await prisma.absence.update({ where: { id }, data: body });

  await logActivity({
    type: "AUSENCIA",
    title: "Status de Ausência Atualizado",
    detail: `Solicitação de ${absence.officer} marcada como ${absence.status}.`,
    actor,
  });

  return NextResponse.json(absence);
});
