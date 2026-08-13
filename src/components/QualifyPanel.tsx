"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { FaCircleCheck, FaCircleXmark, FaCircleQuestion, FaTriangleExclamation, FaPhoneSlash } from "react-icons/fa6";
import { useStore } from "@/lib/store";
import { evaluate, PlanStatus } from "@/lib/logic";
import { OptionRow } from "./OptionRow";
import { cn } from "@/lib/utils";

const YN = [
  { value: "yes", label: "Yes", tone: "good" as const },
  { value: "no", label: "No", tone: "bad" as const },
];

function PlanBadge({ name, status }: { name: string; status: PlanStatus }) {
  return (
    <div
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 rounded-md border py-1.5 text-xs font-bold",
        status === "ok" && "border-emerald-500/60 bg-emerald-500/10 text-emerald-400",
        status === "blocked" && "border-red-500/60 bg-red-500/10 text-red-400 line-through decoration-red-500/70",
        status === "unknown" && "border-border bg-secondary/30 text-muted-foreground"
      )}
    >
      {status === "ok" && <FaCircleCheck className="size-3" />}
      {status === "blocked" && <FaCircleXmark className="size-3" />}
      {status === "unknown" && <FaCircleQuestion className="size-3" />}
      {name}
    </div>
  );
}

export function QualifyPanel() {
  const { call, patchQual } = useStore();
  const q = call.qual;
  const v = evaluate(q);
  const deadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (v.dead && deadRef.current) {
      gsap.fromTo(deadRef.current, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)" });
    }
  }, [v.dead, v.deadReasons.length]);

  const ownLabel =
    q.homeType === "condo" ? "Owns the condo?" : q.homeType === "house" ? "Homeowner?" : "Owns the home?";

  return (
    <div className="flex flex-col h-full min-h-0 rounded-lg border bg-card">
      <div className="px-3 pt-2.5 pb-2 border-b">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1.5">QUALIFICATION</div>
        <div className="flex gap-1.5">
          <PlanBadge name="SMART PAY" status={v.sp} />
          <PlanBadge name="TRADITIONAL" status={v.traditional} />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-1.5">
        <OptionRow
          label="Home type"
          value={q.homeType}
          onChange={(x) => patchQual({ homeType: x as typeof q.homeType, ownsHome: "unknown", ownsLand: "unknown" })}
          options={[
            { value: "house", label: "House" },
            { value: "condo", label: "Condo" },
            { value: "mobileFixed", label: "Mobile·Fixed" },
            { value: "mobileWheels", label: "Mobile·Wheels" },
          ]}
        />
        {(q.homeType === "house" || q.homeType === "condo" || q.homeType === "unknown") && (
          <OptionRow label={ownLabel} value={q.ownsHome} onChange={(x) => patchQual({ ownsHome: x as typeof q.ownsHome })} options={YN} />
        )}
        {(q.homeType === "mobileFixed" || q.homeType === "mobileWheels") && (
          <OptionRow label="Owns the land?" value={q.ownsLand} onChange={(x) => patchQual({ ownsLand: x as typeof q.ownsLand })} options={YN} />
        )}
        <OptionRow label="Internet?" value={q.internet} onChange={(x) => patchQual({ internet: x as typeof q.internet })} options={YN} />
        <OptionRow label="Smartphone?" value={q.phone} onChange={(x) => patchQual({ phone: x as typeof q.phone })} options={YN} />
        <OptionRow label="Has a system?" value={q.hasSystem} onChange={(x) => patchQual({ hasSystem: x as typeof q.hasSystem })} options={YN} />
        {q.hasSystem === "yes" && (
          <OptionRow
            label="Using it for…"
            value={q.systemAge}
            onChange={(x) => patchQual({ systemAge: x as typeof q.systemAge })}
            options={[
              { value: "lt26", label: "< 2.6 yrs", tone: "bad" },
              { value: "gte26", label: "2.6+ yrs", tone: "good" },
              { value: "gte3", label: "3+ yrs", tone: "good" },
            ]}
          />
        )}
        {q.hasSystem === "yes" && q.systemAge === "lt26" && (
          <OptionRow
            label="< 6 months left?"
            value={q.buyoutLt6mo}
            onChange={(x) => patchQual({ buyoutLt6mo: x as typeof q.buyoutLt6mo })}
            options={[
              { value: "yes", label: "Yes → buy out", tone: "good" },
              { value: "no", label: "No", tone: "bad" },
            ]}
          />
        )}
        <OptionRow label="Senior citizen?" value={q.senior} onChange={(x) => patchQual({ senior: x as typeof q.senior })} options={YN} />
        <OptionRow
          label="Credit score"
          value={q.credit}
          onChange={(x) => patchQual({ credit: x as typeof q.credit })}
          options={[
            { value: "excellent", label: "Exc", tone: "good" },
            { value: "good", label: "Good", tone: "good" },
            { value: "fair", label: "Fair" },
            { value: "poor", label: "Poor", tone: "bad" },
          ]}
        />

        <div className="mt-2 space-y-1.5 pb-2">
          {v.dead && (
            <div ref={deadRef} className="rounded-md border border-red-500/70 bg-red-500/15 px-2.5 py-2">
              <div className="flex items-center gap-1.5 text-red-400 font-bold text-[11px] mb-1">
                <FaPhoneSlash className="size-3.5" /> CALL END — NOT QUALIFIED
              </div>
              {v.deadReasons.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10.5px] text-red-300/90 leading-snug">
                  <FaCircleXmark className="size-2.5 mt-0.5 shrink-0" /> {r}
                </div>
              ))}
            </div>
          )}
          {v.notes.map((n, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-1.5 rounded-md border px-2 py-1.5 text-[10.5px] leading-snug",
                n.tone === "warn" && "border-amber-500/50 bg-amber-500/10 text-amber-300",
                n.tone === "info" && "border-sky-500/40 bg-sky-500/10 text-sky-300",
                n.tone === "bad" && "border-red-500/50 bg-red-500/10 text-red-300"
              )}
            >
              <FaTriangleExclamation className="size-2.5 mt-0.5 shrink-0" />
              {n.text}
            </div>
          ))}
          {v.recommended && !v.dead && (
            <div className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-2 py-1.5 text-[11px] font-semibold text-emerald-400">
              ➜ Recommended: {v.recommended === "sp" ? "SMART PAY" : "TRADITIONAL"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
