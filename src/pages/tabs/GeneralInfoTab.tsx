import React from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setGeneralInfoField } from "../../features/case/caseSlice";
import type { GeneralInfo } from "../../features/case/types";

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: React.HTMLInputTypeAttribute;
};

function Field({ label, value, onChange, type = "date" }: FieldProps) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.75, marginBottom: 6 }}>{label}</div>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "280px",
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #e6e8f0",
        }}
      />
    </label>
  );
}

export default function GeneralInfoTab() {
  const dispatch = useAppDispatch();
  const info = useAppSelector((s) => s.case.generalInfo);

  const setField = (field: keyof GeneralInfo) => (v: string) =>
    dispatch(setGeneralInfoField({ field, value: v }));

  return (
    <div>
      <Field label="Case Date" value={info.caseDate} onChange={setField("caseDate")} />
      <Field label="Calculation as of Date" value={info.calculationAsOfDate} onChange={setField("calculationAsOfDate")} />
      <Field label="Case year end" value={info.caseYearEnd} onChange={setField("caseYearEnd")} />
    </div>
  );
}
