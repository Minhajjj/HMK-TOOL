"use client";

import { useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa6";
import { useStore } from "@/lib/store";
import { evaluate, computePrice, packageSummary, smartAddonCount } from "@/lib/logic";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Customer, PlanId } from "@/lib/types";

function Field({ label, value, onChange, placeholder, className }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="block truncate text-[9px] font-bold tracking-wide text-muted-foreground uppercase">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-6.5 mt-0.5 text-[11.5px] px-2" />
    </label>
  );
}

export function CustomerCard() {
  const { call, patchCustomer, patchQual } = useStore();
  const [copied, setCopied] = useState(false);
  const c = call.customer;
  const v = evaluate(call.qual);
  const effectivePlan: PlanId = call.plan === "auto" ? (v.recommended ?? "sp") : call.plan;
  const price = computePrice(effectivePlan, call.cameras, smartAddonCount(call.packageQty));

  const set = (k: keyof Customer) => (val: string) => patchCustomer({ [k]: val });

  const copyAll = async () => {
    const planLabel = v.dead ? "NOT QUALIFIED" : effectivePlan === "sp" ? "SMART PAY" : "TRADITIONAL";
    const lines = [
      `Name: ${c.firstName} ${c.lastName}`.trim(),
      `DOB: ${c.dob}`,
      `Address: ${c.address}`,
      `Email: ${c.email}`,
      `Best Number: ${c.bestNumber}`,
      `Emergency Contact: ${c.emergencyContact}`,
      `Credit Score: ${call.qual.credit}`,
      `Zip: ${c.zip}`,
      `Plan: ${planLabel}${v.dead ? "" : ` — $${price.monthly.toFixed(2)}/mo${price.loan ? `, loan $${price.loan.toLocaleString()}` : ""}`}`,
      `Equipment: ${packageSummary(call)}`,
    ].filter(Boolean);
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="rounded-lg border bg-card px-3 pt-2 pb-2.5 shrink-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold tracking-widest text-muted-foreground">CUSTOMER INFO</span>
        <button
          onClick={copyAll}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold cursor-pointer transition-colors",
            copied
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
              : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:border-ring"
          )}
        >
          {copied ? <FaCheck className="size-2.5" /> : <FaCopy className="size-2.5" />}
          {copied ? "Copied!" : "Copy all"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <Field label="First name" value={c.firstName} onChange={set("firstName")} />
        <Field label="Last name" value={c.lastName} onChange={set("lastName")} />
        <Field label="DOB" value={c.dob} onChange={set("dob")} placeholder="MM/DD/YYYY" className="col-span-2" />
        <Field label="Address" value={c.address} onChange={set("address")} className="col-span-2" />
        <Field label="Email" value={c.email} onChange={set("email")} className="col-span-2" />
        <Field label="Best number" value={c.bestNumber} onChange={set("bestNumber")} />
        <Field label="Emergency contact" value={c.emergencyContact} onChange={set("emergencyContact")} />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[9px] font-bold tracking-wide text-muted-foreground uppercase">Credit</span>
        <div className="flex gap-0.5">
          {(["excellent", "good", "fair", "poor"] as const).map((cr) => (
            <button
              key={cr}
              onClick={() => patchQual({ credit: call.qual.credit === cr ? "unknown" : cr })}
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-semibold border capitalize cursor-pointer",
                call.qual.credit === cr
                  ? cr === "poor"
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : cr === "fair"
                      ? "bg-sky-500/20 border-sky-500 text-sky-300"
                      : "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                  : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {cr === "excellent" ? "Exc" : cr}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1">
        <Field label="Zip" value={c.zip} onChange={set("zip")} />
      </div>
    </div>
  );
}
