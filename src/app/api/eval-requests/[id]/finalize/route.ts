import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRank, ApiError, withApiErrorHandling } from "@/lib/api-auth";
import { finalizeEvalSchema } from "@/lib/schemas";
import { logActivity } from "@/lib/activity-log";
import { Rank } from "@/generated/prisma";

// Reviewing/scoring a PTR is restricted to Graduado+ — a Probatório
// shouldn't be able to finalize their own or a peer's evaluation (mirrors
// the isGraduadosUp() gate on the "Avaliar PTR" button client-side).
export const POST = withApiErrorHandling(async (req) => {
  const actor = await requireRank(Rank.GRADUADOS);
  const id = new URL(req.url).pathname.split("/").at(-2)!;
  const body = finalizeEvalSchema.parse(await req.json());

  const evalRequest = await prisma.evalRequest.findUnique({ where: { id } });
  if (!evalRequest) throw new ApiError(404, "Solicitação de PTR não encontrada.");
  if (evalRequest.status === "CONCLUIDO") {
    throw new ApiError(409, "Esta avaliação já foi concluída.");
  }

  const average =
    body.answers.reduce((sum, a) => sum + a.score, 0) / body.answers.length;

  const completed = await prisma.$transaction(async (tx) => {
    await tx.evalRequest.update({ where: { id }, data: { status: "CONCLUIDO" } });
    return tx.completedEval.create({
      data: {
        evalRequestId: id,
        studentName: evalRequest.studentName,
        studentPassport: evalRequest.studentPassport,
        evaluator: actor.name,
        averageScore: average.toFixed(1),
        date: evalRequest.date,
        answers: { create: body.answers },
      },
      include: { answers: true },
    });
  });

  await logActivity({
    type: "AVALIACAO",
    title: "Avaliação de PTR Concluída",
    detail: `${evalRequest.studentName} (ID ${evalRequest.studentPassport}) avaliado por ${actor.name}. Nota média: ${completed.averageScore}.`,
    actor,
  });

  return NextResponse.json(completed, { status: 201 });
});
