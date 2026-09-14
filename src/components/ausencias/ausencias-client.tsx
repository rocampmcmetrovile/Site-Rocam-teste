"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarOff, Check, X } from "lucide-react";
import type { Absence } from "@/generated/prisma";
import { isSupervisorUp } from "@/lib/permissions";
import { useViewAs } from "@/components/view-as-context";
import { useToast } from "@/components/ui/toast";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

const EMPTY_FORM = { officer: "", passport: "", startDate: "", endDate: "", reason: "" };

const STATUS_STYLES: Record<string, string> = {
  PENDENTE: "text-amber-400",
  APROVADO: "text-emerald-400",
  REJEITADO: "text-rose-400",
};

export function AusenciasClient({ initialAbsences }: { initialAbsences: Absence[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { effectiveRank } = useViewAs();
  const canReview = isSupervisorUp(effectiveRank);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/absences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Falha ao enviar solicitação.");
      showToast("Solicitação de ausência enviada!", "success");
      setForm(EMPTY_FORM);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao enviar.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: string, status: "APROVADO" | "REJEITADO") {
    try {
      const res = await fetch(`/api/absences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar status.");
      showToast("Status atualizado!", "success");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao atualizar.", "error");
    }
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-4">
        <h3 className="font-oswald text-base font-bold text-rocam-yellow flex items-center gap-2 border-b border-rocam-border pb-3">
          <CalendarOff className="w-5 h-5" /> Registrar Ausência
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelClass}>Nome do Oficial *</label>
            <input required value={form.officer} onChange={(e) => setForm((f) => ({ ...f, officer: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Passaporte *</label>
            <input required value={form.passport} onChange={(e) => setForm((f) => ({ ...f, passport: e.target.value }))} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Início *</label>
              <input required type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fim *</label>
              <input required type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Motivo *</label>
            <textarea required rows={3} value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} className={inputClass} />
          </div>
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? "Enviando..." : "Enviar Solicitação"}
          </button>
        </form>
      </div>

      <div className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-3 lg:col-span-2">
        <h3 className="font-oswald text-base font-bold text-slate-200 border-b border-rocam-border pb-3">
          SOLICITAÇÕES DE AUSÊNCIA
        </h3>
        {initialAbsences.length === 0 && (
          <p className="text-xs text-rocam-muted italic py-8 text-center">Nenhuma ausência registrada.</p>
        )}
        {initialAbsences.map((a) => (
          <div key={a.id} className="p-3 bg-rocam-dark rounded-xl border border-rocam-border text-xs flex justify-between items-center gap-3">
            <div>
              <p className="font-bold text-slate-100">
                {a.officer} (ID: {a.passport})
              </p>
              <p className="text-rocam-muted">
                Período: {a.startDate} a {a.endDate}
              </p>
              <p className="text-rocam-muted italic">{a.reason}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`font-bold ${STATUS_STYLES[a.status]}`}>{a.status}</span>
              {canReview && a.status === "PENDENTE" && (
                <>
                  <button
                    onClick={() => updateStatus(a.id, "APROVADO")}
                    className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => updateStatus(a.id, "REJEITADO")}
                    className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
