import { OvernightsField } from "./overnightsLogic";
import type { Parent } from "./types";

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


function clampNumber(v: number | "", min: number, max: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.max(min, Math.min(max, n));
}

const clampInt = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.trunc(n)));

const clampPercent = (n: number) =>
  Math.max(0, Math.min(100, Math.round(n)));

function totalDaysForPercents(p1: number, p2: number): 365 | 366 {
  return p1 === 50 && p2 === 50 ? 366 : 365;
}

function totalDaysForDays(p1: number, p2: number): 365 | 366 {
  return p1 === 183 && p2 === 183 ? 366 : 365;
}

export function recalcOvernights(
  prev: {
    p1Days: number;
    p2Days: number;
    p1Percent: number;
    p2Percent: number;
  },
  edited: OvernightsField,
  value: number
) {
  let p1Days = prev.p1Days;
  let p2Days = prev.p2Days;
  let p1Percent = prev.p1Percent;
  let p2Percent = prev.p2Percent;

  // ----- EDIT PERCENT -----
  if (edited === "P1_PERCENT" || edited === "P2_PERCENT") {
    if (edited === "P1_PERCENT") {
      p1Percent = clampPercent(value);
      p2Percent = 100 - p1Percent;
    } else {
      p2Percent = clampPercent(value);
      p1Percent = 100 - p2Percent;
    }

    const totalDays = totalDaysForPercents(p1Percent, p2Percent);
    p1Days = clampInt(Math.round((p1Percent / 100) * totalDays), 0, totalDays);
    p2Days = totalDays - p1Days;

    return { p1Days, p2Days, p1Percent, p2Percent };
  }

  // ----- EDIT DAYS -----
  const totalDays = totalDaysForDays(prev.p1Days, prev.p2Days);

  if (edited === "P1_DAYS") {
    p1Days = clampInt(value, 0, totalDays);
    p2Days = totalDays - p1Days;
  } else {
    p2Days = clampInt(value, 0, totalDays);
    p1Days = totalDays - p2Days;
  }

  p1Percent = clampPercent((p1Days / totalDays) * 100);
  p2Percent = 100 - p1Percent;

  // If we landed on exact 50/50 → force 366 days
  if (p1Percent === 50 && p2Percent === 50) {
    p1Days = 183;
    p2Days = 183;
  }

  return { p1Days, p2Days, p1Percent, p2Percent };
}
