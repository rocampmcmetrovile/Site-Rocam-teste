import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ApiError, requireRank, requireUser, withApiErrorHandling } from "@/lib/api-auth";
import { warningSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { resolveDisplayName } from "@/lib/display-name";
import { Rank } from "@/generated/prisma";

export const GET = withApiErrorHandling(async () => {
  await requireUser();
  const warnings = await prisma.warning.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(warnings);
});

export const POST = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.SUPERVISOR);
  const body = warningSchema.parse(await req.json());

  const officer = await prisma.user.findUnique({ where: { id: body.userId } });
  if (!officer) throw new ApiError(404, "Oficial não encontrado.");

  const officerName = resolveDisplayName(officer);
  const [warning] = await prisma.$transaction([
    prisma.warning.create({
      data: {
        userId: officer.id,
        officerName,
        level: body.level,
        reason: body.reason,
        date: new Date().toLocaleDateString("pt-BR"),
      },
    }),
    prisma.user.update({
      where: { id: officer.id },
      data: { warningsCount: { increment: 1 } },
    }),
  ]);

  await logActivity({
    type: "PUNICAO",
    title: "Advertência Aplicada",
    detail: `${officerName} recebeu advertência de nível ${warning.level}. Motivo: ${warning.reason}`,
    actor,
  });

  return NextResponse.json(warning, { status: 201 });
});
