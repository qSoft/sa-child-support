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
import { OvernightsField } from "../../features/children/overnightsLogic";

type Props = {
    draft: ChildDraft;
    calculationAsOfDate: string;
};




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
            <Row>
                <Field label="Name">
                    <Input value={draft.name} onChange={setStr("name")} placeholder="Child name" />
                </Field>
                <Field label="Date of Birth">
                    <Input type="date" value={draft.dob} onChange={setStr("dob")} />
                </Field>
            </Row>

            <Row>
                <Field label="Age (years, months) - read only">
                    <Input value={draft.dob ? ageText : ""} readOnly />
                </Field>

                <Field label="Full time student">
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
                </Field>
            </Row>

            <Section title="1. Overnights">
                <Row>
                    <Field label="P1 days">
                        <Input type="number" value={draft.overnights.p1Days} onChange={setOvernight("P1_DAYS")} />
                    </Field>
                    <Field label="P2 days">
                        <Input type="number" value={draft.overnights.p2Days} onChange={setOvernight("P2_DAYS")} />
                    </Field>
                </Row>

                <Row>
                    <Field label="P1 %">
                        <Input type="number" value={draft.overnights.p1Percent} onChange={setOvernight("P1_PERCENT")} />
                    </Field>
                    <Field label="P2 %">
                        <Input type="number" value={draft.overnights.p2Percent} onChange={setOvernight("P2_PERCENT")} />
                    </Field>
                </Row>

                <div className="ce-note">
                    Totals: <b>{draft.overnights.p1Days + draft.overnights.p2Days}</b> days,{" "}
                    <b>{draft.overnights.p1Percent + draft.overnights.p2Percent}</b>% (always 100%)
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
                    <Input
                        value={draft.childSupport.reasonIfOver18}
                        onChange={setStr("childSupport.reasonIfOver18")}
                        placeholder="If >18 and not eligible, enter reason…"
                    />
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
                    </Field>
                </Row>

                <Row>
                    <Field label="Eligible for Child Care Credit (<13)">
                        <Select
                            value={draft.dependentCare.eligibleChildCareCreditUnder13}
                            onChange={setStr("dependentCare.eligibleChildCareCreditUnder13")}
                        >
                            <option value="YES">Yes</option>
                            <option value="NO">No</option>
                        </Select>
                    </Field>

                    <Field label="Meets qualifying criteria if overridden">
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
                    </Field>
                </Row>

                <Row>
                    <Field label="% of year eligible">
                        <Input
                            type="number"
                            value={draft.dependentCare.percentOfYearEligible}
                            onChange={setNum("dependentCare.percentOfYearEligible")}
                        />
                    </Field>

                    <Field label="Paid by P1">
                        <Input type="number" value={draft.dependentCare.paidByP1} onChange={setNum("dependentCare.paidByP1")} />
                    </Field>
                </Row>

                <Row>
                    <Field label="Paid by P2">
                        <Input type="number" value={draft.dependentCare.paidByP2} onChange={setNum("dependentCare.paidByP2")} />
                    </Field>

                    <Field label="P1 Costs paid by dependent care benefits (FSA)">
                        <Input type="number" value={draft.dependentCare.p1FsaBenefits} onChange={setNum("dependentCare.p1FsaBenefits")} />
                    </Field>
                </Row>

                <Row>
                    <Field label="P2 Costs paid by dependent care benefits (FSA)">
                        <Input type="number" value={draft.dependentCare.p2FsaBenefits} onChange={setNum("dependentCare.p2FsaBenefits")} />
                    </Field>

                    <Field label="Eligible for Child Tax Credit">
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
                    </Field>
                </Row>

                <Row>
                    <Field label="Eligible for Other dependent Tax Credit">
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
                    </Field>

                    <Field label="Eligible for EIC">
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
                    </Field>
                </Row>
            </Section>

            <div className="ce-actions">
                <button
                    onClick={() => dispatch(saveChildFromDraft({ draftId: draft.id }))}
                    className="ce-btn-primary"
                >
                    Save Child
                </button>
                <button
                    onClick={() => dispatch(cancelChildForm())}
                    className="ce-btn-secondary"
                >
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
