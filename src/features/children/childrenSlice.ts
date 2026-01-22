import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import type { ChildrenState, ChildDraft, RelationshipType } from "./types";
import { recalcOvernightsStrict, type OvernightsField } from "./overnightsLogic";

import { calcAgeYearsMonths, defaultCustodialParentByOvernights, isUnderAge } from "./childLogic";

const makeEmptyChildDraft = (relationshipType: RelationshipType, calculationAsOfDate: string): ChildDraft => ({
  id: nanoid(),
  relationshipType,
  name: "",
  dob: "",
  fullTimeStudent: "NO",
  overnights: { p1Percent: 50, p2Percent: 50, p1Days: 183, p2Days: 183 },
  childSupport: { eligible: "YES", reasonIfOver18: "", custodialParent: "P1" },
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
  computed: { ageYears: 0, ageMonths: 0, calculationAsOfDateSnapshot: calculationAsOfDate || "" },

  validation: { overnightsError: "" }, 
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

        updateOvernights: (
            state,
            action: PayloadAction<{ draftId: string; field: OvernightsField; value: unknown }>
        ) => {
            const { draftId, field, value } = action.payload;
            const draft = state.draftsById[draftId];
            if (!draft) return;

            const result = recalcOvernightsStrict(draft.overnights, field, value);

            if (!result.ok) {
                draft.validation.overnightsError = result.message;
                return; // HARD BLOCK: do not update overnights
            }

            draft.overnights = result.value;
            draft.validation.overnightsError = "";

            // keep defaults consistent
            const cust = draft.overnights.p1Percent > 50 ? "P1" : "P2";
            draft.childSupport.custodialParent = cust;
            draft.dependentCare.dependentOf = cust;
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

            // 1) Age recompute
            const asOf = calculationAsOfDate || draft.computed.calculationAsOfDateSnapshot || "";
            const { years, months } = calcAgeYearsMonths(draft.dob, asOf);

            draft.computed.ageYears = years;
            draft.computed.ageMonths = months;
            draft.computed.calculationAsOfDateSnapshot = asOf;

            // 2) Age-based defaults
            if (draft.dob && asOf) {
                const under18 = isUnderAge(draft.dob, asOf, 18);
                const under13 = isUnderAge(draft.dob, asOf, 13);

                if (under18) draft.childSupport.eligible = "YES";
                draft.dependentCare.eligibleChildCareCreditUnder13 = under13 ? "YES" : "NO";
            }

            // 3) Custodial + dependent-of defaults from current overnights
            // (Overnights are already normalized elsewhere via updateOvernights)
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
    updateOvernights
} = childrenSlice.actions;

export default childrenSlice.reducer;
