"use client";

import { useMemo, useState } from "react";
import { Search, History } from "lucide-react";
import type { ActivityLog, User } from "@/generated/prisma";

const CATEGORIES = [
  "TODOS",
  "SISTEMA",
  "STAFF",
  "EFETIVO",
  "PRISIONAL",
  "AVALIACAO",
  "AUSENCIA",
  "PROMOCAO",
  "PUNICAO",
  "FARDAMENTO",
] as const;

type LogWithUser = ActivityLog & { user: User | null };

export function AlteracoesClient({ logs }: { logs: LogWithUser[] }) {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("TODOS");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter((log) => {
      const matchesCat = category === "TODOS" || log.type === category;
      const matchesSearch =
        log.title.toLowerCase().includes(q) || log.detail.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [logs, category, search]);

  return (
    <section className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-4">
      <h3 className="font-oswald text-base font-bold text-slate-200 flex items-center gap-2 border-b border-rocam-border pb-3">
        <History className="w-4 h-4 text-rocam-yellow" /> HISTÓRICO DE ALTERAÇÕES
      </h3>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-rocam-muted absolute left-2.5 top-2.5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar no histórico..."
            className="w-full bg-rocam-dark border border-rocam-border text-xs rounded-lg pl-8 pr-3 py-2 text-slate-200 outline-none focus:border-rocam-yellow"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                category === cat
                  ? "bg-rocam-yellow/10 text-rocam-yellow border-rocam-yellow/30"
                  : "bg-rocam-dark text-rocam-muted border-rocam-border hover:text-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-[65vh] overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-xs text-rocam-muted italic py-8 text-center">Nenhum registro encontrado.</p>
        )}
        {filtered.map((log) => (
          <div key={log.id} className="p-3 bg-rocam-dark rounded-xl border border-rocam-border text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100">{log.title}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rocam-hover text-rocam-muted uppercase">
                {log.type}
              </span>
            </div>
            <p className="text-rocam-muted">{log.detail}</p>
            <p className="text-[10px] text-rocam-muted/70">
              {new Date(log.timestamp).toLocaleString("pt-BR")}
              {log.user ? ` • ${log.user.username}` : ""}
              {log.userRankAtTime ? ` (${log.userRankAtTime})` : ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
