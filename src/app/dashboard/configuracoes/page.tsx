import { prisma } from "@/lib/db";
import { requirePageRank } from "@/lib/page-auth";
import { Rank } from "@/generated/prisma";
import { ConfiguracoesClient } from "@/components/configuracoes/configuracoes-client";

export default async function ConfiguracoesPage() {
  await requirePageRank(Rank.SUPERVISOR);
  const questions = await prisma.question.findMany({ orderBy: { order: "asc" } });
  return <ConfiguracoesClient initialQuestions={questions} />;
}
