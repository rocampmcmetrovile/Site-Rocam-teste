"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, Send } from "lucide-react";
import type { EvalRequest, Question } from "@/generated/prisma";
import { useToast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/modal";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";
import { isGraduadosUp } from "@/lib/permissions";
import { useViewAs } from "@/components/view-as-context";

const EMPTY_FORM = {
  studentName: "",
  studentPassport: "",
  startTime: "",
  endTime: "",
  date: "",
  dept: "ROCAM",
  evaluatorTarget: "",
};

export function AvaliacoesClient({
  pendingRequests,
  questions,
}: {
  pendingRequests: EvalRequest[];
  questions: Question[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const { effectiveRank } = useViewAs();
  const canReview = isGraduadosUp(effectiveRank);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [activeRequest, setActiveRequest] = useState<EvalRequest | null>(null);
  const [answers, setAnswers] = useState<{ score: number; comment: string }[]>([]);
  const [finalizing, setFinalizing] = useState(false);

  async function handleSubmitRequest(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/eval-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Falha ao enviar solicitação.");
      showToast("Solicitação de PTR enviada para a fila!", "success");
      setForm(EMPTY_FORM);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao enviar.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function openEval(request: EvalRequest) {
    setActiveRequest(request);
    setAnswers(questions.map(() => ({ score: 10, comment: "" })));
  }

  async function handleFinalize(e: React.FormEvent) {
    e.preventDefault();
    if (!activeRequest) return;
    setFinalizing(true);
    try {
      const res = await fetch(`/api/eval-requests/${activeRequest.id}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions.map((q, idx) => ({
            questionText: q.text,
            score: answers[idx]?.score ?? 10,
            comment: answers[idx]?.comment ?? "",
          })),
        }),
      });
      if (!res.ok) throw new Error("Falha ao concluir avaliação.");
      showToast("Avaliação concluída e salva!", "success");
      setActiveRequest(null);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao concluir.", "error");
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-4">
        <h3 className="font-oswald text-base font-bold text-rocam-yellow flex items-center gap-2 border-b border-rocam-border pb-3">
          <Send className="w-5 h-5" /> Solicitar PTR
        </h3>
        <form onSubmit={handleSubmitRequest} className="space-y-3">
          <div>
            <label className={labelClass}>Nome do Aluno *</label>
            <input required value={form.studentName} onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Passaporte do Aluno *</label>
            <input required value={form.studentPassport} onChange={(e) => setForm((f) => ({ ...f, studentPassport: e.target.value }))} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Data *</label>
              <input required type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Departamento *</label>
              <input required value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Início *</label>
              <input required type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fim *</label>
              <input required type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Instrutor Alvo *</label>
            <input required value={form.evaluatorTarget} onChange={(e) => setForm((f) => ({ ...f, evaluatorTarget: e.target.value }))} className={inputClass} />
          </div>
          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? "Enviando..." : "Enviar Solicitação"}
          </button>
        </form>
      </div>

      <div className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-4 lg:col-span-2">
        <h3 className="font-oswald text-base font-bold text-slate-200 flex items-center gap-2 border-b border-rocam-border pb-3">
          <ClipboardCheck className="w-4 h-4 text-rocam-yellow" /> FILA DE PROBATÓRIOS PENDENTES
        </h3>
        <div className="space-y-3">
          {pendingRequests.length === 0 && (
            <p className="text-xs text-rocam-muted italic py-8 text-center">Nenhuma solicitação pendente.</p>
          )}
          {pendingRequests.map((r) => (
            <div key={r.id} className="p-3 bg-rocam-dark/80 rounded-xl border border-rocam-border text-xs space-y-2">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h4 className="font-bold text-slate-100">
                    {r.studentName} (ID: {r.studentPassport})
                  </h4>
                  <p className="text-rocam-muted">Instrutor: {r.evaluatorTarget}</p>
                  <p className="text-rocam-muted">
                    {r.date} • {r.startTime} – {r.endTime}
                  </p>
                </div>
                {canReview && (
                  <button
                    onClick={() => openEval(r)}
                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 font-bold rounded shrink-0 cursor-pointer"
                  >
                    Avaliar PTR
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={!!activeRequest}
        onClose={() => setActiveRequest(null)}
        title="Avaliação de PTR"
        titleColorClass="text-emerald-400"
      >
        {activeRequest && (
          <form onSubmit={handleFinalize} className="space-y-3">
            <p className="text-xs text-slate-200 font-bold">
              {activeRequest.studentName} (ID: {activeRequest.studentPassport})
            </p>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-2.5 bg-rocam-dark rounded-xl border border-rocam-border space-y-2">
                  <span className="text-xs font-semibold text-slate-100">
                    {idx + 1}. {q.text}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={answers[idx]?.score ?? 10}
                      onChange={(e) =>
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[idx] = { ...next[idx], score: Number(e.target.value) };
                          return next;
                        })
                      }
                      className="flex-1 accent-rocam-yellow"
                    />
                    <span className="w-8 text-right text-rocam-yellow font-bold text-xs">
                      {answers[idx]?.score ?? 10}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={answers[idx]?.comment ?? ""}
                    onChange={(e) =>
                      setAnswers((prev) => {
                        const next = [...prev];
                        next[idx] = { ...next[idx], comment: e.target.value };
                        return next;
                      })
                    }
                    placeholder="Observação..."
                    className="w-full bg-rocam-hover border border-rocam-border rounded p-1.5 text-[11px] text-slate-200 outline-none"
                  />
                </div>
              ))}
            </div>
            <button type="submit" disabled={finalizing} className={primaryButtonClass.replace("bg-rocam-yellow text-rocam-dark hover:bg-yellow-400", "bg-emerald-500 text-slate-950 hover:bg-emerald-400")}>
              {finalizing ? "Salvando..." : "Concluir Avaliação"}
            </button>
          </form>
        )}
      </Modal>
    </section>
  );
}
