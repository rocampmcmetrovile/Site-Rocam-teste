import { prisma } from "@/lib/db";
import { FardamentosClient } from "@/components/fardamentos/fardamentos-client";

export default async function FardamentosPage() {
  const uniforms = await prisma.uniform.findMany({ orderBy: { order: "asc" } });
  return <FardamentosClient initialUniforms={uniforms} />;
}
