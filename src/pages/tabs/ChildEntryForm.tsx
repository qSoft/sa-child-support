import React from "react";
import { useAppDispatch } from "../../app/hooks";
import {
  cancelChildForm,
  recomputeChildDraftDefaults,
  saveChildFromDraft,
  updateChildDraftField,
} from "../../features/children/childrenSlice";
import type { ChildDraft, OvernightsInputMode, YesNo } from "../../features/children/types";

type Props = {
  draft: ChildDraft;
  calculationAsOfDate: string;
};

export default function ChildEntryForm({ draft, calculationAsOfDate }: Props) {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(recomputeChildDraftDefaults({ draftId: draft.id, calculationAsOfDate }));
  }, [
    dispatch,
    draft.id,
    calculationAsOfDate,
    draft.dob,
    draft.overnights.inputMode,
    draft.overnights.p1Percent,
    draft.overnights.p2Percent,
    draft.overnights.p1Days,
    draft.overnights.p2Days,
  ]);

  const ageText = `${draft.computed.ageYears} years, ${draft.computed.ageMonths} months`;

  const setStr = (path: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    dispatch(updateChildDraftField({ draftId: draft.id, path, value: e.target.value }));

  const setBool = (path: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(updateChildDraftField({ draftId: draft.id, path, value: e.target.checked }));

  const setNum = (path: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    dispatch(updateChildDraftField({ draftId: draft.id, path, value: v === "" ? "" : Number(v) }));
  };

  const setYesNo = (path: string, v: YesNo) =>
    dispatch(updateChildDraftField({ draftId: draft.id, path, value: v }));

  const setInputMode = (v: OvernightsInputMode) =>
    dispatch(updateChildDraftField({ draftId: draft.id, path: "overnights.inputMode", value: v }));

  return (
    <div style={{ border: "1px solid #e6e8f0", borderRadius: 10, padding: 12 }}>
      <Row>
        <Field label="Name"><Input value={draft.name} onChange={setStr("name")} placeholder="Child name" /></Field>
        <Field label="Date of Birth"><Input type="date" value={draft.dob} onChange={setStr("dob")} /></Field>
      </Row>

      <Row>
        <Field label="Age (years, months) - read only"><Input value={draft.dob ? ageText : ""} readOnly /></Field>
        <Field label="Full time student">
          <div style={{ display: "flex", gap: 12, paddingTop: 6 }}>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="radio"
                name={`fts_${draft.id}`}
                checked={draft.fullTimeStudent === "YES"}
                onChange={() => setYesNo("fullTimeStudent", "YES")}
              />
              Yes
            </label>
            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="radio"
                name={`fts_${draft.id}`}
                checked={draft.fullTimeStudent === "NO"}
                onChange={() => setYesNo("fullTimeStudent", "NO")}
              />
              No
            </label>
          </div>
        </Field>
      </Row>

      <Section title="1. Overnights">
        <Row>
          <Field label="Input mode">
            <Select
              value={draft.overnights.inputMode}
              onChange={(e) => setInputMode(e.target.value as OvernightsInputMode)}
            >
              <option value="PERCENT">Percentage</option>
              <option value="DAYS">Days lived (of 365)</option>
            </Select>
          </Field>
          <Field label="Overnights overridden">
            <div style={{ paddingTop: 10 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={draft.overnights.overridden} onChange={setBool("overnights.overridden")} />
                Mark as overridden
              </label>
            </div>
          </Field>
        </Row>

        {draft.overnights.inputMode === "PERCENT" ? (
          <Row>
            <Field label="Parent 1 %"><Input type="number" value={draft.overnights.p1Percent} onChange={setNum("overnights.p1Percent")} /></Field>
            <Field label="Parent 2 %"><Input type="number" value={draft.overnights.p2Percent} onChange={setNum("overnights.p2Percent")} /></Field>
          </Row>
        ) : (
          <Row>
            <Field label="Parent 1 days (of 365)"><Input type="number" value={draft.overnights.p1Days} onChange={setNum("overnights.p1Days")} /></Field>
            <Field label="Parent 2 days (of 365)"><Input type="number" value={draft.overnights.p2Days} onChange={setNum("overnights.p2Days")} /></Field>
          </Row>
        )}

        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Normalized: <b>P1</b> {draft.overnights.p1Percent}% / <b>P2</b> {draft.overnights.p2Percent}%
        </div>
      </Section>

      <Section title="2. Child Support">
        <Row>
          <Field label="Eligible">
            <Select value={draft.childSupport.eligible} onChange={setStr("childSupport.eligible")}>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </Select>
          </Field>

          <Field label="Custodial parent">
            <Select value={draft.childSupport.custodialParent} onChange={setStr("childSupport.custodialParent")}>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
            </Select>
          </Field>
        </Row>

        <Field label="Reason if > 18">
          <Input value={draft.childSupport.reasonIfOver18} onChange={setStr("childSupport.reasonIfOver18")} placeholder="If >18 and not eligible, enter reason…" />
        </Field>
      </Section>

      <Section title="3. Child & Dependent Care Credit">
        <Row>
          <Field label="Dependent of">
            <Select value={draft.dependentCare.dependentOf} onChange={setStr("dependentCare.dependentOf")}>
              <option value="P1">P1</option>
              <option value="P2">P2</option>
            </Select>
          </Field>

          <Field label="Form 8332 (if # overnights overridden)">
            <div style={{ paddingTop: 10 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="checkbox" checked={draft.dependentCare.form8332} onChange={setBool("dependentCare.form8332")} />
                Filed / applies
              </label>
            </div>
          </Field>
        </Row>

        <Row>
          <Field label="Eligible for Child Care Credit (<13)">
            <Select value={draft.dependentCare.eligibleChildCareCreditUnder13} onChange={setStr("dependentCare.eligibleChildCareCreditUnder13")}>
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </Select>
          </Field>

          <Field label="Meets qualifying criteria if overridden">
            <div style={{ paddingTop: 10 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={draft.dependentCare.meetsQualifyingCriteriaIfOverridden}
                  onChange={setBool("dependentCare.meetsQualifyingCriteriaIfOverridden")}
                />
                Meets criteria
              </label>
            </div>
          </Field>
        </Row>

        <Row>
          <Field label="% of year eligible"><Input type="number" value={draft.dependentCare.percentOfYearEligible} onChange={setNum("dependentCare.percentOfYearEligible")} /></Field>
          <Field label="Paid by P1"><Input type="number" value={draft.dependentCare.paidByP1} onChange={setNum("dependentCare.paidByP1")} /></Field>
        </Row>

        <Row>
          <Field label="Paid by P2"><Input type="number" value={draft.dependentCare.paidByP2} onChange={setNum("dependentCare.paidByP2")} /></Field>
          <Field label="P1 Costs paid by dependent care benefits (FSA)"><Input type="number" value={draft.dependentCare.p1FsaBenefits} onChange={setNum("dependentCare.p1FsaBenefits")} /></Field>
        </Row>

        <Row>
          <Field label="P2 Costs paid by dependent care benefits (FSA)"><Input type="number" value={draft.dependentCare.p2FsaBenefits} onChange={setNum("dependentCare.p2FsaBenefits")} /></Field>
          <Field label="Eligible for Child Tax Credit">
            <Select
              value={draft.dependentCare.eligibleChildTaxCredit ? "YES" : "NO"}
              onChange={(e) => dispatch(updateChildDraftField({
                draftId: draft.id,
                path: "dependentCare.eligibleChildTaxCredit",
                value: e.target.value === "YES",
              }))}
            >
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </Select>
          </Field>
        </Row>

        <Row>
          <Field label="Eligible for Other dependent Tax Credit">
            <Select
              value={draft.dependentCare.eligibleOtherDependentTaxCredit ? "YES" : "NO"}
              onChange={(e) => dispatch(updateChildDraftField({
                draftId: draft.id,
                path: "dependentCare.eligibleOtherDependentTaxCredit",
                value: e.target.value === "YES",
              }))}
            >
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </Select>
          </Field>

          <Field label="Eligible for EIC">
            <Select
              value={draft.dependentCare.eligibleEIC ? "YES" : "NO"}
              onChange={(e) => dispatch(updateChildDraftField({
                draftId: draft.id,
                path: "dependentCare.eligibleEIC",
                value: e.target.value === "YES",
              }))}
            >
              <option value="YES">Yes</option>
              <option value="NO">No</option>
            </Select>
          </Field>
        </Row>
      </Section>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={() => dispatch(saveChildFromDraft({ draftId: draft.id }))} style={primaryBtn}>Save Child</button>
        <button onClick={() => dispatch(cancelChildForm())} style={secondaryBtn}>Cancel</button>
      </div>
    </div>
  );
}

/** UI helpers */
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.75, marginBottom: 6 }}>{label}</div>
      {children}
    </label>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e6e8f0" }} />;
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #e6e8f0", background: "white" }} />;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #eef0f6" }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

const primaryBtn: React.CSSProperties = { border: "1px solid #111827", background: "#111827", color: "white", padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 800 };
const secondaryBtn: React.CSSProperties = { border: "1px solid #e6e8f0", background: "white", color: "#111827", padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontWeight: 800 };
