"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Search } from "lucide-react";
import type { Prisma } from "@/generated/prisma";
import type { RosterMember } from "@/lib/roster";
import { resolveDisplayName } from "@/lib/display-name";
import { useToast } from "@/components/ui/toast";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

type ArrestWithOfficers = Omit<
  Prisma.ArrestGetPayload<{ include: { officers: true } }>,
  "officers"
> & {
  officers: { arrestId: string; userId: string; user: RosterMember }[];
};

const EMPTY_FORM = {
  qru: "",
  passport: "",
  bo: "",
  unidade: "ROCAM - VTR / Moto",
  outcome: "SUCESSO" as "SUCESSO" | "SEM_SUCESSO",
  imageUrl: "",
};

export function PrisionaisClient({
  initialArrests,
  officers,
}: {
  initialArrests: ArrestWithOfficers[];
  officers: RosterMember[];
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedOfficerIds, setSelectedOfficerIds] = useState<string[]>([]);
  const [officerFilter, setOfficerFilter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredArrests = useMemo(() => {
    const q = search.toLowerCase();
    return initialArrests.filter(
      (a) => a.qru.toLowerCase().includes(q) || a.bo.toLowerCase().includes(q)
    );
  }, [initialArrests, search]);

  const filteredOfficers = useMemo(() => {
    const q = officerFilter.toLowerCase();
    return officers.filter(
      (o) =>
        resolveDisplayName(o).toLowerCase().includes(q) ||
        (o.passport ?? "").toLowerCase().includes(q)
    );
  }, [officers, officerFilter]);

  function toggleOfficer(id: string) {
    setSelectedOfficerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedOfficerIds.length === 0) {
      showToast("Selecione ao menos um oficial participante!", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/arrests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userIds: selectedOfficerIds }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Falha ao salvar registro prisional.");
      }
      showToast("Registro prisional salvo com sucesso!", "success");
      setForm(EMPTY_FORM);
      setSelectedOfficerIds([]);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erro ao salvar.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-4">
        <div className="border-b border-rocam-border pb-3">
          <h3 className="font-oswald text-base font-bold text-rocam-yellow flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> Novo Registro Prisional
          </h3>
          <p className="text-xs text-rocam-muted">
            Insira os dados da ocorrência e selecione os oficiais participantes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelClass}>Nome da QRU *</label>
            <input
              required
              value={form.qru}
              onChange={(e) => setForm((f) => ({ ...f, qru: e.target.value }))}
              placeholder="Ex: Roubo ao Banco Central"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Passaporte ID Resp. *</label>
              <input
                required
                value={form.passport}
                onChange={(e) => setForm((f) => ({ ...f, passport: e.target.value }))}
                placeholder="Ex: 18492"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nº do B.O *</label>
              <input
                required
                value={form.bo}
                onChange={(e) => setForm((f) => ({ ...f, bo: e.target.value }))}
                placeholder="Ex: BO-2026-90412"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelClass}>Unidade PMC *</label>
              <input
                required
                value={form.unidade}
                onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Resultado *</label>
              <select
                value={form.outcome}
                onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value as typeof f.outcome }))}
                className={inputClass}
              >
                <option value="SUCESSO">✅ Sucesso (Preso)</option>
                <option value="SEM_SUCESSO">❌ Sem Sucesso (Fuga)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>URL da Foto do Veículo Apreendido</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              placeholder="Ex: https://imgur.com/foto-veiculo.jpg"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Oficiais Participantes *</label>
            <div className="relative mb-1.5">
              <Search className="w-3.5 h-3.5 text-rocam-muted absolute left-2.5 top-2.5" />
              <input
                value={officerFilter}
                onChange={(e) => setOfficerFilter(e.target.value)}
                placeholder="Filtrar oficiais..."
                className={`${inputClass} pl-8`}
              />
            </div>
            <div className="max-h-36 overflow-y-auto border border-rocam-border rounded-lg divide-y divide-rocam-border">
              {filteredOfficers.map((o) => (
                <label
                  key={o.id}
                  className="flex items-center gap-2 p-2 text-xs cursor-pointer hover:bg-rocam-hover"
                >
                  <input
                    type="checkbox"
                    checked={selectedOfficerIds.includes(o.id)}
                    onChange={() => toggleOfficer(o.id)}
                    className="accent-rocam-yellow"
                  />
                  <span className="text-slate-200">
                    {resolveDisplayName(o)} <span className="text-rocam-muted">({o.passport})</span>
                  </span>
                </label>
              ))}
              {filteredOfficers.length === 0 && (
                <p className="p-2 text-xs text-rocam-muted italic">Nenhum oficial encontrado.</p>
              )}
            </div>
            {selectedOfficerIds.length > 0 && (
              <p className="text-[11px] text-rocam-muted mt-1">
                {selectedOfficerIds.length} oficial(is) selecionado(s).
              </p>
            )}
          </div>

          <button type="submit" disabled={submitting} className={primaryButtonClass}>
            {submitting ? "Salvando..." : "Registrar Prisional"}
          </button>
        </form>
      </div>

      <div className="bg-rocam-card p-5 rounded-xl border border-rocam-border space-y-4 lg:col-span-2">
        <div className="relative">
          <Search className="w-4 h-4 text-rocam-muted absolute left-3 top-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por QRU ou número do B.O..."
            className="w-full bg-rocam-dark border border-rocam-border text-xs rounded-lg pl-9 pr-3 py-2.5 text-slate-200 outline-none focus:border-rocam-yellow"
          />
        </div>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {filteredArrests.map((a) => (
            <div
              key={a.id}
              className="p-4 bg-rocam-dark/70 rounded-xl border border-rocam-border flex items-center justify-between text-xs gap-3"
            >
              <div className="min-w-0">
                <h4 className="font-bold text-slate-100 truncate">{a.qru || "Ocorrência"}</h4>
                <p className="text-rocam-muted truncate">
                  BO: {a.bo} | Oficiais: {a.officers.map((o) => resolveDisplayName(o.user)).join(", ") || "—"}
                </p>
                <p className="text-rocam-muted">{new Date(a.date).toLocaleDateString("pt-BR")}</p>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-bold shrink-0 ${
                  a.outcome === "SUCESSO" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                }`}
              >
                {a.outcome === "SUCESSO" ? "Sucesso" : "Sem Sucesso"}
              </span>
            </div>
          ))}
          {filteredArrests.length === 0 && (
            <p className="text-xs text-rocam-muted italic py-8 text-center">Nenhum registro encontrado.</p>
          )}
        </div>
      </div>
    </section>
  );
}
