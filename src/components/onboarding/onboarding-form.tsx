"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ShieldCheck, LogOut } from "lucide-react";
import { Rank } from "@/generated/prisma";
import { RANK_EMOJI, RANK_LABELS } from "@/lib/permissions";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";
import { useToast } from "@/components/ui/toast";

export function OnboardingForm({ name, rank }: { name: string; rank: Rank }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({ characterName: "", passport: "", badge: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Falha ao concluir cadastro.");
      }
      showToast("Cadastro concluído! Bem-vindo ao efetivo ROCAM.", "success");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao concluir cadastro.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md bg-rocam-card border border-rocam-border rounded-3xl p-8 shadow-2xl space-y-6 glow-yellow">
      <div className="text-center space-y-1">
        <div className="w-14 h-14 mx-auto rounded-full bg-rocam-yellow/10 border border-rocam-yellow/30 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-rocam-yellow" />
        </div>
        <h1 className="font-oswald text-2xl font-bold tracking-wider text-slate-100 uppercase mt-3">
          Cadastro no Efetivo
        </h1>
        <p className="text-xs text-rocam-muted">
          Olá, <span className="text-slate-200 font-semibold">{name}</span>! Antes de acessar o
          painel, complete seus dados de personagem.
        </p>
        <p className="text-[11px] text-rocam-muted">
          Cargo (sincronizado com o Discord):{" "}
          <span className="text-rocam-yellow font-bold">
            {RANK_EMOJI[rank]} {RANK_LABELS[rank]}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-left">
        <div>
          <label className={labelClass}>Nome IC (personagem) *</label>
          <input
            required
            autoFocus
            value={form.characterName}
            onChange={(e) => setForm((f) => ({ ...f, characterName: e.target.value }))}
            className={inputClass}
            placeholder="Ex: John Doe"
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
              placeholder="Ex: 10234"
            />
          </div>
          <div>
            <label className={labelClass}>Distintivo</label>
            <input
              value={form.badge}
              onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
              className={inputClass}
              placeholder="Opcional"
            />
          </div>
        </div>
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Salvando..." : "Concluir Cadastro"}
        </button>
      </form>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full flex items-center justify-center gap-2 text-[11px] text-rocam-muted hover:text-rose-400 transition-colors cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" /> Sair
      </button>
    </div>
  );
}
