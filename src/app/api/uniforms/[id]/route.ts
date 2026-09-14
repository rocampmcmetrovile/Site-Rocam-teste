import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRank, withApiErrorHandling } from "@/lib/api-auth";
import { uniformSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { Rank } from "@/generated/prisma";

export const PATCH = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.SUPERVISOR);
  const id = new URL(req.url).pathname.split("/").pop()!;
  const body = uniformSchema.partial().parse(await req.json());

  const uniform = await prisma.uniform.update({ where: { id }, data: body });

  await logActivity({
    type: "FARDAMENTO",
    title: "Fardamento Atualizado",
    detail: `Fardamento "${uniform.title}" foi atualizado.`,
    actor,
  });

  return NextResponse.json(uniform);
});

export const DELETE = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.SUPERVISOR);
  const id = new URL(req.url).pathname.split("/").pop()!;

  const uniform = await prisma.uniform.delete({ where: { id } });

  await logActivity({
    type: "FARDAMENTO",
    title: "Fardamento Removido",
    detail: `Fardamento "${uniform.title}" foi removido.`,
    actor,
  });

  return NextResponse.json({ ok: true });
});
