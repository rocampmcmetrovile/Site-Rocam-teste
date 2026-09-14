import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, withApiErrorHandling } from "@/lib/api-auth";
import { absenceSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";

export const GET = withApiErrorHandling(async () => {
  await requireUser();
  const absences = await prisma.absence.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(absences);
});

export const POST = withApiErrorHandling(async (req) => {
  const actor = await requireUser();
  const body = absenceSchema.parse(await req.json());

  const absence = await prisma.absence.create({ data: body });

  await logActivity({
    type: "AUSENCIA",
    title: "Solicitação de Ausência Enviada",
    detail: `${absence.officer} (ID ${absence.passport}) solicitou ausência de ${absence.startDate} a ${absence.endDate}.`,
    actor,
  });

  return NextResponse.json(absence, { status: 201 });
});
