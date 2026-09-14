import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRank, withApiErrorHandling } from "@/lib/api-auth";
import { logActivity } from "@/lib/activity-log";
import { Rank } from "@/generated/prisma";

export const DELETE = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.SUPERVISOR);
  const id = new URL(req.url).pathname.split("/").pop()!;

  const question = await prisma.question.delete({ where: { id } });

  await logActivity({
    type: "AVALIACAO",
    title: "Pergunta de PTR Removida",
    detail: `Pergunta removida do questionário: "${question.text}".`,
    actor,
  });

  return NextResponse.json({ ok: true });
});
