import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRank, withApiErrorHandling } from "@/lib/api-auth";
import { officerUpdateSchema } from "@/lib/schemas";
import { rosterSelect } from "@/lib/roster";
import { logActivity } from "@/lib/activity-log";
import { resolveDisplayName } from "@/lib/display-name";
import { Rank } from "@/generated/prisma";

export const PATCH = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.SUPERVISOR);
  const id = new URL(req.url).pathname.split("/").pop()!;
  const body = officerUpdateSchema.parse(await req.json());

  if (body.passport) {
    const existing = await prisma.user.findUnique({ where: { passport: body.passport } });
    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: "Já existe um oficial com este passaporte." },
        { status: 409 }
      );
    }
  }

  const officer = await prisma.user.update({ where: { id }, data: body, select: rosterSelect });

  await logActivity({
    type: "EFETIVO",
    title: "Oficial Atualizado",
    detail: `Dados de ${resolveDisplayName(officer)} (ID ${officer.passport}) foram atualizados.`,
    actor,
  });

  return NextResponse.json(officer);
});

export const DELETE = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.SUPERVISOR);
  const id = new URL(req.url).pathname.split("/").pop()!;

  const officer = await prisma.user.delete({ where: { id }, select: rosterSelect });

  await logActivity({
    type: "EFETIVO",
    title: "Oficial Removido",
    detail: `${resolveDisplayName(officer)} (ID ${officer.passport}) foi removido do efetivo (conta excluída).`,
    actor,
  });

  return NextResponse.json({ ok: true });
});
