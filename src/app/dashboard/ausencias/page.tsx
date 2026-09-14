import { prisma } from "@/lib/db";
import { AusenciasClient } from "@/components/ausencias/ausencias-client";

export default async function AusenciasPage() {
  const absences = await prisma.absence.findMany({ orderBy: { createdAt: "desc" } });
  return <AusenciasClient initialAbsences={absences} />;
}
