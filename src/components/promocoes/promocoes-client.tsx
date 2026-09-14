"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, AlertTriangle, Check, X } from "lucide-react";
import type { Promotion, Warning } from "@/generated/prisma";
import { Rank } from "@/generated/prisma";
import type { RosterMember } from "@/lib/roster";
import { resolveDisplayName } from "@/lib/display-name";
import { RANK_EMOJI, RANK_LABELS, RANK_ORDER, isSubgestorUpHelper, isSupervisorUp } from "@/lib/permissions";
import { useViewAs } from "@/components/view-as-context";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

const STATUS_STYLES: Record<string, string> = {
  PENDENTE: "text-amber-400",
  APROVADO: "text-emerald-400",
  REJEITADO: "text-rose-400",
};

const WARNING_LABELS: Record<string, string> = {
  LEVE: "🟡 Leve (Adv Verbal)",
  MEDIA: "🟠 Média (Adv Escrita)",
  GRAVE: "🔴 Grave (Suspensão)",
};

export function PromocoesClient({
  initialPromotions,
  initialWarnings,
  officers,
}: {
  initialPromotions: Promotion[];
  initialWarnings: Warning[];
  officers: RosterMember[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { effectiveRank } = useViewAs();
  const canReviewPromotions = isSubgestorUpHelper(effectiveRank);
  const canWarn = isSupervisorUp(effectiveRank);

  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({ userId: "", newRank: Rank.GRADUADOS as Rank });
  const [warnModalOpen, setWarnModalOpen] = useState(false);
  const [warnForm, setWarnForm] = useState({ userId: "", level: "LEVE" as "LEVE" | "MEDIA" | "GRAVE", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  async function submitPromotion(e: React.FormEvent) {
    e.preventDefault();
    if (!promoForm.userId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoForm),
      });
      if (!res.ok) throw new Error("Falha ao solicitar promoção.");
      showToast("Solicitação de promoção enviada!", "success");
      setPromoModalOpen(false);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao solicitar.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitWarning(e: React.FormEvent) {
    e.preventDefault();
    if (!warnForm.userId) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/warnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(warnForm),
      });
      if (!res.ok) throw new Error("Falha ao registrar advertência.");
      showToast("Advertência aplicada!", "success");
      setWarnModalOpen(false);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao registrar.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function updatePromotionStatus(id: string, status: "APROVADO" | "REJEITADO") {
    try {
      const res = await fetch(`/api/promotions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar.");
      showToast("Status atualizado!", "success");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao atualizar.", "error");
    }
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-3">
        <div className="flex items-center justify-between border-b border-rocam-border pb-3">
          <h3 className="font-oswald text-base font-bold text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-rocam-yellow" /> PROMOÇÕES
          </h3>
          <button
            onClick={() => setPromoModalOpen(true)}
            className="text-xs px-3 py-1.5 bg-rocam-yellow text-rocam-dark font-bold rounded-lg cursor-pointer"
          >
            + Solicitar
          </button>
        </div>
        {initialPromotions.length === 0 && (
          <p className="text-xs text-rocam-muted italic py-8 text-center">Nenhuma promoção registrada.</p>
        )}
        {initialPromotions.map((p) => (
          <div key={p.id} className="p-3 bg-rocam-dark rounded-xl border border-rocam-border text-xs flex justify-between items-center gap-2">
            <div>
              <p className="font-bold text-slate-100">{p.officerName}</p>
              <p className="text-rocam-yellow font-bold">
                {RANK_EMOJI[p.newRank]} {RANK_LABELS[p.newRank]}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`font-bold ${STATUS_STYLES[p.status]}`}>{p.status}</span>
              {canReviewPromotions && p.status === "PENDENTE" && (
                <>
                  <button onClick={() => updatePromotionStatus(p.id, "APROVADO")} className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => updatePromotionStatus(p.id, "REJEITADO")} className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-3">
        <div className="flex items-center justify-between border-b border-rocam-border pb-3">
          <h3 className="font-oswald text-base font-bold text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> PUNIÇÕES / ADVERTÊNCIAS
          </h3>
          {canWarn && (
            <button
              onClick={() => setWarnModalOpen(true)}
              className="text-xs px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg cursor-pointer"
            >
              + Advertência
            </button>
          )}
        </div>
        {initialWarnings.length === 0 && (
          <p className="text-xs text-rocam-muted italic py-8 text-center">Nenhuma advertência registrada.</p>
        )}
        {initialWarnings.map((w) => (
          <div key={w.id} className="p-3 bg-rocam-dark rounded-xl border border-rocam-border text-xs flex justify-between">
            <p className="font-bold text-slate-100">
              {w.officerName} ({WARNING_LABELS[w.level]})
            </p>
            <span className="text-rocam-muted">{w.date}</span>
          </div>
        ))}
      </div>

      <Modal open={promoModalOpen} onClose={() => setPromoModalOpen(false)} title="Solicitar Promoção">
        <form onSubmit={submitPromotion} className="space-y-3">
          <div>
            <label className={labelClass}>Oficial *</label>
            <select
              required
              value={promoForm.userId}
              onChange={(e) => setPromoForm((f) => ({ ...f, userId: e.target.value }))}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {resolveDisplayName(o)} (ID: {o.passport})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Novo Cargo *</label>
            <select
              value={promoForm.newRank}
              onChange={(e) => setPromoForm((f) => ({ ...f, newRank: e.target.value as Rank }))}
              className={inputClass}
            >
              {RANK_ORDER.filter((r) => r !== Rank.STAFF).map((r) => (
                <option key={r} value={r}>
                  {RANK_EMOJI[r]} {RANK_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? "Enviando..." : "Solicitar Promoção"}
          </button>
        </form>
      </Modal>

      <Modal open={warnModalOpen} onClose={() => setWarnModalOpen(false)} title="Aplicar Advertência Disciplinar" titleColorClass="text-amber-400">
        <form onSubmit={submitWarning} className="space-y-3">
          <div>
            <label className={labelClass}>Oficial *</label>
            <select
              required
              value={warnForm.userId}
              onChange={(e) => setWarnForm((f) => ({ ...f, userId: e.target.value }))}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {resolveDisplayName(o)} (ID: {o.passport})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Nível *</label>
            <select
              value={warnForm.level}
              onChange={(e) => setWarnForm((f) => ({ ...f, level: e.target.value as typeof f.level }))}
              className={inputClass}
            >
              <option value="LEVE">🟡 Leve (Adv Verbal)</option>
              <option value="MEDIA">🟠 Média (Adv Escrita)</option>
              <option value="GRAVE">🔴 Grave (Suspensão)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Motivo da Advertência *</label>
            <textarea
              required
              rows={3}
              value={warnForm.reason}
              onChange={(e) => setWarnForm((f) => ({ ...f, reason: e.target.value }))}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={primaryButtonClass.replace("bg-rocam-yellow text-rocam-dark hover:bg-yellow-400", "bg-amber-500 text-slate-950 hover:bg-amber-400")}
          >
            {submitting ? "Registrando..." : "Registrar Advertência"}
          </button>
        </form>
      </Modal>
    </section>
  );
}
