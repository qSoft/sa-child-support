import React from "react";
import { useAppSelector } from "../../app/hooks";
import type { RelationshipType } from "../../features/children/types";

type Props = { relationshipType: RelationshipType };

export default function ChildListTable({ relationshipType }: Props) {
  const rows = useAppSelector((s) =>
    relationshipType === "THIS" ? s.children.childrenThisRelationship : s.children.childrenOtherRelationship
  );

  if (!rows.length) {
    return (
      <div style={{ padding: 10, border: "1px dashed #e6e8f0", borderRadius: 10, color: "#6b7280" }}>
        No children added yet.
      </div>
    );
  }

  return (
    <div style={{ overflow: "auto", border: "1px solid #e6e8f0", borderRadius: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead style={{ background: "#f8fafc" }}>
          <tr>
            <th style={th}>Name</th>
            <th style={th} colSpan={2}>Current age</th>
            <th style={th}>Full time student</th>
            <th style={th} colSpan={2}>Overnights</th>
            <th style={th} colSpan={3}>Child Support</th>
            <th style={th} colSpan={6}>Child & Dependent Care (high level)</th>
          </tr>
          <tr>
            <th style={th2}></th>
            <th style={th2}>Years</th>
            <th style={th2}>Months</th>
            <th style={th2}></th>
            <th style={th2}>P1%</th>
            <th style={th2}>P2%</th>

            <th style={th2}>Eligible</th>
            <th style={th2}>Reason if &gt;18</th>
            <th style={th2}>Custodial</th>

            <th style={th2}>Dependent of</th>
            <th style={th2}>Care credit (&lt;13)</th>
            <th style={th2}>Paid by P1</th>
            <th style={th2}>Paid by P2</th>
            <th style={th2}>Child Tax Credit</th>
            <th style={th2}>EIC</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id}>
              <td style={td}>{c.name || "—"}</td>
              <td style={td}>{c.computed?.ageYears ?? "—"}</td>
              <td style={td}>{c.computed?.ageMonths ?? "—"}</td>
              <td style={td}>{c.fullTimeStudent}</td>
              <td style={td}>{c.overnights?.p1Percent ?? "—"}</td>
              <td style={td}>{c.overnights?.p2Percent ?? "—"}</td>

              <td style={td}>{c.childSupport?.eligible}</td>
              <td style={td}>{c.childSupport?.reasonIfOver18 || "—"}</td>
              <td style={td}>{c.childSupport?.custodialParent}</td>

              <td style={td}>{c.dependentCare?.dependentOf}</td>
              <td style={td}>{c.dependentCare?.eligibleChildCareCreditUnder13}</td>
              <td style={td}>{c.dependentCare?.paidByP1 ?? 0}</td>
              <td style={td}>{c.dependentCare?.paidByP2 ?? 0}</td>
              <td style={td}>{c.dependentCare?.eligibleChildTaxCredit ? "Yes" : "No"}</td>
              <td style={td}>{c.dependentCare?.eligibleEIC ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #e6e8f0", fontWeight: 800, whiteSpace: "nowrap" };
const th2: React.CSSProperties = { textAlign: "left", padding: "6px 10px", borderBottom: "1px solid #e6e8f0", fontWeight: 700, whiteSpace: "nowrap" };
const td: React.CSSProperties = { padding: "8px 10px", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" };
