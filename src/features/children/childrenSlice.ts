import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import type { ChildrenState, ChildDraft, RelationshipType } from "./types";
import { calcAgeYearsMonths, defaultCustodialParentByOvernights, isUnderAge, normalizeOvernights } from "./childLogic";

const makeEmptyChildDraft = (relationshipType: RelationshipType, calculationAsOfDate: string): ChildDraft => ({
  id: nanoid(),
  relationshipType,
  name: "",
  dob: "",
  fullTimeStudent: "NO",
  overnights: {
    inputMode: "PERCENT",
    p1Percent: 50,
    p2Percent: 50,
    p1Days: 0,
    p2Days: 0,
    overridden: false,
  },
  childSupport: {
    eligible: "YES",
    reasonIfOver18: "",
    custodialParent: "P1",
  },
  dependentCare: {
    dependentOf: "P1",
    form8332: false,
    eligibleChildCareCreditUnder13: "YES",
    meetsQualifyingCriteriaIfOverridden: false,
    percentOfYearEligible: 100,
    paidByP1: 0,
    paidByP2: 0,
    p1FsaBenefits: 0,
    p2FsaBenefits: 0,
    eligibleChildTaxCredit: true,
    eligibleOtherDependentTaxCredit: false,
    eligibleEIC: true,
  },
  computed: {
    ageYears: 0,
    ageMonths: 0,
    calculationAsOfDateSnapshot: calculationAsOfDate || "",
  },
});

const initialState: ChildrenState = {
  childrenThisRelationship: [],
  childrenOtherRelationship: [],
  ui: { activeForm: null },
  draftsById: {},
};

type StartAddChildPayload = { relationshipType: RelationshipType; calculationAsOfDate: string };
type UpdateChildDraftPayload = { draftId: string; path: string; value: unknown };
type RecomputePayload = { draftId: string; calculationAsOfDate: string };
type SavePayload = { draftId: string };

const childrenSlice = createSlice({
  name: "children",
  initialState,
  reducers: {
    startAddChild: (state, action: PayloadAction<StartAddChildPayload>) => {
      const { relationshipType, calculationAsOfDate } = action.payload;
      const draft = makeEmptyChildDraft(relationshipType, calculationAsOfDate);

      const cust = defaultCustodialParentByOvernights(draft.overnights.p1Percent);
      draft.childSupport.custodialParent = cust;
      draft.dependentCare.dependentOf = cust;

      state.draftsById[draft.id] = draft;
      state.ui.activeForm = { relationshipType, draftId: draft.id };
    },

    cancelChildForm: (state) => {
      const active = state.ui.activeForm;
      if (active?.draftId) delete state.draftsById[active.draftId];
      state.ui.activeForm = null;
    },

    updateChildDraftField: (state, action: PayloadAction<UpdateChildDraftPayload>) => {
      const { draftId, path, value } = action.payload;
      const draft = state.draftsById[draftId];
      if (!draft) return;

      const keys = path.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let cur: any = draft;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
    },

    recomputeChildDraftDefaults: (state, action: PayloadAction<RecomputePayload>) => {
      const { draftId, calculationAsOfDate } = action.payload;
      const draft = state.draftsById[draftId];
      if (!draft) return;

      const asOf = calculationAsOfDate || draft.computed.calculationAsOfDateSnapshot || "";
      const { years, months } = calcAgeYearsMonths(draft.dob, asOf);

      draft.computed.ageYears = years;
      draft.computed.ageMonths = months;
      draft.computed.calculationAsOfDateSnapshot = asOf;

      if (draft.dob && asOf) {
        const under18 = isUnderAge(draft.dob, asOf, 18);
        const under13 = isUnderAge(draft.dob, asOf, 13);

        if (under18) draft.childSupport.eligible = "YES";
        draft.dependentCare.eligibleChildCareCreditUnder13 = under13 ? "YES" : "NO";
      }

      const norm = normalizeOvernights(
        draft.overnights.inputMode,
        draft.overnights.inputMode === "PERCENT" ? draft.overnights.p1Percent : draft.overnights.p1Days,
        draft.overnights.inputMode === "PERCENT" ? draft.overnights.p2Percent : draft.overnights.p2Days
      );

      if (draft.overnights.inputMode === "PERCENT") {
        if (typeof norm.p1Percent === "number") draft.overnights.p1Percent = norm.p1Percent;
        if (typeof norm.p2Percent === "number") draft.overnights.p2Percent = norm.p2Percent;
      } else {
        if (typeof norm.p1Days === "number") draft.overnights.p1Days = norm.p1Days;
        if (typeof norm.p2Days === "number") draft.overnights.p2Days = norm.p2Days;
        if (typeof norm.p1Percent === "number") draft.overnights.p1Percent = norm.p1Percent;
        if (typeof norm.p2Percent === "number") draft.overnights.p2Percent = norm.p2Percent;
      }

      const cust = defaultCustodialParentByOvernights(draft.overnights.p1Percent);
      draft.childSupport.custodialParent = cust;
      draft.dependentCare.dependentOf = cust;
    },

    saveChildFromDraft: (state, action: PayloadAction<SavePayload>) => {
      const { draftId } = action.payload;
      const draft = state.draftsById[draftId];
      if (!draft) return;

      const target = draft.relationshipType === "THIS" ? state.childrenThisRelationship : state.childrenOtherRelationship;
      target.push(JSON.parse(JSON.stringify(draft)) as ChildDraft);

      delete state.draftsById[draftId];
      state.ui.activeForm = null;
    },
  },
});

export const {
  startAddChild,
  cancelChildForm,
  updateChildDraftField,
  recomputeChildDraftDefaults,
  saveChildFromDraft,
} = childrenSlice.actions;

export default childrenSlice.reducer;
