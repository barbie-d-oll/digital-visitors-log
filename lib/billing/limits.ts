import type { PlanName } from "./plans";
import { PLAN_LIMITS } from "./plans";

export function getPlanLimits(plan: PlanName) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export function canAddStaff(
  plan: PlanName,
  currentStaffCount: number
): boolean {
  return currentStaffCount < getPlanLimits(plan).maxStaff;
}

export function canAddLocation(
  plan: PlanName,
  currentLocationCount: number
): boolean {
  return currentLocationCount < getPlanLimits(plan).maxLocations;
}

export function canAddVisitor(
  plan: PlanName,
  currentMonthlyVisitorCount: number
): boolean {
  return (
    currentMonthlyVisitorCount <
    getPlanLimits(plan).maxVisitorsPerMonth
  );
}

export function hasFeature(
  plan: PlanName,
  feature: keyof typeof PLAN_LIMITS.starter.features
): boolean {
  return getPlanLimits(plan).features[feature];
}

export function getUpgradeMessage(
  plan: PlanName,
  resource: "staff" | "location" | "visitor"
): string {
  const limits = getPlanLimits(plan);

  if (resource === "staff") {
    return `Your ${plan} plan allows up to ${limits.maxStaff} staff members. Please upgrade your plan to add more.`;
  }

  if (resource === "location") {
    return `Your ${plan} plan allows up to ${limits.maxLocations} location(s). Please upgrade your plan to add more.`;
  }

  return `Your ${plan} plan allows up to ${limits.maxVisitorsPerMonth} visitors per month. Please upgrade your plan to continue.`;
}