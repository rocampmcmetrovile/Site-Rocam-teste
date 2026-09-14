"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Pencil, Trash2 } from "lucide-react";
import type { User } from "@/generated/prisma";
import { Rank, OfficerStatus } from "@/generated/prisma";
import { RANK_EMOJI, RANK_LABELS, RANK_ORDER, isSupervisorUp } from "@/lib/permissions";
import { resolveDisplayName } from "@/lib/display-name";
import { useViewAs } from "@/components/view-as-context";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

const STATUS_LABELS: Record<OfficerStatus, { label: string; className: string }> = {
  ATIVO: { label: "🟢 Ativo", className: "text-emerald-400 bg-emerald-500/10" },
  LICENCA: { label: "🟡 Em Licença", className: "text-amber-400 bg-amber-500/10" },
  INATIVO: { label: "🔴 Inativo", className: "text-rose-400 bg-rose-500/10" },
};

export type RosterMember = Pick<
  User,
  "id" | "characterName" | "discordNick" | "username" | "passport" | "badge" | "rank" | "status"
>;

const EMPTY_FORM: { characterName: string; passport: string; badge: string; status: OfficerStatus } = {
  characterName: "",
  passport: "",
  badge: "",
  status: OfficerStatus.ATIVO,
};

export function EfetivoClient({ initialOfficers }: { initialOfficers: RosterMember[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { effectiveRank } = useViewAs();
  const canManage = isSupervisorUp(effectiveRank);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RosterMember | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return initialOfficers.filter((o) => {
      const name = resolveDisplayName(o);
      return (
        name.toLowerCase().includes(q) ||
        (o.passport ?? "").toLowerCase().includes(q) ||
        (o.badge ?? "").toLowerCase().includes(q)
      );
    });
  }, [initialOfficers, search]);

  const grouped = useMemo(() => {
    const map = new Map<Rank, RosterMember[]>();
    for (const rank of RANK_ORDER) map.set(rank, []);
    for (const o of filtered) map.get(o.rank)?.push(o);
    return map;
  }, [filtered]);

  function openEdit(o: RosterMember) {
    setEditing(o);
    setForm({
      characterName: o.characterName ?? "",
      passport: o.passport ?? "",
      badge: o.badge ?? "",
      status: o.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/officers/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Falha ao salvar oficial.");
      }
      showToast("Oficial atualizado com sucesso!", "success");
      setModalOpen(false);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao salvar oficial.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(o: RosterMember) {
    if (
      !confirm(
        `Remover ${resolveDisplayName(o)} do efetivo? Isso remove também a conta/login dessa pessoa — se ela entrar de novo com Discord, terá que refazer o cadastro inicial.`
      )
    )
      return;
    try {
      const res = await fetch(`/api/officers/${o.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao remover oficial.");
      showToast("Oficial removido.", "info");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao remover oficial.", "error");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-rocam-card p-4 rounded-xl border border-rocam-border">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-rocam-muted absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar oficial por Nome, Passaporte ID ou Badge..."
            className="w-full bg-rocam-dark border border-rocam-border text-xs rounded-lg pl-9 pr-3 py-2.5 text-slate-200 outline-none focus:border-rocam-yellow"
          />
        </div>
        <p className="text-[11px] text-rocam-muted max-w-xs text-right">
          Novos oficiais entram para o efetivo automaticamente no primeiro login com Discord.
        </p>
      </div>

      <div className="space-y-6">
        {RANK_ORDER.map((rank) => {
          const officers = grouped.get(rank) ?? [];
          if (officers.length === 0) return null;
          return (
            <div key={rank} className="bg-rocam-card rounded-xl border border-rocam-border overflow-hidden">
              <div className="p-3 bg-rocam-dark/50 border-b border-rocam-border flex items-center justify-between">
                <h3 className="font-oswald text-sm font-bold text-rocam-yellow flex items-center gap-2">
                  {RANK_EMOJI[rank]} {RANK_LABELS[rank]}
                </h3>
                <span className="text-xs text-rocam-muted">{officers.length} oficial(is)</span>
              </div>
              <div className="divide-y divide-rocam-border">
                {officers.map((o) => (
                  <div key={o.id} className="p-3 flex items-center justify-between text-xs gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-100 truncate">
                        {resolveDisplayName(o)} {o.badge && <span className="text-rocam-muted">({o.badge})</span>}
                      </p>
                      <p className="text-rocam-muted">Passaporte: {o.passport ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded font-bold ${STATUS_LABELS[o.status].className}`}>
                        {STATUS_LABELS[o.status].label}
                      </span>
                      {canManage && (
                        <>
                          <button
                            onClick={() => openEdit(o)}
                            className="text-rocam-muted hover:text-rocam-yellow p-1.5 rounded hover:bg-rocam-hover cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(o)}
                            className="text-rocam-muted hover:text-rose-400 p-1.5 rounded hover:bg-rose-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-rocam-muted italic py-8 text-center">Nenhum oficial encontrado.</p>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Editar Oficial">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelClass}>Nome IC *</label>
            <input
              required
              value={form.characterName}
              onChange={(e) => setForm((f) => ({ ...f, characterName: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Passaporte ID *</label>
              <input
                required
                value={form.passport}
                onChange={(e) => setForm((f) => ({ ...f, passport: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Badge</label>
              <input
                value={form.badge}
                onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Status *</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OfficerStatus }))}
              className={inputClass}
            >
              <option value="ATIVO">🟢 Ativo</option>
              <option value="LICENCA">🟡 Em Licença</option>
              <option value="INATIVO">🔴 Inativo</option>
            </select>
          </div>
          {editing && (
            <p className="text-[11px] text-rocam-muted">
              Cargo: {RANK_EMOJI[editing.rank]} {RANK_LABELS[editing.rank]} (sincronizado automaticamente com o
              Discord — não editável aqui)
            </p>
          )}
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? "Salvando..." : "Salvar Oficial"}
          </button>
        </form>
      </Modal>
    </section>
  );
}
