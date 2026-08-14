"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";
import { StoreProvider, useStore } from "@/lib/store";
import { TopBar } from "./TopBar";
import { QualifyPanel } from "./QualifyPanel";
import { ScriptCenter } from "./ScriptCenter";
import { QuickAnswersPanel } from "./QuickAnswersPanel";
import { DetailsBar } from "./DetailsBar";
import { CustomerCard } from "./CustomerCard";
import { cn } from "@/lib/utils";

const LEFT_COLLAPSE_KEY = "hkm-left-collapsed-v1";

function Board() {
  const { ready } = useStore();
  const rootRef = useRef<HTMLDivElement>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  useEffect(() => {
    setLeftCollapsed(localStorage.getItem(LEFT_COLLAPSE_KEY) === "1");
  }, []);

  const toggleLeft = () =>
    setLeftCollapsed((c) => {
      const next = !c;
      localStorage.setItem(LEFT_COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });

  useEffect(() => {
    if (ready && rootRef.current) {
      gsap.fromTo(
        rootRef.current.children,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" }
      );
    }
  }, [ready]);

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground text-sm">
        Loading portal…
      </div>
    );
  }

  return (
    <div ref={rootRef} className="h-screen flex flex-col gap-2 p-2 overflow-hidden">
      <TopBar />
      <div
        className={cn(
          "flex-1 min-h-0 grid gap-2 transition-[grid-template-columns] duration-300 ease-out",
          leftCollapsed ? "grid-cols-[40px_1fr]" : "grid-cols-[300px_1fr]"
        )}
      >
        {leftCollapsed ? (
          <button
            onClick={toggleLeft}
            title="Show qualification & customer info"
            className="group flex h-full w-full flex-col items-center gap-3 rounded-lg border bg-card py-3 text-muted-foreground transition-colors hover:border-border hover:text-foreground cursor-pointer"
          >
            <FaAnglesRight className="size-3.5 shrink-0" />
            <span className="[writing-mode:vertical-rl] text-[10px] font-bold tracking-widest">
              QUALIFY &amp; CUSTOMER INFO
            </span>
          </button>
        ) : (
          <div className="relative flex flex-col gap-2 min-h-0">
            <button
              onClick={toggleLeft}
              title="Tuck panel away — more room for the script"
              className="absolute right-1.5 top-1.5 z-20 flex size-6 items-center justify-center rounded-md border bg-secondary/70 text-muted-foreground backdrop-blur-sm transition-colors hover:border-border hover:text-foreground cursor-pointer"
            >
              <FaAnglesLeft className="size-3" />
            </button>
            <div className="flex-1 min-h-0">
              <QualifyPanel />
            </div>
            <CustomerCard />
          </div>
        )}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex-1 min-h-0 grid grid-cols-[1fr_330px] gap-2">
            <ScriptCenter />
            <QuickAnswersPanel />
          </div>
          <DetailsBar />
        </div>
      </div>
    </div>
  );
}

export function Portal() {
  return (
    <StoreProvider>
      <Board />
    </StoreProvider>
  );
}
