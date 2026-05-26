import { WeightUnit } from '../types';

// All weights are stored canonically in kilograms. These helpers convert
// to/from the unit a user prefers for input and display only.
export const LB_PER_KG = 2.2046226218;

const UNIT_LABEL: Record<WeightUnit, string> = { kg: 'kg', lbs: 'lb' };

export function unitLabel(unit: WeightUnit): string {
  return UNIT_LABEL[unit];
}

/** Round to 1 decimal place, dropping a trailing ".0". */
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Canonical kg -> the user's unit, rounded for display/input. */
export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === 'lbs' ? round1(kg * LB_PER_KG) : round1(kg);
}

/** A value the user typed (in their unit) -> canonical kg for storage. */
export function toKg(value: number, unit: WeightUnit): number {
  // Keep full precision so a round-trip (e.g. 225 lb) displays cleanly.
  return unit === 'lbs' ? value / LB_PER_KG : value;
}

/** "100 kg" / "220 lb" from a canonical kg value. */
export function formatWeight(kg: number, unit: WeightUnit): string {
  return `${fromKg(kg, unit)} ${unitLabel(unit)}`;
}
