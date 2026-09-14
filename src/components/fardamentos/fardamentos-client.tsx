"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Uniform } from "@/generated/prisma";
import { isSupervisorUp } from "@/lib/permissions";
import { useViewAs } from "@/components/view-as-context";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

const EMPTY_FORM = { title: "", badge: "", imageUrl: "", details: "" };

export function FardamentosClient({ initialUniforms }: { initialUniforms: Uniform[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { effectiveRank } = useViewAs();
  const canManage = isSupervisorUp(effectiveRank);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Uniform | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(u: Uniform) {
    setEditing(u);
    setForm({ title: u.title, badge: u.badge, imageUrl: u.imageUrl, details: u.details });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(editing ? `/api/uniforms/${editing.id}` : "/api/uniforms", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Falha ao salvar fardamento.");
      showToast("Fardamento salvo com sucesso!", "success");
      setModalOpen(false);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao salvar.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(u: Uniform) {
    if (!confirm(`Remover o fardamento "${u.title}"?`)) return;
    try {
      const res = await fetch(`/api/uniforms/${u.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao remover.");
      showToast("Fardamento removido.", "info");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao remover.", "error");
    }
  }

  return (
    <section className="space-y-6">
      {canManage && (
        <div className="flex justify-end">
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-rocam-yellow text-rocam-dark hover:bg-yellow-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Adicionar Fardamento
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {initialUniforms.map((u) => (
          <div key={u.id} className="bg-rocam-card rounded-xl border border-rocam-border overflow-hidden flex flex-col">
            <div className="relative w-full aspect-[3/5] bg-rocam-dark">
              <Image
                src={u.imageUrl}
                alt={u.title}
                fill
                unoptimized
                className="object-cover"
              />
              <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-1 rounded bg-rocam-dark/80 text-rocam-yellow border border-rocam-yellow/30 uppercase">
                {u.badge}
              </span>
            </div>
            <div className="p-3 space-y-2 flex-1 flex flex-col">
              <h4 className="font-oswald text-sm font-bold text-slate-100">{u.title}</h4>
              <p className="text-[11px] text-rocam-muted whitespace-pre-line flex-1">{u.details}</p>
              {canManage && (
                <div className="flex items-center gap-2 pt-2 border-t border-rocam-border">
                  <button
                    onClick={() => openEdit(u)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] text-rocam-yellow hover:bg-rocam-hover rounded cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] text-rose-400 hover:bg-rose-500/10 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remover
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar Fardamento" : "Adicionar Fardamento"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelClass}>Título *</label>
            <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Badge *</label>
            <input required value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>URL da Imagem *</label>
            <input required value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Detalhes / Loja *</label>
            <textarea
              required
              rows={6}
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? "Salvando..." : "Salvar Fardamento"}
          </button>
        </form>
      </Modal>
    </section>
  );
}
