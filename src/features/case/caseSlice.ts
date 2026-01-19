import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CaseState, GeneralInfo } from "./types";

const todayISO = (): string => new Date().toISOString().slice(0, 10);

const initialState: CaseState = {
  generalInfo: {
    caseDate: "",
    calculationAsOfDate: todayISO(),
    caseYearEnd: "",
  },
};

type SetGeneralInfoPayload = {
  field: keyof GeneralInfo;
  value: string;
};

const caseSlice = createSlice({
  name: "case",
  initialState,
  reducers: {
    setGeneralInfoField: (state, action: PayloadAction<SetGeneralInfoPayload>) => {
      const { field, value } = action.payload;
      state.generalInfo[field] = value;
    },
  },
});

export const { setGeneralInfoField } = caseSlice.actions;
export default caseSlice.reducer;
