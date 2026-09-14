"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Plus, Trash2, RotateCcw, Users, ShieldCheck } from "lucide-react";
import type { StaffMember } from "@/generated/prisma";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

const CARGO_OPTIONS = [
  "Dono / Fundador",
  "Administrador Master",
  "Gestor Staff",
  "Moderador Staff",
  "Suporte Staff",
];

const EMPTY_FORM = { name: "", passport: "", discordHandle: "", cargo: CARGO_OPTIONS[2] };

export function StaffPanelClient({
  initialStaffMembers,
  stats,
}: {
  initialStaffMembers: StaffMember[];
  stats: { userCount: number; officerCount: number };
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/staff-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Falha ao adicionar membro.");
      showToast("Membro de Staff adicionado!", "success");
      setModalOpen(false);
      setForm(EMPTY_FORM);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao adicionar.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Remover este membro da equipe de Staff?")) return;
    try {
      const res = await fetch(`/api/staff-members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao remover.");
      showToast("Membro removido.", "info");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao remover.", "error");
    }
  }

  async function handleReset() {
    if (
      !confirm(
        "ATENÇÃO: isso vai apagar permanentemente todos os oficiais, prisionais, avaliações, ausências, promoções e advertências do banco de dados Neon. Deseja continuar?"
      )
    )
      return;
    setResetting(true);
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      if (!res.ok) throw new Error("Falha ao restaurar dados.");
      showToast("Painel restaurado com sucesso!", "success");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao restaurar.", "error");
    } finally {
      setResetting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-rocam-card p-4 rounded-xl border border-purple-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-rocam-muted uppercase tracking-wider font-semibold">Usuários com Login</p>
            <h3 className="text-2xl font-oswald font-bold text-purple-400 mt-1">{stats.userCount}</h3>
          </div>
          <Users className="w-6 h-6 text-purple-400" />
        </div>
        <div className="bg-rocam-card p-4 rounded-xl border border-purple-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs text-rocam-muted uppercase tracking-wider font-semibold">Efetivo Cadastrado</p>
            <h3 className="text-2xl font-oswald font-bold text-purple-400 mt-1">{stats.officerCount}</h3>
          </div>
          <ShieldCheck className="w-6 h-6 text-purple-400" />
        </div>
      </div>

      <div className="bg-rocam-card p-5 rounded-xl border border-purple-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-rocam-border pb-3">
          <h3 className="font-oswald text-base font-bold text-purple-400 flex items-center gap-2">
            <Crown className="w-5 h-5" /> EQUIPE DE STAFF
          </h3>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
        <div className="space-y-2">
          {initialStaffMembers.map((s) => (
            <div key={s.id} className="p-3 bg-rocam-dark rounded-xl border border-rocam-border text-xs flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-100">{s.name}</p>
                <p className="text-rocam-muted">
                  {s.cargo} • {s.discordHandle} • Passaporte: {s.passport}
                </p>
              </div>
              <button onClick={() => handleRemove(s.id)} className="text-rose-400 hover:text-rose-300 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {initialStaffMembers.length === 0 && (
            <p className="text-xs text-rocam-muted italic py-4 text-center">Nenhum membro cadastrado.</p>
          )}
        </div>
      </div>

      <div className="bg-rose-500/5 p-5 rounded-xl border border-rose-500/30 space-y-3">
        <h3 className="font-oswald text-sm font-bold text-rose-400">Zona de Risco</h3>
        <p className="text-xs text-rocam-muted">
          Restaura o painel apagando permanentemente todo o efetivo, prisionais, avaliações, ausências,
          promoções e advertências do banco de dados Neon. Esta ação não pode ser desfeita.
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" /> {resetting ? "Restaurando..." : "Restaurar Dados"}
        </button>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Adicionar Membro de Staff" titleColorClass="text-purple-400">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelClass}>Nome *</label>
            <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Passaporte *</label>
            <input required value={form.passport} onChange={(e) => setForm((f) => ({ ...f, passport: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Discord *</label>
            <input required value={form.discordHandle} onChange={(e) => setForm((f) => ({ ...f, discordHandle: e.target.value }))} className={inputClass} placeholder="@usuario" />
          </div>
          <div>
            <label className={labelClass}>Cargo *</label>
            <select value={form.cargo} onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))} className={inputClass}>
              {CARGO_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={primaryButtonClass.replace("bg-rocam-yellow text-rocam-dark hover:bg-yellow-400", "bg-purple-600 text-white hover:bg-purple-500")}
          >
            {submitting ? "Salvando..." : "Adicionar Membro"}
          </button>
        </form>
      </Modal>
    </section>
  );
}
