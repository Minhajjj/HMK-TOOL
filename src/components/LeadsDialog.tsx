"use client";

import { useState } from "react";
import { FaCopy, FaTrash, FaCheck } from "react-icons/fa6";
import { useStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lead } from "@/lib/types";

function leadText(l: Lead): string {
  const c = l.customer;
  return [
    `Name: ${c.firstName} ${c.lastName}`,
    `DOB: ${c.dob}`,
    `Address: ${c.address}`,
    `Zip: ${c.zip}`,
    `Email: ${c.email}`,
    `Best Number: ${c.bestNumber}`,
    `Emergency Contact: ${c.emergencyContact}`,
    `Credit: ${l.qual.credit}`,
    `Plan: ${l.plan}${l.monthly ? ` — $${l.monthly}/mo, ${l.cameras} cam(s)` : ""}`,
    l.notes?.trim() ? `Equipment: ${l.notes.trim()}` : "",
    `Saved: ${new Date(l.savedAt).toLocaleString()}`,
  ].filter(Boolean).join("\n");
}

export function LeadsDialog({ trigger }: { trigger: React.ReactNode }) {
  const { leads, deleteLead } = useStore();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (l: Lead) => {
    await navigator.clipboard.writeText(leadText(l));
    setCopied(l.id);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <Dialog>
      <DialogTrigger render={trigger as React.ReactElement<Record<string, unknown>>} />
      <DialogContent className="sm:max-w-[720px] h-[80vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Saved Calls / Leads ({leads.length})</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
          {leads.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No leads yet. Press <b>New Call</b> after a call — the customer info on the board gets saved here automatically.
            </p>
          )}
          {leads.map((l) => (
            <div key={l.id} className="rounded-md border px-3 py-2 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm">
                    {l.customer.firstName || l.customer.lastName ? `${l.customer.firstName} ${l.customer.lastName}`.trim() : "(no name)"}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                    l.plan === "not-qualified"
                      ? "border-red-500/60 text-red-400"
                      : l.plan.includes("SMART")
                        ? "border-emerald-500/60 text-emerald-400"
                        : "border-sky-500/60 text-sky-300"
                  }`}>
                    {l.plan}
                  </span>
                  {l.monthly && <span className="text-[11px] text-emerald-400 font-semibold">${l.monthly}/mo · {l.cameras} cam(s)</span>}
                  <span className="text-[10px] text-muted-foreground ml-auto">{new Date(l.savedAt).toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {[l.customer.bestNumber, l.customer.email, l.customer.zip && `zip ${l.customer.zip}`, l.customer.address].filter(Boolean).join(" · ") || "no contact info"}
                </div>
                {l.notes?.trim() && (
                  <div className="text-[11px] text-sky-300/90 mt-0.5">
                    <b>Equipment:</b> {l.notes.trim()}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="secondary" className="h-7 w-7 p-0" onClick={() => copy(l)} title="Copy lead">
                  {copied === l.id ? <FaCheck className="size-3 text-emerald-400" /> : <FaCopy className="size-3" />}
                </Button>
                <Button size="sm" variant="secondary" className="h-7 w-7 p-0 hover:text-red-400" onClick={() => deleteLead(l.id)} title="Delete lead">
                  <FaTrash className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
