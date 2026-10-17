"use client";

import { useEffect, useState } from "react";

// Repeating countdown copied from the live theme: windows of `hours` starting at `anchor` (ms epoch).
export function SaleTimer({ anchor, hours }: { anchor: number; hours: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, []);
  if (now === null) return <div className="h-[74px]" />; // the clock must not render on the server (hydration mismatch)
  const cycle = hours * 3600_000;
  const end = anchor + (Math.floor((now - anchor) / cycle) + 1) * cycle;
  const s = Math.max(0, Math.floor((end - now) / 1000));
  const parts = [
    [Math.floor(s / 86400), "Days"],
    [Math.floor((s % 86400) / 3600), "Hrs"],
    [Math.floor((s % 3600) / 60), "Min"],
    [s % 60, "Sec"],
  ] as const;
  const shown = parts[0][0] ? parts : parts.slice(1);
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#111] px-[18px] py-[14px] text-white">
      <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.06em]">
        <span className="h-[6px] w-[6px] rounded-full bg-white" />
        Sale ends in
      </span>
      <span className="flex items-center gap-[6px]">
        {shown.map(([n, label], i) => (
          <span key={label} className="flex items-center gap-[6px]">
            {i > 0 && <span className="text-[14px] font-bold text-white/55">:</span>}
            <span className="flex w-[44px] flex-col items-center rounded-md border border-white/30 py-[3px]">
              <span className="text-[17px] font-bold leading-[22px]">{String(n).padStart(2, "0")}</span>
              <span className="text-[9px] font-bold uppercase text-white/65">{label}</span>
            </span>
          </span>
        ))}
      </span>
    </div>
  );
}
