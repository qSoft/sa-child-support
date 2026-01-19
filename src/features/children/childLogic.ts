import type { Parent, OvernightsInputMode } from "./types";

export function calcAgeYearsMonths(dobISO: string, asOfISO: string): { years: number; months: number } {
  if (!dobISO || !asOfISO) return { years: 0, months: 0 };

  const dob = new Date(dobISO);
  const asOf = new Date(asOfISO);
  if (Number.isNaN(dob.getTime()) || Number.isNaN(asOf.getTime())) return { years: 0, months: 0 };

  let years = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth() - dob.getMonth();
  const days = asOf.getDate() - dob.getDate();

  if (days < 0) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return { years: 0, months: 0 };
  return { years, months };
}

export function isUnderAge(dobISO: string, asOfISO: string, thresholdYears: number): boolean {
  const { years } = calcAgeYearsMonths(dobISO, asOfISO);
  return years < thresholdYears;
}

export function defaultCustodialParentByOvernights(p1Percent: number): Parent {
  return (Number(p1Percent) || 0) > 50 ? "P1" : "P2";
}

export function normalizeOvernights(
  inputMode: OvernightsInputMode,
  p1Value: number | "",
  p2Value: number | ""
): { p1Percent?: number; p2Percent?: number; p1Days?: number; p2Days?: number } {
  if (inputMode === "PERCENT") {
    const p1 = clampNumber(p1Value, 0, 100);
    const p2 = clampNumber(p2Value, 0, 100);

    if (p1Value !== "" && (p2Value === "" || p2Value == null)) return { p1Percent: p1, p2Percent: clampNumber(100 - p1, 0, 100) };
    if (p2Value !== "" && (p1Value === "" || p1Value == null)) return { p2Percent: p2, p1Percent: clampNumber(100 - p2, 0, 100) };

    return { p1Percent: p1, p2Percent: p2 };
  }

  const totalDays = 365;
  const p1Days = clampNumber(p1Value, 0, totalDays);
  const p2Days = clampNumber(p2Value, 0, totalDays);
  const p1Percent = Math.round((p1Days / totalDays) * 1000) / 10;
  const p2Percent = Math.round((p2Days / totalDays) * 1000) / 10;

  return { p1Days, p2Days, p1Percent, p2Percent };
}

function clampNumber(v: number | "", min: number, max: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.max(min, Math.min(max, n));
}
