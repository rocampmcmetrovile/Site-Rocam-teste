"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-config";
import { LiveClock } from "@/components/dashboard/live-clock";

const ROCAM_LOGO = "/rocam-logo.png";

export function Header() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => item.href === pathname);
  const title = current?.label ?? "Dashboard Geral — ROCAM Metroville";

  return (
    <header className="bg-rocam-card border-b border-rocam-border p-4 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Image
          src={ROCAM_LOGO}
          alt="ROCAM"
          width={40}
          height={40}
          unoptimized
          className="w-10 h-10 rounded-full border border-rocam-yellow/50 object-cover"
        />
        <div>
          <h2 className="font-oswald text-lg font-bold text-slate-100 uppercase tracking-wide">
            {title}
          </h2>
          <p className="text-xs text-rocam-muted">
            Rondas Ostensivas com Apoio de Motocicletas • Metroville RP
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <div className="hidden sm:flex items-center gap-2 bg-rocam-dark/60 border border-rocam-border px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-rocam-muted">Servidor:</span>
          <span className="font-bold text-slate-200">Metroville RP</span>
        </div>
        <LiveClock />
      </div>
    </header>
  );
}
