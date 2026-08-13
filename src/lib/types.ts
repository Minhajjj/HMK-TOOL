export type TriState = "yes" | "no" | "unknown";
export type PlanId = "sp" | "traditional";
export type HomeType = "house" | "mobileFixed" | "mobileWheels" | "condo" | "unknown";
export type SystemAge = "lt26" | "gte26" | "gte3" | "unknown";
export type Credit = "excellent" | "good" | "fair" | "poor" | "unknown";
export type Mood = "good" | "bad" | "unknown";

export interface ScriptSection {
  id: string;
  title: string;
  body: string;
  /** agent-facing coaching note, never read to the customer */
  note?: string;
}

export interface Rebuttal {
  id: string;
  label: string;
  icon: string;
  category: "objection" | "rebuttal" | "info";
  text: string;
}

export interface EquipFeature {
  text: string;
  sp: boolean;
  traditional: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  icon: string;
  sp: boolean;
  traditional: boolean;
  pitch: string;
  features?: EquipFeature[];
}

export interface Qualification {
  homeType: HomeType;
  ownsHome: TriState;
  ownsLand: TriState;
  internet: TriState;
  phone: TriState;
  hasSystem: TriState;
  systemAge: SystemAge;
  buyoutLt6mo: TriState;
  senior: TriState;
  credit: Credit;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  zip: string;
  dob: string;
  address: string;
  bestNumber: string;
  emergencyContact: string;
}

export interface CallState {
  mood: Mood;
  qual: Qualification;
  customer: Customer;
  plan: PlanId | "auto";
  cameras: number;
  packageQty: Record<string, number>;
  equipNotes: string;
  sectionIndex: number;
  activeRebuttal: string | null;
  startedAt: number | null;
}

export interface Lead {
  id: string;
  savedAt: number;
  customer: Customer;
  qual: Qualification;
  plan: string;
  cameras: number;
  monthly: number | null;
  notes: string;
}

export interface Content {
  scriptSections: ScriptSection[];
  rebuttals: Rebuttal[];
  moodGood: string;
  moodBad: string;
}
