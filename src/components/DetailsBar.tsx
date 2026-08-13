"use client";

import { FaCircleXmark, FaMinus, FaPlus, FaTriangleExclamation, FaClipboardList } from "react-icons/fa6";
import { useStore } from "@/lib/store";
import { evaluate, computePrice, smartAddonCount } from "@/lib/logic";
import { EQUIPMENT, SP_RULES, TRADITIONAL_RULES } from "@/lib/defaults";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Icon } from "./icons";
import { PlanId } from "@/lib/types";

function Qty({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="size-4.5 rounded bg-secondary flex items-center justify-center hover:bg-accent cursor-pointer"
      >
        <FaMinus className="size-2" />
      </button>
      <span className={cn("w-4 text-center text-[12px] font-bold tabular-nums", value > 0 ? "text-emerald-400" : "text-muted-foreground/60")}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="size-4.5 rounded bg-secondary flex items-center justify-center hover:bg-accent cursor-pointer"
      >
        <FaPlus className="size-2" />
      </button>
    </div>
  );
}

export function DetailsBar() {
  const { call, patchCall } = useStore();
  const v = evaluate(call.qual);

  const effectivePlan: PlanId = call.plan === "auto" ? (v.recommended ?? "sp") : call.plan;
  const addons = smartAddonCount(call.packageQty);
  const price = computePrice(effectivePlan, call.cameras, addons);
  const isTrad = effectivePlan === "traditional";

  const setQty = (id: string, n: number) => patchCall({ packageQty: { ...call.packageQty, [id]: n } });

  // SP-only panel features etc. that drop out under Traditional
  const excludedFeatures: string[] = [];
  if (isTrad) {
    EQUIPMENT.forEach((e) => {
      e.features?.forEach((f) => {
        if (!f.traditional) excludedFeatures.push(f.text);
      });
    });
  }

  return (
    <div className="rounded-lg border bg-card px-3 py-2 shrink-0 flex gap-3 items-stretch h-[172px]">
      {/* pitched package with quantities */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center gap-2 mb-1.5 shrink-0">
          <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-muted-foreground">
            <FaClipboardList className="size-2.5" /> PITCHED PACKAGE — SET THE NUMBERS · {isTrad ? "TRADITIONAL" : "SMART PAY"}
          </span>
          {call.plan === "auto" && (
            <span className="px-1 py-px rounded bg-sky-500/15 text-sky-300 border border-sky-500/40 text-[9px] font-semibold">AUTO</span>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-width:thin]">
          <div className="grid grid-cols-3 gap-x-3 gap-y-1 pr-1">
            {EQUIPMENT.map((e) => {
              const available = isTrad ? e.traditional : e.sp;
              const isCam = e.id === "camera";
              const qty = isCam ? (isTrad ? Math.min(call.cameras, 2) : call.cameras) : (call.packageQty[e.id] ?? 0);
              return (
                <div
                  key={e.id}
                  title={e.pitch}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-1.5 py-1",
                    available
                      ? qty > 0
                        ? "border-emerald-600/50 bg-emerald-500/10"
                        : "border-border bg-secondary/20"
                      : "border-red-500/50 bg-red-500/10"
                  )}
                >
                  {available ? (
                    <Qty
                      value={qty}
                      min={isCam ? 1 : 0}
                      max={isCam ? (isTrad ? 2 : 4) : 9}
                      onChange={(n) => (isCam ? patchCall({ cameras: n }) : setQty(e.id, n))}
                    />
                  ) : (
                    <FaCircleXmark className="size-3 text-red-500 shrink-0 mx-1" />
                  )}
                  <Icon name={e.icon} className={cn("size-3 shrink-0", available ? "text-emerald-400/80" : "text-red-400/80")} />
                  <span
                    className={cn(
                      "text-[10.5px] font-semibold leading-tight truncate",
                      available ? "text-foreground/90" : "text-red-400 line-through decoration-red-500/60"
                    )}
                  >
                    {e.name}
                  </span>
                </div>
              );
            })}
          </div>
          {excludedFeatures.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              <span className="text-[9px] font-bold tracking-widest text-red-400/80">ALSO NOT IN TRADITIONAL:</span>
              {excludedFeatures.map((f) => (
                <span key={f} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-red-500/50 bg-red-500/10 text-[9.5px] font-semibold text-red-400 line-through decoration-red-500/60">
                  <FaCircleXmark className="size-2 shrink-0" /> {f}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5 shrink-0">
          <span className="text-[9px] font-bold tracking-wide text-muted-foreground uppercase shrink-0">Other</span>
          <Input
            value={call.equipNotes}
            onChange={(e) => patchCall({ equipNotes: e.target.value })}
            placeholder="anything extra you promised…"
            className="h-6 text-[11px] px-2"
          />
        </div>
      </div>

      <div className="w-px bg-border shrink-0" />

      {/* price */}
      <div className="w-[230px] shrink-0 flex flex-col">
        <div className="text-[9px] font-bold tracking-widest text-muted-foreground mb-1">PRICE</div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[24px] font-black text-emerald-400 leading-none">${price.monthly.toFixed(2)}</span>
            <span className="text-[10px] text-muted-foreground font-medium">/mo</span>
          </div>
          {price.loan !== null && <span className="text-[10.5px] text-sky-300 font-semibold">Loan ${price.loan.toLocaleString()}</span>}
        </div>
        <div className="text-[10px] text-muted-foreground mt-1 leading-snug">
          ${price.monitoring} monitoring + ${price.equipment} equipment
          <br />
          {call.cameras} cam(s){!isTrad && addons > 0 && <> · {addons} smart add-on(s) (+${addons * SP_RULES.extraSmartMonthly}/mo)</>}
        </div>
        {isTrad ? (
          <div className="mt-auto pt-1 flex items-start gap-1 text-[9.5px] text-amber-300/90 leading-tight">
            <FaTriangleExclamation className="size-2.5 mt-px shrink-0" />
            Activation ${TRADITIONAL_RULES.activationFee} (not pitched) · email verification mandatory · credit at least FAIR · max 2 cams (+1 = +${TRADITIONAL_RULES.extraCameraOneTime})
          </div>
        ) : (
          <div className="mt-auto pt-1 text-[9.5px] text-sky-300/80 leading-tight">
            Smart lock / thermostat: +${SP_RULES.extraSmartMonthly}/mo & +${SP_RULES.extraSmartLoan} loan each · credit EXCELLENT / GOOD
          </div>
        )}
      </div>
    </div>
  );
}
