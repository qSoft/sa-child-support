import type { Overnights } from "./types";

export type OvernightsField = "P1_DAYS" | "P2_DAYS" | "P1_PERCENT" | "P2_PERCENT";

export type StrictResult =
    | { ok: true; value: Overnights }
    | { ok: false; message: string };

const isFiniteNumber = (n: unknown): n is number =>
    typeof n === "number" && Number.isFinite(n);

const isInt = (n: number) => Number.isInteger(n);

function totalDaysForPercents(p1: number, p2: number): 365 | 366 {
    return p1 === 50 && p2 === 50 ? 366 : 365;
}

function totalDaysForDays(p1: number, p2: number): 365 | 366 {
    return p1 === 183 && p2 === 183 ? 366 : 365;
}

function validatePercentInput(n: number): string | null {
  if (!isFiniteNumber(n)) return "Percent must be a number.";
  if (!isInt(n)) return "Percent must be a whole number.";
  if (n < 0 || n > 100) return "Percent must be between 0 and 100.";
  return null;
}

function validateDaysInput(n: number, totalDays: 365 | 366): string | null {
  if (!isFiniteNumber(n)) return "Days must be a number.";
  if (!isInt(n)) return "Days must be a whole number.";
  if (n < 0) return "Days cannot be negative.";
  if (n > totalDays) return `Days cannot exceed ${totalDays}.`;
  return null;
}


export function recalcOvernightsStrict(
  prev: Overnights,
  edited: OvernightsField,
  raw: unknown
): StrictResult {
  // Allow UI to pass strings; reject empty/NaN
  const n = typeof raw === "string" ? Number(raw) : raw;

  // Percent edits
  if (edited === "P1_PERCENT" || edited === "P2_PERCENT") {
    if (!isFiniteNumber(n)) return { ok: false, message: "Percent must be a number." };
    const err = validatePercentInput(n);
    if (err) return { ok: false, message: err };

    let p1Percent = prev.p1Percent;
    let p2Percent = prev.p2Percent;

    if (edited === "P1_PERCENT") {
      p1Percent = n;
      p2Percent = 100 - p1Percent;
    } else {
      p2Percent = n;
      p1Percent = 100 - p2Percent;
    }

    // totalDays is defined by percents (50/50 => 366)
    const totalDays = totalDaysForPercents(p1Percent, p2Percent);

    // Convert to integer days and enforce sum exactly
    const p1Days = Math.round((p1Percent / 100) * totalDays);
    const p2Days = totalDays - p1Days;

    // Validate computed days range (always should be valid, but keep strict)
    if (p1Days < 0 || p1Days > totalDays) return { ok: false, message: "Computed P1 days out of range." };
    if (p2Days < 0 || p2Days > totalDays) return { ok: false, message: "Computed P2 days out of range." };

    return {
      ok: true,
      value: { p1Percent, p2Percent, p1Days, p2Days },
    };
  }

  // Days edits
  // Decide current totalDays strictly from current state.
  // If currently 183/183 => 366 else 365.
  const totalDays = totalDaysForDays(prev.p1Days, prev.p2Days);

  if (!isFiniteNumber(n)) return { ok: false, message: "Days must be a number." };
  const err = validateDaysInput(n, totalDays);
  if (err) return { ok: false, message: err };

  let p1Days = prev.p1Days;
  let p2Days = prev.p2Days;

  if (edited === "P1_DAYS") {
    p1Days = n;
    p2Days = totalDays - p1Days;
  } else {
    p2Days = n;
    p1Days = totalDays - p2Days;
  }

  // Compute percents as whole numbers; enforce sum = 100
  const p1Percent = Math.round((p1Days / totalDays) * 100);
  const p2Percent = 100 - p1Percent;

  // Special: if percent becomes exactly 50/50, force 366-days split (183/183)
  // This is deterministic and still “valid”.
  if (p1Percent === 50 && p2Percent === 50) {
    return {
      ok: true,
      value: { p1Percent: 50, p2Percent: 50, p1Days: 183, p2Days: 183 },
    };
  }

  return {
    ok: true,
    value: { p1Percent, p2Percent, p1Days, p2Days },
  };
}

