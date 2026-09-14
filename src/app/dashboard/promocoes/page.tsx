import { prisma } from "@/lib/db";
import { rosterSelect, onboardedFilter } from "@/lib/roster";
import { PromocoesClient } from "@/components/promocoes/promocoes-client";

export default async function PromocoesPage() {
  const [promotions, warnings, officers] = await Promise.all([
    prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.warning.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ where: onboardedFilter, select: rosterSelect, orderBy: { characterName: "asc" } }),
  ]);

  return <PromocoesClient initialPromotions={promotions} initialWarnings={warnings} officers={officers} />;
}
