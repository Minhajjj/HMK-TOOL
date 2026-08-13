"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { FaAngleLeft, FaAngleRight, FaArrowLeft, FaLightbulb } from "react-icons/fa6";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icon } from "./icons";

function ScriptBody({ body, moodLine, moodTone }: { body: string; moodLine: string | null; moodTone: "good" | "bad" | null }) {
  const paras = body.split(/\n/);
  return (
    <div className="space-y-4">
      {paras.map((p, i) => {
        const t = p.trim();
        if (!t) return null;
        if (t === "[MOOD LINE]") {
          if (!moodLine)
            return (
              <p key={i} className="text-[13px] text-muted-foreground border border-dashed rounded-md px-3 py-1.5">
                ← Set the customer&apos;s mood (Good / Bad day) in the top bar to show the right line here.
              </p>
            );
          return (
            <p
              key={i}
              className={cn(
                "text-[15px] font-semibold leading-[1.85] rounded-md px-3.5 py-2.5 border",
                moodTone === "good"
                  ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/50 text-amber-300"
              )}
            >
              {moodLine}
            </p>
          );
        }
        const idx = t.indexOf(":");
        const label = idx > 1 && idx < 45 ? t.slice(0, idx) : null;
        if (label && /^[A-Z]/.test(label) && label === label.toUpperCase()) {
          return (
            <p key={i} className="text-[15px] leading-[1.9]">
              <span className="font-bold text-sky-400">{t.slice(0, idx + 1)}</span>
              <span className="text-foreground/90">{t.slice(idx + 1)}</span>
            </p>
          );
        }
        return (
          <p key={i} className={cn("text-[15px] leading-[1.9] text-foreground/90", t.startsWith("→") && "pl-4 text-sky-300")}>
            {t}
          </p>
        );
      })}
    </div>
  );
}

export function ScriptCenter() {
  const { content, call, patchCall } = useStore();
  const bodyRef = useRef<HTMLDivElement>(null);
  const sections = content.scriptSections;
  const idx = Math.min(call.sectionIndex, sections.length - 1);
  const section = sections[idx];
  const rebuttal = call.activeRebuttal ? content.rebuttals.find((r) => r.id === call.activeRebuttal) ?? null : null;

  useEffect(() => {
    if (bodyRef.current) {
      gsap.fromTo(bodyRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" });
    }
  }, [idx, call.activeRebuttal]);

  const moodLine = useMemo(() => {
    if (call.mood === "good") return content.moodGood;
    if (call.mood === "bad") return content.moodBad;
    return null;
  }, [call.mood, content]);

  return (
    <div className="flex flex-col h-full min-h-0 rounded-lg border bg-card overflow-hidden">
      {/* section chips */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b overflow-x-auto shrink-0 [scrollbar-width:thin]">
        {sections.map((s, i) => (
          <button
            key={s.id}
            onClick={() => patchCall({ sectionIndex: i, activeRebuttal: null })}
            className={cn(
              "px-2 py-1 rounded-md text-[10.5px] font-semibold whitespace-nowrap border transition-colors cursor-pointer",
              i === idx && !rebuttal
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/40 text-muted-foreground border-transparent hover:text-foreground hover:border-border"
            )}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>

      {/* body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4" ref={bodyRef}>
        {rebuttal ? (
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Button size="sm" variant="secondary" className="h-7 text-xs gap-1.5" onClick={() => patchCall({ activeRebuttal: null })}>
                <FaArrowLeft className="size-3" /> Back to script
              </Button>
              <div
                className={cn(
                  "flex items-center gap-2 font-bold text-base",
                  rebuttal.category === "objection" && "text-red-400",
                  rebuttal.category === "info" && "text-sky-400",
                  rebuttal.category === "rebuttal" && "text-amber-400"
                )}
              >
                <Icon name={rebuttal.icon} className="size-4" />
                {rebuttal.label}
              </div>
            </div>
            <ScriptBody body={rebuttal.text} moodLine={null} moodTone={null} />
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span className="text-sky-400">{idx + 1}.</span> {section.title}
            </h2>
            <ScriptBody body={section.body} moodLine={moodLine} moodTone={call.mood === "good" ? "good" : call.mood === "bad" ? "bad" : null} />
            {section.note && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-300 leading-snug">
                <FaLightbulb className="size-3.5 mt-0.5 shrink-0" />
                <span><b>AGENT NOTE:</b> {section.note}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* prev / next */}
      {!rebuttal && (
        <div className="flex items-center justify-between px-3 py-2 border-t shrink-0">
          <Button size="sm" variant="secondary" className="h-7 text-xs gap-1" disabled={idx === 0} onClick={() => patchCall({ sectionIndex: idx - 1 })}>
            <FaAngleLeft className="size-3" /> Prev
          </Button>
          <span className="text-[10.5px] text-muted-foreground font-medium">
            {idx + 1} / {sections.length}
          </span>
          <Button size="sm" className="h-7 text-xs gap-1" disabled={idx === sections.length - 1} onClick={() => patchCall({ sectionIndex: idx + 1 })}>
            Next <FaAngleRight className="size-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
