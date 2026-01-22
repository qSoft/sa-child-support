import React from "react";
import { useAppSelector } from "../../app/hooks";
import type { ChildDraft } from "../../features/children/types";
import { buildSummaryRows, type SummaryRow } from "../utilities/summaryCalc";
import "./RightSummary.css";


type ColumnKey =
    | "childSupport"
    | "ccc"
    | "ccCosts"
    | "dependentCareBenefits"
    | "ctc"
    | "otherDependentCtc"
    | "eic";

const columns: { key: ColumnKey; label: string; className?: string }[] = [
    { key: "childSupport", label: "Child support" },
    { key: "ccc", label: "CCC" },
    { key: "ccCosts", label: "CC Costs" },

    // 👇 narrow columns
    { key: "dependentCareBenefits", label: "Dependent care benefits", className: "summary-col-narrow" },
    { key: "ctc", label: "CTC" },
    { key: "otherDependentCtc", label: "Other dependent-CTC", className: "summary-col-narrow" },

    { key: "eic", label: "EIC" },
];


export default function RightSummary() {
    const generalInfo = useAppSelector((s) => s.case.generalInfo);
    const thisKids = useAppSelector((s) => s.children.childrenThisRelationship);
    const otherKids = useAppSelector((s) => s.children.childrenOtherRelationship);

    // One row for each child from both lists
    const allChildren: ChildDraft[] = React.useMemo(
        () => [...thisKids, ...otherKids],
        [thisKids, otherKids]
    );

    const p1Rows = React.useMemo(() => buildSummaryRows(allChildren, "P1"), [allChildren]);
    const p2Rows = React.useMemo(() => buildSummaryRows(allChildren, "P2"), [allChildren]);

    return (
        <div style={{ padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Summary</div>

            {/* You can keep this top meta if you want */}
            <div style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 12, opacity: 0.85 }}>
                <div><b>Case Date:</b> {generalInfo.caseDate || "—"}</div>
                <div><b>As of:</b> {generalInfo.calculationAsOfDate || "—"}</div>
                <div><b>Year End:</b> {generalInfo.caseYearEnd || "—"}</div>
            </div>

            <SummaryTable header="Summary P1" rows={p1Rows} />
            <div style={{ height: 14 }} />
            <SummaryTable header="Summary P2" rows={p2Rows} />
        </div>
    );
}

function SummaryTable({ header, rows }: { header: string; rows: SummaryRow[] }) {
  // totals for each numeric column
  const totals: Record<ColumnKey, number> = React.useMemo(() => {
    const t = {} as Record<ColumnKey, number>;
    for (const c of columns) {
      t[c.key] = sumColumn(rows, c.key);
    }
    return t;
  }, [rows]);

  return (
    <div style={{ border: "1px solid #e6e8f0", borderRadius: 10, overflow: "hidden" }}>
      <div
        style={{
          padding: "10px 10px",
          fontWeight: 800,
          background: "#f8fafc",
          borderBottom: "1px solid #e6e8f0",
        }}
      >
        {header}
      </div>

      <div style={{ overflow: "auto" }}>
        <table className="summary-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Child</th>
              {columns.map((c) => (
                <th key={c.key} className={c.className}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="summary-empty">
                  No children yet.
                </td>
              </tr>
            ) : (
              <>
                {rows.map((r) => (
                  <tr key={r.childId}>
                    <td>{r.childLabel}</td>
                    {columns.map((c) => (
                      <td key={c.key} className={`${c.className ?? ""} numeric`}>
                        {formatCell((r as any)[c.key])}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* TOTAL ROW */}
                <tr className="summary-total-row">
                  <td className="summary-total-label">Total</td>
                  {columns.map((c) => (
                    <td key={c.key} className={`${c.className ?? ""} numeric summary-total-cell`}>
                      {formatTotal(totals[c.key], c.key)}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function formatCell(v: unknown): string {
    if (v === "-") return "-";
    if (typeof v === "number") return String(v);
    if (v == null) return "-";
    return String(v);
}

function toNumber(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

function sumColumn(rows: SummaryRow[], key: ColumnKey): number {
  return rows.reduce((acc, r) => acc + toNumber((r as any)[key]), 0);
}

function formatTotal(total: number, key: ColumnKey): string {
  // For count columns (0/1 sums) it's fine to show integer.
  // For money columns (ccCosts, dependentCareBenefits) show 2 decimals if needed.
  const moneyKeys: ColumnKey[] = ["ccCosts", "dependentCareBenefits"];

  if (moneyKeys.includes(key)) {
    return total === 0 ? "0" : total.toFixed(2);
  }

  // integer display for 0/1-ish columns
  return String(Math.round(total * 100) / 100);
}
