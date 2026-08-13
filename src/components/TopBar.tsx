"use client";

import { useEffect, useState } from "react";
import { FaFaceSmile, FaFaceFrown, FaPhone, FaGear, FaUsers, FaDollarSign, FaCalendarCheck, FaRightLeft } from "react-icons/fa6";
import { useStore } from "@/lib/store";
import { evaluate, computePrice, smartAddonCount } from "@/lib/logic";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SettingsDialog } from "./SettingsDialog";
import { LeadsDialog } from "./LeadsDialog";
import { PlanId } from "@/lib/types";

function Timer({ startedAt }: { startedAt: number | null }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!startedAt) return null;
  const s = Math.floor((now - startedAt) / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return (
    <div
      className={cn(
        "px-2 py-0.5 rounded-md border font-mono text-xs font-bold tabular-nums",
        s < 90 ? "border-emerald-500/50 text-emerald-400" : s < 120 ? "border-amber-500/60 text-amber-400" : "border-red-500/60 text-red-400 animate-pulse"
      )}
      title="Qualify the customer within 120 seconds"
    >
      {mm}:{ss}
    </div>
  );
}

export function TopBar() {
  const { content, call, patchCall, saveLeadAndReset } = useStore();
  const v = evaluate(call.qual);
  const sections = content.scriptSections;
  const activeId = !call.activeRebuttal ? sections[Math.min(call.sectionIndex, sections.length - 1)]?.id : null;
  const jumpTo = (id: string) => {
    const i = sections.findIndex((s) => s.id === id);
    if (i >= 0) patchCall({ sectionIndex: i, activeRebuttal: null });
  };
  const effectivePlan: PlanId = call.plan === "auto" ? (v.recommended ?? "sp") : call.plan;
  const price = computePrice(effectivePlan, call.cameras, smartAddonCount(call.packageQty));

  useEffect(() => {
    if (!call.startedAt) patchCall({ startedAt: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planLabel = v.dead ? "CALL END" : effectivePlan === "sp" ? "SMART PAY" : "TRADITIONAL";

  return (
    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-2 px-3 py-1.5 rounded-lg border bg-card shrink-0">
      <div className="font-black text-base tracking-tight shrink-0">
        <span className="text-sky-400">H</span>
        <span className="text-red-500">M</span>
        <span className="text-sky-400">K</span>
      </div>

      <Timer startedAt={call.startedAt} />

      <div className="flex items-center gap-1 ml-1">
        <span className="text-[10px] text-muted-foreground font-semibold mr-0.5">Day?</span>
        <button
          onClick={() => patchCall({ mood: call.mood === "good" ? "unknown" : "good" })}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-semibold cursor-pointer transition-colors",
            call.mood === "good" ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <FaFaceSmile className="size-3" /> Good
        </button>
        <button
          onClick={() => patchCall({ mood: call.mood === "bad" ? "unknown" : "bad" })}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-semibold cursor-pointer transition-colors",
            call.mood === "bad" ? "border-amber-500 bg-amber-500/20 text-amber-300" : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <FaFaceFrown className="size-3" /> Bad
        </button>
      </div>

      <div className="flex-1" />

      {/* jump straight to Price / Closing — no chip-row scrolling */}
      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        <button
          onClick={() => jumpTo("price")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wide cursor-pointer transition-colors",
            activeId === "price"
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
              : "border-emerald-500/40 text-emerald-400/80 hover:bg-emerald-500/10 hover:text-emerald-300"
          )}
          title="Jump to the Price section"
        >
          <FaDollarSign className="size-3" /> Price
        </button>
        <button
          onClick={() => jumpTo("closing")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wide cursor-pointer transition-colors",
            activeId === "closing"
              ? "border-sky-500 bg-sky-500/20 text-sky-300"
              : "border-sky-500/40 text-sky-400/80 hover:bg-sky-500/10 hover:text-sky-300"
          )}
          title="Jump to Closing & Appointment"
        >
          <FaCalendarCheck className="size-3" /> Closing<span className="hidden xl:inline"> &amp; Appointment</span>
        </button>
        <button
          onClick={() => jumpTo("transfer")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-md border text-[11px] font-bold uppercase tracking-wide cursor-pointer transition-colors",
            activeId === "transfer"
              ? "border-amber-500 bg-amber-500/20 text-amber-300"
              : "border-amber-500/40 text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-300"
          )}
          title="Jump to the Transfer section"
        >
          <FaRightLeft className="size-3" /> Transfer
        </button>
      </div>

      <div className="flex-1" />

      {/* plan selector */}
      <div className="flex items-center rounded-md border overflow-hidden">
        {(["auto", "sp", "traditional"] as const).map((p) => (
          <button
            key={p}
            onClick={() => patchCall({ plan: p })}
            className={cn(
              "px-2.5 py-1 text-[10.5px] font-bold cursor-pointer transition-colors uppercase",
              call.plan === p ? "bg-primary text-primary-foreground" : "bg-secondary/30 text-muted-foreground hover:text-foreground"
            )}
          >
            {p === "auto" ? "Auto" : p === "sp" ? "Smart Pay" : "Traditional"}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "px-2.5 py-1 rounded-md text-[11px] font-black border",
          v.dead
            ? "border-red-500 bg-red-500/20 text-red-400"
            : effectivePlan === "sp"
              ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-400"
              : "border-sky-500/60 bg-sky-500/10 text-sky-300"
        )}
      >
        {planLabel}
      </div>

      <LeadsDialog
        trigger={
          <Button size="sm" variant="secondary" className="h-7 text-xs gap-1.5">
            <FaUsers className="size-3" /> Leads
          </Button>
        }
      />
      <SettingsDialog
        trigger={
          <Button size="sm" variant="secondary" className="h-7 text-xs gap-1.5">
            <FaGear className="size-3" /> Edit
          </Button>
        }
      />
      <Button size="sm" className="h-7 text-xs gap-1.5 font-bold" onClick={() => saveLeadAndReset(v.dead ? "not-qualified" : planLabel, v.dead ? null : price.monthly)}>
        <FaPhone className="size-3" /> New Call
      </Button>
    </div>
  );
}
