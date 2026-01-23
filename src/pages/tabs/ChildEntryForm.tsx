import React from "react";
import { useAppDispatch } from "../../app/hooks";
import {
  cancelChildForm,
  recomputeChildDraftDefaults,
  saveChildFromDraft,
  updateChildDraftField,
  updateOvernights,
} from "../../features/children/childrenSlice";
import type { ChildDraft, YesNo } from "../../features/children/types";
import "./ChildEntryForm.css";
import type { OvernightsField } from "../../features/children/overnightsLogic";
import InfoTooltip from "../../components/common/InfoTooltip";

type Props = {
  draft: ChildDraft;
  calculationAsOfDate: string;
};

function WithInfo({
  children,
  title,
  help,
}: {
  children: React.ReactNode;
  title: string;
  help: React.ReactNode;
}) {
  return (
    <div className="ce-control">
      <div className="ce-control-input">{children}</div>
      <div className="ce-control-tooltip">
        <InfoTooltip title={title}>{help}</InfoTooltip>
      </div>
    </div>
  );
}

export default function ChildEntryForm({ draft, calculationAsOfDate }: Props) {
  const dispatch = useAppDispatch();

  const setOvernight = (field: OvernightsField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const n = raw === "" ? 0 : Number(raw);
    dispatch(updateOvernights({ draftId: draft.id, field, value: n }));
  };

  React.useEffect(() => {
    dispatch(recomputeChildDraftDefaults({ draftId: draft.id, calculationAsOfDate }));
  }, [
    dispatch,
    draft.id,
    calculationAsOfDate,
    draft.dob,
    draft.overnights.p1Percent,
    draft.overnights.p2Percent,
    draft.overnights.p1Days,
    draft.overnights.p2Days,
  ]);

  const ageText = `${draft.computed.ageYears} years, ${draft.computed.ageMonths} months`;

  const setStr =
    (path: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      dispatch(updateChildDraftField({ draftId: draft.id, path, value: e.target.value }));

  const setBool =
    (path: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch(updateChildDraftField({ draftId: draft.id, path, value: e.target.checked }));

  const setNum =
    (path: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      dispatch(updateChildDraftField({ draftId: draft.id, path, value: v === "" ? "" : Number(v) }));
    };

  const setYesNo = (path: string, v: YesNo) =>
    dispatch(updateChildDraftField({ draftId: draft.id, path, value: v }));

  return (
    <div className="child-entry">
      {/* ===== Top row ===== */}
      <Row>
        <Field label="Name">
          <WithInfo title="Name" help="Enter the child’s legal/commonly used name.">
            <Input value={draft.name} onChange={setStr("name")} placeholder="Child name" />
          </WithInfo>
        </Field>

        <Field label="Date of Birth">
          <WithInfo
            title="Date of Birth"
            help="Used to calculate age as of the ‘Calculation as of Date’ and to determine eligibility rules."
          >
            <Input type="date" value={draft.dob} onChange={setStr("dob")} />
          </WithInfo>
        </Field>
      </Row>

      <Row>
        <Field label="Age (years, months) - read only">
          <WithInfo title="Age" help="Calculated automatically from Date of Birth and Calculation as of Date.">
            <Input value={draft.dob ? ageText : ""} readOnly />
          </WithInfo>
        </Field>

        <Field label="Full time student">
          <WithInfo
            title="Full time student"
            help="Select Yes if the child is a full-time student (used for certain support/tax rules in some jurisdictions)."
          >
            <div className="ce-radio-row">
              <label className="ce-radio">
                <input
                  type="radio"
                  name={`fts_${draft.id}`}
                  checked={draft.fullTimeStudent === "YES"}
                  onChange={() => setYesNo("fullTimeStudent", "YES")}
                />
                Yes
              </label>

              <label className="ce-radio">
                <input
                  type="radio"
                  name={`fts_${draft.id}`}
                  checked={draft.fullTimeStudent === "NO"}
                  onChange={() => setYesNo("fullTimeStudent", "NO")}
                />
                No
              </label>
            </div>
          </WithInfo>
        </Field>
      </Row>

      {/* ===== Overnights ===== */}
      <Section title="1. Overnights">
        <Row>
          <Field label="P1 days">
            <WithInfo
              title="P1 days"
              help={
                <>
                  Enter nights the child stays with Parent 1.
                  <br />
                  The app auto-calculates the other 3 fields.
                  <br />
                  Rules enforced: Percent totals = 100; Days totals = 365 (or 366 only for exactly 50/50).
                </>
              }
            >
              <Input type="number" value={draft.overnights.p1Days} onChange={setOvernight("P1_DAYS")} />
            </WithInfo>
          </Field>

          <Field label="P2 days">
            <WithInfo
              title="P2 days"
              help={
                <>
                  Enter nights the child stays with Parent 2.
                  <br />
                  The app auto-calculates the other 3 fields.
                  <br />
                  Rules enforced: Percent totals = 100; Days totals = 365 (or 366 only for exactly 50/50).
                </>
              }
            >
              <Input type="number" value={draft.overnights.p2Days} onChange={setOvernight("P2_DAYS")} />
            </WithInfo>
          </Field>
        </Row>

        <Row>
          <Field label="P1 %">
            <WithInfo
              title="P1 %"
              help={
                <>
                  Enter Parent 1’s overnights percentage.
                  <br />
                  Parent 2’s percentage is auto-set so totals always equal 100%.
                  <br />
                  Days are derived from the percent split.
                </>
              }
            >
              <Input type="number" value={draft.overnights.p1Percent} onChange={setOvernight("P1_PERCENT")} />
            </WithInfo>
          </Field>

          <Field label="P2 %">
            <WithInfo
              title="P2 %"
              help={
                <>
                  Enter Parent 2’s overnights percentage.
                  <br />
                  Parent 1’s percentage is auto-set so totals always equal 100%.
                  <br />
                  Days are derived from the percent split.
                </>
              }
            >
              <Input type="number" value={draft.overnights.p2Percent} onChange={setOvernight("P2_PERCENT")} />
            </WithInfo>
          </Field>
        </Row>

        <div className="ce-note">
          Totals: <b>{draft.overnights.p1Days + draft.overnights.p2Days}</b> days,{" "}
          <b>{draft.overnights.p1Percent + draft.overnights.p2Percent}</b>% (always 100%)
        </div>
      </Section>

      {/* ===== Child Support ===== */}
      <Section title="2. Child Support">
        <Row>
          <Field label="Eligible">
            <WithInfo
              title="Child support eligibility"
              help="If the child is under 18, eligibility defaults to Yes. Change to No if the child is not eligible under your rules."
            >
              <Select value={draft.childSupport.eligible} onChange={setStr("childSupport.eligible")}>
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </Select>
            </WithInfo>
          </Field>

          <Field label="Custodial parent">
            <WithInfo
              title="Custodial parent"
              help="Defaults based on overnights (>50%). You can override if your legal definition differs."
            >
              <Select
                value={draft.childSupport.custodialParent}
                onChange={setStr("childSupport.custodialParent")}
              >
                <option value="P1">P1</option>
                <option value="P2">P2</option>
              </Select>
            </WithInfo>
          </Field>
        </Row>

        <Field label="Reason if > 18">
          <WithInfo
            title="Reason if > 18"
            help="If the child is over 18 and not eligible (or eligible due to specific rules), capture the reason here (e.g., still in high school)."
          >
            <Input
              value={draft.childSupport.reasonIfOver18}
              onChange={setStr("childSupport.reasonIfOver18")}
              placeholder="If >18 and not eligible, enter reason…"
            />
          </WithInfo>
        </Field>
      </Section>

      {/* ===== Dependent Care ===== */}
      <Section title="3. Child & Dependent Care Credit">
        <Row>
          <Field label="Dependent of">
            <WithInfo
              title="Dependent of"
              help="Select which parent claims the child as a dependent for tax credit purposes (used in summary calculations)."
            >
              <Select value={draft.dependentCare.dependentOf} onChange={setStr("dependentCare.dependentOf")}>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
              </Select>
            </WithInfo>
          </Field>

          <Field label="Form 8332">
            <WithInfo
              title="Form 8332"
              help="Use this to indicate the custodial parent released the claim to the other parent for certain tax benefits."
            >
              <div className="ce-checkbox-wrap">
                <label className="ce-checkbox">
                  <input
                    type="checkbox"
                    checked={draft.dependentCare.form8332}
                    onChange={setBool("dependentCare.form8332")}
                  />
                  Filed / applies
                </label>
              </div>
            </WithInfo>
          </Field>
        </Row>

        <Row>
          <Field label="Eligible for Child Care Credit (<13)">
            <WithInfo
              title="Eligible for Child Care Credit (<13)"
              help="Auto-derived from age (<13) but can be adjusted if your rules differ."
            >
              <Select
                value={draft.dependentCare.eligibleChildCareCreditUnder13}
                onChange={setStr("dependentCare.eligibleChildCareCreditUnder13")}
              >
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </Select>
            </WithInfo>
          </Field>

          <Field label="Meets qualifying criteria if overridden">
            <WithInfo
              title="Meets qualifying criteria"
              help="If eligibility is overridden due to special circumstances, check this to indicate qualifying criteria are met."
            >
              <div className="ce-checkbox-wrap">
                <label className="ce-checkbox">
                  <input
                    type="checkbox"
                    checked={draft.dependentCare.meetsQualifyingCriteriaIfOverridden}
                    onChange={setBool("dependentCare.meetsQualifyingCriteriaIfOverridden")}
                  />
                  Meets criteria
                </label>
              </div>
            </WithInfo>
          </Field>
        </Row>

        <Row>
          <Field label="% of year eligible">
            <WithInfo
              title="% of year eligible"
              help="Percentage of the year the child qualifies for the dependent care credit (used to prorate costs)."
            >
              <Input
                type="number"
                value={draft.dependentCare.percentOfYearEligible}
                onChange={setNum("dependentCare.percentOfYearEligible")}
              />
            </WithInfo>
          </Field>

          <Field label="Paid by P1">
            <WithInfo
              title="Paid by P1"
              help="Total child care costs paid by Parent 1 (used in summary calculations; may be prorated by % of year eligible)."
            >
              <Input type="number" value={draft.dependentCare.paidByP1} onChange={setNum("dependentCare.paidByP1")} />
            </WithInfo>
          </Field>
        </Row>

        <Row>
          <Field label="Paid by P2">
            <WithInfo
              title="Paid by P2"
              help="Total child care costs paid by Parent 2 (used in summary calculations; may be prorated by % of year eligible)."
            >
              <Input type="number" value={draft.dependentCare.paidByP2} onChange={setNum("dependentCare.paidByP2")} />
            </WithInfo>
          </Field>

          <Field label="P1 Costs paid by dependent care benefits (FSA)">
            <WithInfo
              title="P1 dependent care benefits (FSA)"
              help="Amount of Parent 1 costs paid via dependent care benefits (e.g., FSA). Used in summary calculations."
            >
              <Input
                type="number"
                value={draft.dependentCare.p1FsaBenefits}
                onChange={setNum("dependentCare.p1FsaBenefits")}
              />
            </WithInfo>
          </Field>
        </Row>

        <Row>
          <Field label="P2 Costs paid by dependent care benefits (FSA)">
            <WithInfo
              title="P2 dependent care benefits (FSA)"
              help="Amount of Parent 2 costs paid via dependent care benefits (e.g., FSA). Used in summary calculations."
            >
              <Input
                type="number"
                value={draft.dependentCare.p2FsaBenefits}
                onChange={setNum("dependentCare.p2FsaBenefits")}
              />
            </WithInfo>
          </Field>

          <Field label="Eligible for Child Tax Credit">
            <WithInfo
              title="Eligible for Child Tax Credit"
              help="Indicates whether the child qualifies for the Child Tax Credit (used in summary calculations)."
            >
              <Select
                value={draft.dependentCare.eligibleChildTaxCredit ? "YES" : "NO"}
                onChange={(e) =>
                  dispatch(
                    updateChildDraftField({
                      draftId: draft.id,
                      path: "dependentCare.eligibleChildTaxCredit",
                      value: e.target.value === "YES",
                    })
                  )
                }
              >
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </Select>
            </WithInfo>
          </Field>
        </Row>

        <Row>
          <Field label="Eligible for Other dependent Tax Credit">
            <WithInfo
              title="Eligible for Other dependent Tax Credit"
              help="For dependents who do not qualify for CTC but may qualify for other dependent credits (used in summary calculations)."
            >
              <Select
                value={draft.dependentCare.eligibleOtherDependentTaxCredit ? "YES" : "NO"}
                onChange={(e) =>
                  dispatch(
                    updateChildDraftField({
                      draftId: draft.id,
                      path: "dependentCare.eligibleOtherDependentTaxCredit",
                      value: e.target.value === "YES",
                    })
                  )
                }
              >
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </Select>
            </WithInfo>
          </Field>

          <Field label="Eligible for EIC">
            <WithInfo
              title="Eligible for EIC"
              help="Indicates whether this child is eligible for Earned Income Credit (used in summary calculations)."
            >
              <Select
                value={draft.dependentCare.eligibleEIC ? "YES" : "NO"}
                onChange={(e) =>
                  dispatch(
                    updateChildDraftField({
                      draftId: draft.id,
                      path: "dependentCare.eligibleEIC",
                      value: e.target.value === "YES",
                    })
                  )
                }
              >
                <option value="YES">Yes</option>
                <option value="NO">No</option>
              </Select>
            </WithInfo>
          </Field>
        </Row>
      </Section>

      <div className="ce-actions">
        <button onClick={() => dispatch(saveChildFromDraft({ draftId: draft.id }))} className="ce-btn-primary">
          Save Child
        </button>
        <button onClick={() => dispatch(cancelChildForm())} className="ce-btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
}

/** UI helpers */
function Row({ children }: { children: React.ReactNode }) {
  return <div className="ce-row">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="ce-field">
      <div className="ce-label">{label}</div>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="ce-input" />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="ce-select" />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ce-section">
      <div className="ce-section-title">{title}</div>
      {children}
    </div>
  );
}
