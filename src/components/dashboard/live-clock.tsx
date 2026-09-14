"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function LiveClock() {
  const [time, setTime] = useState<string>("00:00:00");

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("pt-BR"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-rocam-dark/60 border border-rocam-border px-3 py-1.5 rounded-lg">
      <Clock className="w-3.5 h-3.5 text-rocam-yellow" />
      <span className="font-mono text-rocam-yellow font-bold">{time}</span>
    </div>
  );
}
