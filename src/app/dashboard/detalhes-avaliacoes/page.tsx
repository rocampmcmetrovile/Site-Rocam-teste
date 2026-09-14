import { prisma } from "@/lib/db";
import { requirePageRank } from "@/lib/page-auth";
import { Rank } from "@/generated/prisma";
import { FileSearch } from "lucide-react";

export default async function DetalhesAvaliacoesPage() {
  await requirePageRank(Rank.SUPERVISOR);

  const completedEvals = await prisma.completedEval.findMany({
    orderBy: { createdAt: "desc" },
    include: { answers: true },
  });

  return (
    <section className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-4">
      <h3 className="font-oswald text-base font-bold text-slate-200 flex items-center gap-2 border-b border-rocam-border pb-3">
        <FileSearch className="w-4 h-4 text-rocam-yellow" /> DOSSIÊ DE AVALIAÇÕES CONCLUÍDAS
      </h3>
      <div className="space-y-3">
        {completedEvals.length === 0 && (
          <p className="text-xs text-rocam-muted italic py-8 text-center">Nenhuma avaliação concluída ainda.</p>
        )}
        {completedEvals.map((e) => (
          <div key={e.id} className="p-4 bg-rocam-dark rounded-xl border border-rocam-border text-xs space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-100">
                {e.studentName} (ID: {e.studentPassport})
              </h4>
              <span className="font-oswald text-rocam-yellow font-bold">Nota: {e.averageScore}</span>
            </div>
            <p className="text-rocam-muted">
              Avaliador: {e.evaluator} | Data: {e.date}
            </p>
            <div className="space-y-1 pt-2 border-t border-rocam-border">
              {e.answers.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2">
                  <span className="text-slate-300 truncate">{a.questionText}</span>
                  <span className="text-rocam-yellow font-bold shrink-0">{a.score}/10</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
