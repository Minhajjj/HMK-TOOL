"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { StoreProvider, useStore } from "@/lib/store";
import { TopBar } from "./TopBar";
import { QualifyPanel } from "./QualifyPanel";
import { ScriptCenter } from "./ScriptCenter";
import { QuickAnswersPanel } from "./QuickAnswersPanel";
import { DetailsBar } from "./DetailsBar";
import { CustomerCard } from "./CustomerCard";

function Board() {
  const { ready } = useStore();
  const rootRef = useRef<HTMLDivElement>(null);

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
      <div className="flex-1 min-h-0 grid grid-cols-[300px_1fr] gap-2">
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex-1 min-h-0">
            <QualifyPanel />
          </div>
          <CustomerCard />
        </div>
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
