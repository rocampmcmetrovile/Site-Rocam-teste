import { prisma } from "@/lib/db";
import { requirePageRank } from "@/lib/page-auth";
import { Rank } from "@/generated/prisma";
import { AlteracoesClient } from "@/components/alteracoes/alteracoes-client";

export default async function AlteracoesPage() {
  await requirePageRank(Rank.SUPERVISOR);

  const logs = await prisma.activityLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 200,
    include: { user: true },
  });

  return <AlteracoesClient logs={logs} />;
}
