import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, withApiErrorHandling } from "@/lib/api-auth";
import { evalRequestSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";

export const GET = withApiErrorHandling(async () => {
  await requireUser();
  const requests = await prisma.evalRequest.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(requests);
});

export const POST = withApiErrorHandling(async (req) => {
  const actor = await requireUser();
  const body = evalRequestSchema.parse(await req.json());

  const request = await prisma.evalRequest.create({ data: body });

  await logActivity({
    type: "AVALIACAO",
    title: "Solicitação de PTR Enviada",
    detail: `${request.studentName} (ID ${request.studentPassport}) entrou na fila de avaliação com ${request.evaluatorTarget}.`,
    actor,
  });

  return NextResponse.json(request, { status: 201 });
});
