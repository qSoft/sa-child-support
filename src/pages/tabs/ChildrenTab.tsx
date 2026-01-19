import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { startAddChild } from "../../features/children/childrenSlice";
import ChildListTable from "./ChildListTable";
import ChildEntryForm from "./ChildEntryForm";

export default function ChildrenTab() {
  const dispatch = useAppDispatch();
  const generalInfo = useAppSelector((s) => s.case.generalInfo);
  const ui = useAppSelector((s) => s.children.ui);
  const draftsById = useAppSelector((s) => s.children.draftsById);

  const activeDraft = ui.activeForm?.draftId ? draftsById[ui.activeForm.draftId] : null;

  if (activeDraft) {
    return (
      <div>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>
          {activeDraft.relationshipType === "THIS" ? "Add Child (this relationship)" : "Add Child (other relationship)"}
        </div>
        <ChildEntryForm draft={activeDraft} calculationAsOfDate={generalInfo.calculationAsOfDate} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <section>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 800 }}>List Children from this relationship</div>
          <button
            onClick={() => dispatch(startAddChild({ relationshipType: "THIS", calculationAsOfDate: generalInfo.calculationAsOfDate }))}
            style={primaryBtn}
          >
            Add Children from this Relationship
          </button>
        </div>
        <ChildListTable relationshipType="THIS" />
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 800 }}>List Children from other relationship</div>
          <button
            onClick={() => dispatch(startAddChild({ relationshipType: "OTHER", calculationAsOfDate: generalInfo.calculationAsOfDate }))}
            style={primaryBtn}
          >
            Add Children from other Relationship
          </button>
        </div>
        <ChildListTable relationshipType="OTHER" />
      </section>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  marginLeft: "auto",
  border: "1px solid #e6e8f0",
  background: "#111827",
  color: "white",
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
};
