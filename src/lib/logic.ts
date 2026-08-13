import { EQUIPMENT, PRICE_TIERS, SP_RULES, TRADITIONAL_RULES } from "./defaults";
import { CallState, PlanId, Qualification } from "./types";

/** smart digital add-ons that raise SP monitoring by $5 and the loan by $500 each */
const SMART_ADDON_IDS = ["lock", "thermostat"];

export function smartAddonCount(pkg: Record<string, number>): number {
  return SMART_ADDON_IDS.reduce((n, id) => n + (pkg[id] ?? 0), 0);
}

/** "2× Outdoor HD Camera, 1× 7\" Touchscreen Panel, …" for recap / copy / saved leads */
export function packageSummary(call: CallState): string {
  const parts: string[] = [`${call.cameras}× Camera`];
  EQUIPMENT.forEach((e) => {
    if (e.id === "camera") return;
    const n = call.packageQty[e.id] ?? 0;
    if (n > 0) parts.push(`${n}× ${e.name}`);
  });
  if (call.equipNotes.trim()) parts.push(call.equipNotes.trim());
  return parts.join(", ");
}

export type PlanStatus = "ok" | "blocked" | "unknown";

export interface Verdict {
  sp: PlanStatus;
  traditional: PlanStatus;
  dead: boolean;
  deadReasons: string[];
  notes: { text: string; tone: "warn" | "info" | "bad" }[];
  recommended: PlanId | null;
}

export function evaluate(q: Qualification): Verdict {
  let sp: PlanStatus = "unknown";
  let traditional: PlanStatus = "unknown";
  const deadReasons: string[] = [];
  const notes: Verdict["notes"] = [];

  let spBlocked = false;
  let tradBlocked = false;
  let anyAnswer = false;

  // Home type + ownership
  if (q.homeType === "house") {
    if (q.ownsHome === "yes") anyAnswer = true;
    if (q.ownsHome === "no") deadReasons.push("Not the homeowner — CALL END");
  } else if (q.homeType === "condo") {
    if (q.ownsHome !== "unknown") anyAnswer = true;
    if (q.ownsHome === "no") {
      spBlocked = true;
      notes.push({ text: "Condo not owned → Traditional only", tone: "warn" });
    }
  } else if (q.homeType === "mobileFixed") {
    if (q.ownsLand !== "unknown") anyAnswer = true;
    if (q.ownsLand === "no") {
      spBlocked = true;
      notes.push({ text: "Mobile (fixed) without land → Traditional / DIY only", tone: "warn" });
    } else if (q.ownsLand === "yes") {
      notes.push({ text: "Mobile (fixed) + owns land → Traditional / DIY / SP", tone: "info" });
    }
  } else if (q.homeType === "mobileWheels") {
    if (q.ownsLand !== "unknown") anyAnswer = true;
    if (q.ownsLand === "yes") {
      tradBlocked = true;
      notes.push({ text: "Mobile on wheels + owns land → Smart Pay only", tone: "warn" });
    } else if (q.ownsLand === "no") {
      spBlocked = true;
      notes.push({ text: "Mobile on wheels, no land → Traditional only", tone: "warn" });
    }
  }

  // Internet
  if (q.internet === "no") {
    anyAnswer = true;
    spBlocked = true;
    notes.push({ text: "No internet → only CCTVs, monitor & Traditional", tone: "warn" });
  } else if (q.internet === "yes") anyAnswer = true;

  // Phone
  if (q.phone === "no") {
    anyAnswer = true;
    notes.push({ text: "No smartphone → can't install the app (SP/Traditional still OK)", tone: "info" });
  } else if (q.phone === "yes") anyAnswer = true;

  // Existing system contract
  if (q.hasSystem === "yes") {
    anyAnswer = true;
    if (q.systemAge === "lt26") {
      if (q.buyoutLt6mo === "yes") {
        notes.push({ text: "Under 6 months left → BUY OUT the contract (see rebuttal)", tone: "info" });
      } else {
        deadReasons.push("Current system used < 2.6 yrs — still under contract, can't offer anything (unless < 6 months remain → buy-out)");
      }
    } else if (q.systemAge === "gte3") {
      notes.push({ text: "3+ years on system → move on, no contract check needed", tone: "info" });
    }
  }

  // Credit
  if (q.credit === "poor") {
    anyAnswer = true;
    deadReasons.push("Poor credit — does not qualify for Smart Pay or Traditional");
  } else if (q.credit === "fair") {
    anyAnswer = true;
    spBlocked = true;
    notes.push({ text: "Fair credit → Traditional only", tone: "warn" });
  } else if (q.credit === "excellent" || q.credit === "good") {
    anyAnswer = true;
    notes.push({ text: "Excellent/Good credit → Smart Pay eligible", tone: "info" });
  }

  if (q.senior === "yes") {
    notes.push({ text: "Senior citizen → use senior promo lines + decision-maker check", tone: "info" });
  }

  const dead = deadReasons.length > 0;
  if (dead) {
    sp = "blocked";
    traditional = "blocked";
  } else {
    sp = spBlocked ? "blocked" : anyAnswer ? "ok" : "unknown";
    traditional = tradBlocked ? "blocked" : anyAnswer ? "ok" : "unknown";
  }

  let recommended: PlanId | null = null;
  if (!dead) {
    if (sp === "ok" && (q.credit === "excellent" || q.credit === "good")) recommended = "sp";
    else if (sp === "blocked" && traditional === "ok") recommended = "traditional";
    else if (traditional === "blocked" && sp === "ok") recommended = "sp";
  }

  return { sp, traditional, dead, deadReasons, notes, recommended };
}

export interface PriceResult {
  cams: number;
  monthly: number;
  monitoring: number;
  equipment: number;
  loan: number | null;
  oneTimeExtra: number;
  activationFee: number | null;
  camsOverLimit: boolean;
}

export function computePrice(plan: PlanId, cameras: number, extraSmart: number): PriceResult {
  const maxTier = PRICE_TIERS[PRICE_TIERS.length - 1];
  const capped = Math.min(Math.max(cameras, 1), maxTier.cams);
  const tier = PRICE_TIERS.find((t) => t.cams === capped) ?? maxTier;

  if (plan === "traditional") {
    const allowed = Math.min(capped, TRADITIONAL_RULES.maxCameras);
    const t = PRICE_TIERS.find((x) => x.cams === allowed) ?? PRICE_TIERS[0];
    return {
      cams: allowed,
      monthly: t.monthly,
      monitoring: t.monitoring,
      equipment: t.equipment,
      loan: null,
      oneTimeExtra: cameras > TRADITIONAL_RULES.maxCameras ? 0 : 0,
      activationFee: TRADITIONAL_RULES.activationFee,
      camsOverLimit: cameras > TRADITIONAL_RULES.maxCameras,
    };
  }

  return {
    cams: capped,
    monthly: +(tier.monthly + extraSmart * SP_RULES.extraSmartMonthly).toFixed(2),
    monitoring: tier.monitoring,
    equipment: tier.equipment,
    loan: tier.loan + extraSmart * SP_RULES.extraSmartLoan,
    oneTimeExtra: 0,
    activationFee: null,
    camsOverLimit: false,
  };
}
