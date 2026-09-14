"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Rank } from "@/generated/prisma";

interface ViewAsContextValue {
  /** The user's real, server-verified rank. Never changes. */
  realRank: Rank;
  /** Rank currently used for UI rendering (may be simulated by Staff). */
  effectiveRank: Rank;
  /** Only meaningful when realRank === STAFF. */
  setSimulatedRank: (rank: Rank | null) => void;
  isSimulating: boolean;
}

const ViewAsContext = createContext<ViewAsContextValue | null>(null);

export function ViewAsProvider({
  realRank,
  children,
}: {
  realRank: Rank;
  children: ReactNode;
}) {
  const [simulated, setSimulated] = useState<Rank | null>(null);

  const value = useMemo<ViewAsContextValue>(() => {
    const canSimulate = realRank === Rank.STAFF;
    const effectiveRank = canSimulate && simulated ? simulated : realRank;
    return {
      realRank,
      effectiveRank,
      setSimulatedRank: (rank) => {
        if (canSimulate) setSimulated(rank);
      },
      isSimulating: canSimulate && simulated !== null,
    };
  }, [realRank, simulated]);

  return <ViewAsContext.Provider value={value}>{children}</ViewAsContext.Provider>;
}

export function useViewAs() {
  const ctx = useContext(ViewAsContext);
  if (!ctx) throw new Error("useViewAs must be used within a ViewAsProvider");
  return ctx;
}
