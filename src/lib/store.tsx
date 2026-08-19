"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CallState, Content, Customer, Lead, Qualification } from "./types";
import { DEFAULT_CALL, DEFAULT_CONTENT } from "./defaults";
import { packageSummary } from "./logic";

const CONTENT_KEY = "hkm-content-v2";
const CALL_KEY = "hkm-call-v1";
const LEADS_KEY = "hkm-leads-v1";

interface Store {
  ready: boolean;
  content: Content;
  setContent: (c: Content) => void;
  resetContent: () => void;
  call: CallState;
  patchCall: (p: Partial<CallState>) => void;
  patchQual: (p: Partial<Qualification>) => void;
  patchCustomer: (p: Partial<Customer>) => void;
  leads: Lead[];
  saveLeadAndReset: (plan: string, monthly: number | null) => void;
  deleteLead: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) return (Array.isArray(parsed) ? parsed : fallback) as T;
    return { ...fallback, ...parsed } as T;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [content, setContentState] = useState<Content>(DEFAULT_CONTENT);
  const [call, setCall] = useState<CallState>(DEFAULT_CALL);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const storedContent = load<Content>(CONTENT_KEY, DEFAULT_CONTENT);
    // merge in any new default rebuttals/sections added after the user saved edits
    const knownSec = new Set(storedContent.scriptSections.map((s) => s.id));
    const knownReb = new Set(storedContent.rebuttals.map((r) => r.id));
    DEFAULT_CONTENT.scriptSections.forEach((s) => {
      if (!knownSec.has(s.id)) storedContent.scriptSections.push(s);
    });
    DEFAULT_CONTENT.rebuttals.forEach((r) => {
      if (!knownReb.has(r.id)) storedContent.rebuttals.push(r);
    });
    // keep sections in the default running order so newly-added ones (e.g. the
    // conditional 3-in-1 Hook) land in their intended slot, not appended at the end
    const secOrder = DEFAULT_CONTENT.scriptSections.map((s) => s.id);
    const rank = (id: string) => {
      const i = secOrder.indexOf(id);
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    storedContent.scriptSections.sort((a, b) => rank(a.id) - rank(b.id));
    setContentState(storedContent);
    setCall(load<CallState>(CALL_KEY, DEFAULT_CALL));
    setLeads(load<Lead[]>(LEADS_KEY, []));
    setReady(true);
  }, []);

  // Persist only once `ready` is part of the rendered state — a ref set inside the
  // effect above would still be true on the same pass, letting the defaults get
  // written over the saved data before hydration lands (and again on a remount).
  useEffect(() => {
    if (ready) localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
  }, [ready, content]);
  useEffect(() => {
    if (ready) localStorage.setItem(CALL_KEY, JSON.stringify(call));
  }, [ready, call]);
  useEffect(() => {
    if (ready) localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
  }, [ready, leads]);

  const store = useMemo<Store>(
    () => ({
      ready,
      content,
      setContent: setContentState,
      resetContent: () => setContentState(DEFAULT_CONTENT),
      call,
      patchCall: (p) => setCall((c) => ({ ...c, ...p })),
      patchQual: (p) => setCall((c) => ({ ...c, qual: { ...c.qual, ...p } })),
      patchCustomer: (p) => setCall((c) => ({ ...c, customer: { ...c.customer, ...p } })),
      leads,
      saveLeadAndReset: (plan, monthly) => {
        setCall((c) => {
          const hasData =
            Object.values(c.customer).some((v) => v.trim() !== "") ||
            c.qual.homeType !== "unknown" ||
            c.qual.credit !== "unknown";
          if (hasData) {
            const lead: Lead = {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              savedAt: Date.now(),
              customer: c.customer,
              qual: c.qual,
              plan,
              cameras: c.cameras,
              monthly,
              notes: packageSummary(c),
            };
            setLeads((ls) => [lead, ...ls]);
          }
          return { ...DEFAULT_CALL, startedAt: Date.now() };
        });
      },
      deleteLead: (id) => setLeads((ls) => ls.filter((l) => l.id !== id)),
    }),
    [ready, content, call, leads]
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
