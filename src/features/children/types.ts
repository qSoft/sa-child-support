export type RelationshipType = "THIS" | "OTHER";
export type YesNo = "YES" | "NO";
export type Parent = "P1" | "P2";


export interface Overnights {
  p1Percent: number; // 0..100
  p2Percent: number; // 0..100
  p1Days: number;    // 0..totalDays
  p2Days: number;    // 0..totalDays
}


export interface ChildSupport {
  eligible: YesNo;
  reasonIfOver18: string;
  custodialParent: Parent;
}

export interface DependentCare {
  dependentOf: Parent;
  form8332: boolean;
  eligibleChildCareCreditUnder13: YesNo;
  meetsQualifyingCriteriaIfOverridden: boolean;
  percentOfYearEligible: number;

  paidByP1: number;
  paidByP2: number;
  p1FsaBenefits: number;
  p2FsaBenefits: number;

  eligibleChildTaxCredit: boolean;
  eligibleOtherDependentTaxCredit: boolean;
  eligibleEIC: boolean;
}

export interface ChildComputed {
  ageYears: number;
  ageMonths: number;
  calculationAsOfDateSnapshot: string;
}

export interface ChildDraft {
  id: string;
  relationshipType: RelationshipType;
  name: string;
  dob: string;
  fullTimeStudent: YesNo;
  overnights: Overnights;
  childSupport: ChildSupport;
  dependentCare: DependentCare;
  computed: ChildComputed;
  validation: ChildValidation; 
}


export interface ChildrenUiState {
  activeForm: null | { relationshipType: RelationshipType; draftId: string };
}

export interface ChildrenState {
  childrenThisRelationship: ChildDraft[];
  childrenOtherRelationship: ChildDraft[];
  ui: ChildrenUiState;
  draftsById: Record<string, ChildDraft>;
}

export interface ChildValidation {
  overnightsError: string;
}
