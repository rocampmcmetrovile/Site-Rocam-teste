import { prisma } from "@/lib/db";
import { rosterSelect, onboardedFilter } from "@/lib/roster";
import { EfetivoClient } from "@/components/efetivo/efetivo-client";

export default async function EfetivoPage() {
  const officers = await prisma.user.findMany({
    where: onboardedFilter,
    select: rosterSelect,
    orderBy: { characterName: "asc" },
  });
  return <EfetivoClient initialOfficers={officers} />;
}
