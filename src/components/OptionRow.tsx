"use client";

import { cn } from "@/lib/utils";

export interface Opt {
  value: string;
  label: string;
  tone?: "good" | "bad" | "neutral";
}

export function OptionRow({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: Opt[];
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-1.5 py-1", className)}>
      <span className="text-[11px] font-medium text-muted-foreground shrink-0">{label}</span>
      <div className="flex gap-0.5 flex-wrap justify-end">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onChange(active ? "unknown" : o.value)}
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer",
                active
                  ? o.tone === "bad"
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : o.tone === "good"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                      : "bg-sky-500/20 border-sky-500 text-sky-300"
                  : "bg-secondary/40 border-border text-muted-foreground hover:border-ring hover:text-foreground"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
