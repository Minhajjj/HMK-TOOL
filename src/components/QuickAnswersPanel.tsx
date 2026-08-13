"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Icon } from "./icons";

const CATS: { key: string; label: string; color: string }[] = [
  { key: "objection", label: "OBJECTIONS", color: "text-red-400" },
  { key: "info", label: "SITUATIONS & FAQs", color: "text-sky-400" },
  { key: "rebuttal", label: "PITCH BOOSTERS", color: "text-amber-400" },
];

const CAT_STYLE: Record<string, { idle: string; active: string; dot: string }> = {
  objection: {
    idle: "border-red-500/30 hover:border-red-500/70 hover:bg-red-500/10",
    active: "border-red-500 bg-red-500/20 text-red-300",
    dot: "text-red-400",
  },
  info: {
    idle: "border-sky-500/30 hover:border-sky-500/70 hover:bg-sky-500/10",
    active: "border-sky-500 bg-sky-500/20 text-sky-300",
    dot: "text-sky-400",
  },
  rebuttal: {
    idle: "border-amber-500/30 hover:border-amber-500/70 hover:bg-amber-500/10",
    active: "border-amber-500 bg-amber-500/20 text-amber-300",
    dot: "text-amber-400",
  },
};

export function QuickAnswersPanel() {
  const { content, call, patchCall } = useStore();

  return (
    <div className="flex flex-col h-full min-h-0 rounded-lg border bg-card overflow-hidden">
      <div className="px-3 pt-2.5 pb-2 border-b shrink-0">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground">QUICK ANSWERS</div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1.5 [scrollbar-width:thin]">
        {CATS.map((cat) => (
          <div key={cat.key} className="mb-1.5">
            <div className={cn("text-[9px] font-bold tracking-widest px-1 py-1", cat.color)}>{cat.label}</div>
            <div className="grid grid-cols-2 gap-1">
              {content.rebuttals
                .filter((r) => r.category === cat.key)
                .map((r) => {
                  const s = CAT_STYLE[r.category] ?? CAT_STYLE.info;
                  const active = call.activeRebuttal === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => patchCall({ activeRebuttal: active ? null : r.id })}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1.5 rounded-md border text-[10.5px] font-semibold text-left leading-tight transition-colors cursor-pointer bg-secondary/30",
                        active ? s.active : cn("text-foreground/80", s.idle)
                      )}
                    >
                      <Icon name={r.icon} className={cn("size-3 shrink-0", s.dot)} />
                      <span className="min-w-0">{r.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
