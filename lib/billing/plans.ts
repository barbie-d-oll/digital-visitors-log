export type PlanName = "starter" | "business" | "enterprise";

export interface PlanLimits {
  locations: number;
  staff: number;
  visitorsPerMonth: number;
}

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  starter: {
    locations: 1,
    staff: 10,
    visitorsPerMonth: 500,
  },

  business: {
    locations: 5,
    staff: 50,
    visitorsPerMonth: 2500,
  },

  enterprise: {
    locations: Infinity,
    staff: Infinity,
    visitorsPerMonth: Infinity,
  },
};

export const PLAN_DETAILS = {
  starter: {
    name: "Starter",
    price: 199,
    currency: "GHS",
    description: "For small organizations and single-location offices.",
  },

  business: {
    name: "Business",
    price: 499,
    currency: "GHS",
    description:
      "For growing organizations with multiple locations and advanced needs.",
  },

  enterprise: {
    name: "Enterprise",
    price: null,
    currency: "GHS",
    description:
      "For large organizations requiring custom limits and integrations.",
  },
} as const;

export function isValidPlan(value: string): value is PlanName {
  return value in PLAN_LIMITS;
}