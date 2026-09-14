import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, withApiErrorHandling } from "@/lib/api-auth";
import { arrestSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { rosterSelect } from "@/lib/roster";

export const GET = withApiErrorHandling(async () => {
  await requireUser();
  const arrests = await prisma.arrest.findMany({
    orderBy: { date: "desc" },
    include: { officers: { include: { user: { select: rosterSelect } } } },
  });
  return NextResponse.json(arrests);
});

export const POST = withApiErrorHandling(async (req) => {
  const actor = await requireUser();
  const body = arrestSchema.parse(await req.json());

  const arrest = await prisma.arrest.create({
    data: {
      qru: body.qru,
      passport: body.passport,
      bo: body.bo,
      unidade: body.unidade,
      outcome: body.outcome,
      imageUrl: body.imageUrl || null,
      officers: { create: body.userIds.map((userId) => ({ userId })) },
    },
    include: { officers: { include: { user: { select: rosterSelect } } } },
  });

  await logActivity({
    type: "PRISIONAL",
    title: "Registro Prisional Adicionado",
    detail: `QRU "${arrest.qru}" (BO ${arrest.bo}) — resultado: ${arrest.outcome === "SUCESSO" ? "Sucesso" : "Sem Sucesso"}.`,
    actor,
  });

  return NextResponse.json(arrest, { status: 201 });
});
