import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  ArrowRight,
  Award,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { rosterSelect, onboardedFilter } from "@/lib/roster";
import { resolveDisplayName } from "@/lib/display-name";
import { RANK_EMOJI, RANK_LABELS, RANK_ORDER } from "@/lib/permissions";

async function getDashboardData() {
  const [
    efetivoAtivo,
    prisionaisSucesso,
    prisionaisFalhas,
    advertencias,
    ausenciasPendentes,
    recentArrests,
    officersByRank,
    recentPromotions,
  ] = await Promise.all([
    prisma.user.count({ where: { ...onboardedFilter, status: "ATIVO" } }),
    prisma.arrest.count({ where: { outcome: "SUCESSO" } }),
    prisma.arrest.count({ where: { outcome: "SEM_SUCESSO" } }),
    prisma.warning.count(),
    prisma.absence.count({ where: { status: "PENDENTE" } }),
    prisma.arrest.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: { officers: { include: { user: { select: rosterSelect } } } },
    }),
    prisma.user.groupBy({ by: ["rank"], where: onboardedFilter, _count: { rank: true } }),
    prisma.promotion.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const rankCounts = new Map(officersByRank.map((r) => [r.rank, r._count.rank]));

  return {
    stats: { efetivoAtivo, prisionaisSucesso, prisionaisFalhas, advertencias, ausenciasPendentes },
    recentArrests,
    rankCounts,
    recentPromotions,
  };
}

const KPI_CARDS = [
  { key: "efetivoAtivo", label: "Efetivo Ativo", sub: "Oficiais na ROCAM", icon: ShieldCheck, color: "yellow" },
  { key: "prisionaisSucesso", label: "Prisionais Sucesso", sub: "Operações concluídas", icon: CheckCircle, color: "emerald" },
  { key: "prisionaisFalhas", label: "Prisionais Falhos", sub: "Fugas ou falhas", icon: XCircle, color: "rose" },
  { key: "advertencias", label: "Advertências", sub: "Registradas", icon: AlertTriangle, color: "amber" },
  { key: "ausenciasPendentes", label: "Ausências Pendentes", sub: "Aguardando análise", icon: Clock, color: "sky" },
] as const;

const COLOR_CLASSES: Record<string, { text: string; bg: string; border: string }> = {
  yellow: { text: "text-rocam-yellow", bg: "bg-rocam-yellow/10", border: "border-rocam-yellow/20" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  rose: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  amber: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  sky: { text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
};

export default async function DashboardPage() {
  const { stats, recentArrests, rankCounts, recentPromotions } = await getDashboardData();
  const totalOfficers = Array.from(rankCounts.values()).reduce((a, b) => a + b, 0) || 1;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {KPI_CARDS.map(({ key, label, sub, icon: Icon, color }) => {
          const c = COLOR_CLASSES[color];
          return (
            <div
              key={key}
              className="bg-rocam-card p-4 rounded-xl border border-rocam-border flex items-center justify-between hover:border-rocam-yellow/50 transition-all"
            >
              <div>
                <p className="text-xs text-rocam-muted uppercase tracking-wider font-semibold">{label}</p>
                <h3 className={`text-2xl font-oswald font-bold mt-1 ${c.text}`}>{stats[key]}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
              </div>
              <div className={`p-3 rounded-xl border ${c.bg} ${c.border} ${c.text}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-rocam-border pb-3">
            <h3 className="font-oswald text-base font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-rocam-yellow" /> ÚLTIMOS PRISIONAIS REGISTRADOS
            </h3>
            <Link
              href="/dashboard/prisionais"
              className="text-xs text-rocam-yellow hover:underline flex items-center gap-1 font-semibold"
            >
              Ver Todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentArrests.length === 0 && (
              <p className="text-xs text-rocam-muted italic py-8 text-center">
                Nenhum registro prisional ainda.
              </p>
            )}
            {recentArrests.map((a) => (
              <div
                key={a.id}
                className="p-4 bg-rocam-dark/70 rounded-xl border border-rocam-border flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-100">{a.qru || "Ocorrência"}</h4>
                  <p className="text-rocam-muted">
                    BO: {a.bo} | Oficiais: {a.officers.map((o) => resolveDisplayName(o.user)).join(", ") || "—"}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    a.outcome === "SUCESSO" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                  }`}
                >
                  {a.outcome === "SUCESSO" ? "Sucesso" : "Sem Sucesso"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-4">
            <h3 className="font-oswald text-base font-bold text-slate-200 flex items-center gap-2 border-b border-rocam-border pb-3">
              <Award className="w-4 h-4 text-rocam-yellow" /> DISTRIBUIÇÃO POR CARGOS
            </h3>
            <div className="space-y-2 text-xs">
              {RANK_ORDER.map((rank) => {
                const count = rankCounts.get(rank) ?? 0;
                const pct = Math.round((count / totalOfficers) * 100);
                return (
                  <div key={rank} className="flex items-center justify-between gap-2">
                    <span className="text-slate-300 flex items-center gap-1.5 shrink-0">
                      {RANK_EMOJI[rank]} {RANK_LABELS[rank]}
                    </span>
                    <div className="flex-1 h-1.5 bg-rocam-hover rounded-full overflow-hidden">
                      <div className="h-full bg-rocam-yellow" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-rocam-muted font-mono w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-4">
            <h3 className="font-oswald text-base font-bold text-slate-200 flex items-center gap-2 border-b border-rocam-border pb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> ÚLTIMAS PROMOÇÕES
            </h3>
            <div className="space-y-2 text-xs">
              {recentPromotions.length === 0 && (
                <p className="text-rocam-muted italic py-4 text-center">Nenhuma promoção registrada.</p>
              )}
              {recentPromotions.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-rocam-dark rounded-xl border border-rocam-border flex justify-between"
                >
                  <div>
                    <p className="font-bold text-slate-100">{p.officerName}</p>
                    <p className="text-rocam-yellow font-bold">{RANK_LABELS[p.newRank]}</p>
                  </div>
                  <span className="text-emerald-400 font-bold">{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
