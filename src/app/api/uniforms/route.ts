import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRank, requireUser, withApiErrorHandling } from "@/lib/api-auth";
import { uniformSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { Rank } from "@/generated/prisma";

export const GET = withApiErrorHandling(async () => {
  await requireUser();
  const uniforms = await prisma.uniform.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(uniforms);
});

export const POST = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.SUPERVISOR);
  const body = uniformSchema.parse(await req.json());

  const maxOrder = await prisma.uniform.aggregate({ _max: { order: true } });
  const uniform = await prisma.uniform.create({
    data: { ...body, order: (maxOrder._max.order ?? -1) + 1 },
  });

  await logActivity({
    type: "FARDAMENTO",
    title: "Fardamento Adicionado",
    detail: `Novo fardamento cadastrado: "${uniform.title}".`,
    actor,
  });

  return NextResponse.json(uniform, { status: 201 });
});
