"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { Question } from "@/generated/prisma";
import { useToast } from "@/components/ui/toast";
import { inputClass, primaryButtonClass } from "@/lib/ui";

export function ConfiguracoesClient({ initialQuestions }: { initialQuestions: Question[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newQuestion.trim() }),
      });
      if (!res.ok) throw new Error("Falha ao adicionar pergunta.");
      showToast("Pergunta adicionada com sucesso!", "success");
      setNewQuestion("");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao adicionar.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao remover pergunta.");
      showToast("Pergunta removida.", "info");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao remover.", "error");
    }
  }

  return (
    <section className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-4 max-w-2xl">
      <h3 className="font-oswald text-base font-bold text-slate-200 border-b border-rocam-border pb-3">
        Configurar Perguntas do Questionário de PTR
      </h3>

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          placeholder="Nova pergunta para o questionário..."
          className={inputClass}
        />
        <button type="submit" disabled={submitting} className={`${primaryButtonClass} w-auto px-4 shrink-0`}>
          <Plus className="w-4 h-4" />
        </button>
      </form>

      <div className="space-y-2">
        {initialQuestions.map((q, idx) => (
          <div key={q.id} className="p-3 bg-rocam-dark rounded border border-rocam-border text-xs flex justify-between items-center">
            <span>
              {idx + 1}. {q.text}
            </span>
            <button onClick={() => handleRemove(q.id)} className="text-rose-400 hover:text-rose-300 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {initialQuestions.length === 0 && (
          <p className="text-xs text-rocam-muted italic py-4 text-center">Nenhuma pergunta cadastrada.</p>
        )}
      </div>
    </section>
  );
}
