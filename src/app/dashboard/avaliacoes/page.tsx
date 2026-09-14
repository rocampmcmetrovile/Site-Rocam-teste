import { prisma } from "@/lib/db";
import { AvaliacoesClient } from "@/components/avaliacoes/avaliacoes-client";

export default async function AvaliacoesPage() {
  const [pendingRequests, questions] = await Promise.all([
    prisma.evalRequest.findMany({ where: { status: "PENDENTE" }, orderBy: { createdAt: "asc" } }),
    prisma.question.findMany({ orderBy: { order: "asc" } }),
  ]);

  return <AvaliacoesClient pendingRequests={pendingRequests} questions={questions} />;
}
