"use client";

import { useState } from "react";
import { FaRotateLeft, FaCheck } from "react-icons/fa6";
import { useStore } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SettingsDialog({ trigger }: { trigger: React.ReactNode }) {
  const { content, setContent, resetContent } = useStore();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const patchSection = (id: string, p: Partial<{ title: string; body: string; note: string }>) =>
    setContent({
      ...content,
      scriptSections: content.scriptSections.map((s) => (s.id === id ? { ...s, ...p } : s)),
    });

  const patchRebuttal = (id: string, p: Partial<{ label: string; text: string }>) =>
    setContent({
      ...content,
      rebuttals: content.rebuttals.map((r) => (r.id === id ? { ...r, ...p } : r)),
    });

  return (
    <Dialog>
      <DialogTrigger render={trigger as React.ReactElement<Record<string, unknown>>} />
      <DialogContent className="sm:max-w-[780px] h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center justify-between pr-6">
            <span>Edit Scripts & Content <span className="text-xs font-normal text-muted-foreground">— changes save automatically</span></span>
            <Button
              size="sm"
              variant={confirmReset ? "destructive" : "secondary"}
              className="h-7 text-xs gap-1.5"
              onClick={() => {
                if (confirmReset) {
                  resetContent();
                  setConfirmReset(false);
                } else setConfirmReset(true);
              }}
            >
              <FaRotateLeft className="size-3" />
              {confirmReset ? "Click again to confirm reset" : "Reset to defaults"}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="script" className="flex-1 min-h-0 flex flex-col">
          <TabsList className="shrink-0">
            <TabsTrigger value="script">Pitch Script</TabsTrigger>
            <TabsTrigger value="rebuttals">Rebuttals & Answers</TabsTrigger>
            <TabsTrigger value="mood">Mood Lines</TabsTrigger>
          </TabsList>

          <TabsContent value="script" className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
            {content.scriptSections.map((s, i) => (
              <div key={s.id} className="rounded-md border">
                <button
                  className="w-full text-left px-3 py-2 text-sm font-semibold flex items-center justify-between cursor-pointer hover:bg-secondary/40"
                  onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
                >
                  <span>{i + 1}. {s.title}</span>
                  <span className="text-muted-foreground text-xs">{openSection === s.id ? "▲" : "▼"}</span>
                </button>
                {openSection === s.id && (
                  <div className="px-3 pb-3 space-y-2">
                    <Input value={s.title} onChange={(e) => patchSection(s.id, { title: e.target.value })} className="h-8 text-sm font-semibold" />
                    <Textarea
                      value={s.body}
                      onChange={(e) => patchSection(s.id, { body: e.target.value })}
                      className="text-[13px] leading-relaxed min-h-[220px] font-normal"
                    />
                    <div>
                      <div className="text-[10px] font-bold text-amber-400 mb-1">AGENT NOTE (not read to customer)</div>
                      <Textarea value={s.note ?? ""} onChange={(e) => patchSection(s.id, { note: e.target.value })} className="text-[12px] min-h-[52px]" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="rebuttals" className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
            {content.rebuttals.map((r) => (
              <div key={r.id} className="rounded-md border">
                <button
                  className="w-full text-left px-3 py-2 text-sm font-semibold flex items-center justify-between cursor-pointer hover:bg-secondary/40"
                  onClick={() => setOpenSection(openSection === r.id ? null : r.id)}
                >
                  <span className={cn(
                    r.category === "objection" && "text-red-400",
                    r.category === "info" && "text-sky-400",
                    r.category === "rebuttal" && "text-amber-400"
                  )}>{r.label}</span>
                  <span className="text-muted-foreground text-xs">{openSection === r.id ? "▲" : "▼"}</span>
                </button>
                {openSection === r.id && (
                  <div className="px-3 pb-3 space-y-2">
                    <Input value={r.label} onChange={(e) => patchRebuttal(r.id, { label: e.target.value })} className="h-8 text-sm font-semibold" />
                    <Textarea
                      value={r.text}
                      onChange={(e) => patchRebuttal(r.id, { text: e.target.value })}
                      className="text-[13px] leading-relaxed min-h-[220px]"
                    />
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="mood" className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
            <div>
              <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1"><FaCheck className="size-3" /> When their day is GOOD</div>
              <Textarea value={content.moodGood} onChange={(e) => setContent({ ...content, moodGood: e.target.value })} className="text-[13px]" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-400 mb-1">When their day is BAD</div>
              <Textarea value={content.moodBad} onChange={(e) => setContent({ ...content, moodBad: e.target.value })} className="text-[13px]" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              These lines are injected into the Greeting section at the [MOOD LINE] marker when you press Good / Bad in the top bar. The rest of the script never changes.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
