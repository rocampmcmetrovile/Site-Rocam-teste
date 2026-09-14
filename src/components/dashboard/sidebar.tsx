"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, ChevronDown, RotateCcw } from "lucide-react";
import { Rank } from "@/generated/prisma";
import { NAV_ITEMS } from "@/lib/nav-config";
import { isAtLeast, isStaff, RANK_EMOJI, RANK_LABELS, RANK_ORDER } from "@/lib/permissions";
import { useViewAs } from "@/components/view-as-context";

const ROCAM_LOGO = "/rocam-logo.png";

function canSee(requires: Rank | "staff" | undefined, effectiveRank: Rank) {
  if (!requires) return true;
  if (requires === "staff") return isStaff(effectiveRank);
  return isAtLeast(effectiveRank, requires);
}

function accessBadgeLabel(rank: Rank) {
  if (rank === Rank.STAFF) return "MASTER STAFF";
  if (isAtLeast(rank, Rank.SUBGESTOR)) return "COMANDO";
  if (isAtLeast(rank, Rank.SUPERVISOR)) return "SUPERVISOR";
  return "OFICIAL";
}

export function Sidebar({
  username,
  avatarUrl,
}: {
  username: string;
  avatarUrl: string | null;
}) {
  const pathname = usePathname();
  const { realRank, effectiveRank, setSimulatedRank, isSimulating } = useViewAs();

  return (
    <aside className="w-full md:w-64 bg-rocam-card border-r border-rocam-border shrink-0 flex flex-col justify-between z-30">
      <div>
        <div className="p-4 border-b border-rocam-border flex items-center gap-3">
          <Image
            src={ROCAM_LOGO}
            alt="ROCAM Logo"
            width={48}
            height={48}
            unoptimized
            className="w-12 h-12 rounded-full object-cover border-2 border-rocam-yellow shadow-lg shadow-rocam-yellow/20"
          />
          <div>
            <h1 className="font-oswald text-xl font-bold tracking-wider text-rocam-yellow leading-none">
              R.O.C.A.M.
            </h1>
            <p className="text-[10px] text-rocam-muted tracking-widest uppercase font-semibold mt-1">
              POLÍCIA MILITAR DA CAPITAL
            </p>
          </div>
        </div>

        <div className="p-3 bg-rocam-dark/70 border-b border-rocam-border flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl ?? "https://placehold.co/100x100/5865f2/ffffff?text=DC"}
              alt={username}
              className="w-9 h-9 rounded-full object-cover border border-rocam-discord"
            />
            <div className="truncate">
              <p className="font-bold text-xs text-slate-100 truncate">{username}</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase">
                {RANK_LABELS[realRank]}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sair do Discord"
            className="text-rocam-muted hover:text-rose-400 p-1.5 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {isStaff(realRank) && (
          <div className="p-4 bg-rocam-dark/50 border-b border-rocam-border">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-400">
                👑 Painel Staff — Visualizar como
              </label>
            </div>
            <div className="relative">
              <select
                value={isSimulating ? effectiveRank : ""}
                onChange={(e) =>
                  setSimulatedRank(e.target.value ? (e.target.value as Rank) : null)
                }
                className="w-full bg-rocam-hover text-xs font-semibold text-rocam-yellow border border-rocam-border rounded-lg p-2.5 outline-none focus:border-rocam-yellow appearance-none cursor-pointer"
              >
                <option value="">👑 Staff (Acesso Total / Master)</option>
                {RANK_ORDER.filter((r) => r !== Rank.STAFF).map((r) => (
                  <option key={r} value={r}>
                    {RANK_EMOJI[r]} {RANK_LABELS[r]}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-rocam-muted absolute right-2.5 top-3 pointer-events-none" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-rocam-muted">Nível de Acesso (visual):</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {accessBadgeLabel(effectiveRank)}
              </span>
            </div>
          </div>
        )}

        <nav className="p-3 space-y-1 text-xs">
          {NAV_ITEMS.filter((item) => canSee(item.requires, effectiveRank)).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const isStaffItem = item.id === "staff-panel";
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors border ${
                  active
                    ? isStaffItem
                      ? "text-purple-400 bg-purple-500/10 border-purple-500/30"
                      : "text-rocam-yellow bg-rocam-yellow/10 border-rocam-yellow/30"
                    : isStaffItem
                      ? "text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
                      : "text-rocam-muted border-transparent hover:bg-rocam-hover hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-rocam-border space-y-2">
        <div className="flex items-center justify-between text-[11px] text-rocam-muted px-2">
          <span>Banco de Dados</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <RotateCcw className="w-3 h-3" /> Neon (online)
          </span>
        </div>
      </div>
    </aside>
  );
}
