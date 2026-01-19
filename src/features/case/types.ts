export type ISODate = string; // "YYYY-MM-DD"

export interface GeneralInfo {
  caseDate: ISODate;
  calculationAsOfDate: ISODate;
  caseYearEnd: ISODate;
}

export interface CaseState {
  generalInfo: GeneralInfo;
}
