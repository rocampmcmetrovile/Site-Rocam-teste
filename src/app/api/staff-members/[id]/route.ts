import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRank, withApiErrorHandling } from "@/lib/api-auth";
import { logActivity } from "@/lib/activity-log";
import { Rank } from "@/generated/prisma";

export const DELETE = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.STAFF);
  const id = new URL(req.url).pathname.split("/").pop()!;

  const staffMember = await prisma.staffMember.delete({ where: { id } });

  await logActivity({
    type: "STAFF",
    title: "Membro de Staff Removido",
    detail: `${staffMember.name} foi removido da equipe de Staff.`,
    actor,
  });

  return NextResponse.json({ ok: true });
});
