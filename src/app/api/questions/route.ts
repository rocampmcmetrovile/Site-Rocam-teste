import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRank, withApiErrorHandling } from "@/lib/api-auth";
import { questionSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { Rank } from "@/generated/prisma";

export const GET = withApiErrorHandling(async () => {
  await requireRank(Rank.SUPERVISOR);
  const questions = await prisma.question.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(questions);
});

export const POST = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.SUPERVISOR);
  const body = questionSchema.parse(await req.json());

  const maxOrder = await prisma.question.aggregate({ _max: { order: true } });
  const question = await prisma.question.create({
    data: { text: body.text, order: (maxOrder._max.order ?? -1) + 1 },
  });

  await logActivity({
    type: "AVALIACAO",
    title: "Pergunta de PTR Adicionada",
    detail: `Nova pergunta adicionada ao questionário: "${question.text}".`,
    actor,
  });

  return NextResponse.json(question, { status: 201 });
});
