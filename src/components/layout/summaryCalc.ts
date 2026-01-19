// src/components/layout/summaryCalc.ts
import type { ChildDraft, Parent, RelationshipType } from "../../features/children/types";

export type SummaryCell = number | "-" | 0;
export type SummaryRow = {
  childId: string;
  relationshipType: RelationshipType;
  childName: string;
  childLabel: string;

  childSupport: SummaryCell;
  ccc: SummaryCell;
  ccCosts: SummaryCell;
  dependentCareBenefits: SummaryCell;
  ctc: SummaryCell;
  otherDependentCtc: SummaryCell;
  eic: SummaryCell;
};

function isThisRelationship(c: ChildDraft): boolean {
  return c.relationshipType === "THIS";
}

function isOtherRelationship(c: ChildDraft): boolean {
  return c.relationshipType === "OTHER";
}

function paidByForParent(c: ChildDraft, parent: Parent): number {
  return parent === "P1"
    ? Number(c.dependentCare.paidByP1 || 0)
    : Number(c.dependentCare.paidByP2 || 0);
}

function fsaForParent(c: ChildDraft, parent: Parent): number {
  return parent === "P1"
    ? Number(c.dependentCare.p1FsaBenefits || 0)
    : Number(c.dependentCare.p2FsaBenefits || 0);
}

function percentEligible(c: ChildDraft): number {
  return Number(c.dependentCare.percentOfYearEligible || 0);
}

function overnightsPercentForParent(c: ChildDraft, parent: Parent): number {
  return parent === "P1" ? Number(c.overnights.p1Percent || 0) : Number(c.overnights.p2Percent || 0);
}

function isChildSupportEligibleYes(c: ChildDraft): boolean {
  return c.childSupport.eligible === "YES";
}

function isEligibleEicYes(c: ChildDraft): boolean {
  return !!c.dependentCare.eligibleEIC;
}

function dependentOfIsParent(c: ChildDraft, parent: Parent): boolean {
  return c.dependentCare.dependentOf === parent;
}

function ageGreaterThan18(c: ChildDraft): boolean {
  const years = Number(c.computed.ageYears || 0);
  const months = Number(c.computed.ageMonths || 0);
  return years > 18 || (years === 18 && months > 0);
}

/**
 * Child support:
 * - THIS: 1 if (overnights% > 50 for parent) AND Child Support Eligible = YES else 0
 * - OTHER: "-"
 */
function calcChildSupportCell(c: ChildDraft, parent: Parent): SummaryCell {
  if (isOtherRelationship(c)) return "-";
  const pct = overnightsPercentForParent(c, parent);
  return pct > 50 && isChildSupportEligibleYes(c) ? 1 : 0;
}

/**
 * CCC:
 * - THIS: same rule as Child support
 * - OTHER: 0
 */
function calcCccCell(c: ChildDraft, parent: Parent): SummaryCell {
  if (isOtherRelationship(c)) return 0;
  return calcChildSupportCell(c, parent) === 1 ? 1 : 0;
}

/**
 * CC Costs:
 * - THIS: Paid by parent * (% of year eligible) ONLY if Child support value is 1, else "-"
 * - OTHER: "-"
 */
function calcCcCostsCell(c: ChildDraft, parent: Parent, childSupportCell: SummaryCell): SummaryCell {
  if (isOtherRelationship(c)) return "-";
  if (childSupportCell !== 1) return "-";

  const paid = paidByForParent(c, parent);
  const pct = percentEligible(c);
  const value = paid * (pct / 100);

  return value > 0 ? round2(value) : 0;
}

/**
 * Dependent care benefits:
 * - THIS: FSA for parent ONLY if Child support value is 1, else "-"
 * - OTHER: "-"
 */
function calcDependentCareBenefitsCell(c: ChildDraft, parent: Parent, childSupportCell: SummaryCell): SummaryCell {
  if (isOtherRelationship(c)) return "-";
  if (childSupportCell !== 1) return "-";

  const v = fsaForParent(c, parent);
  return v > 0 ? round2(v) : 0;
}

/**
 * CTC:
 * - THIS: 1 if there is a positive CC Costs, else 0
 * - OTHER: 1 if (PaidByParent > 0) AND DependentOf == parent, else 0
 */
function calcCtcCell(c: ChildDraft, parent: Parent, ccCostsCell: SummaryCell): SummaryCell {
  if (isThisRelationship(c)) {
    return typeof ccCostsCell === "number" && ccCostsCell > 0 ? 1 : 0;
  }

  const paid = paidByForParent(c, parent);
  return paid > 0 && dependentOfIsParent(c, parent) ? 1 : 0;
}

/**
 * Other dependent-CTC:
 * - THIS: 0
 * - OTHER: 1 if Age > 18 AND (PaidByParent > 0) AND DependentOf == parent, else 0
 */
function calcOtherDependentCtcCell(c: ChildDraft, parent: Parent): SummaryCell {
  if (isThisRelationship(c)) return 0;

  const paid = paidByForParent(c, parent);
  return ageGreaterThan18(c) && paid > 0 && dependentOfIsParent(c, parent) ? 1 : 0;
}

/**
 * EIC:
 * - THIS: 1 if Child support is 1 AND Eligible for EIC is true/YES, else 0
 * - OTHER: 1 if (PaidByParent > 0) AND DependentOf == parent AND Eligible for EIC is true/YES, else 0
 */
function calcEicCell(c: ChildDraft, parent: Parent, childSupportCell: SummaryCell): SummaryCell {
  const eligibleEic = isEligibleEicYes(c);

  if (isThisRelationship(c)) {
    return childSupportCell === 1 && eligibleEic ? 1 : 0;
  }

  const paid = paidByForParent(c, parent);
  return paid > 0 && dependentOfIsParent(c, parent) && eligibleEic ? 1 : 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function buildSummaryRows(children: ChildDraft[], parent: Parent): SummaryRow[] {
  return children.map((c) => {
    const childSupport = calcChildSupportCell(c, parent);
    const ccc = calcCccCell(c, parent);
    const ccCosts = calcCcCostsCell(c, parent, childSupport);
    const dependentCareBenefits = calcDependentCareBenefitsCell(c, parent, childSupport);
    const ctc = calcCtcCell(c, parent, ccCosts);
    const otherDependentCtc = calcOtherDependentCtcCell(c, parent);
    const eic = calcEicCell(c, parent, childSupport);

    const prefix = c.relationshipType === "THIS" ? "THIS" : "OTHER";
    const childName = c.name || "—";

    return {
      childId: c.id,
      relationshipType: c.relationshipType,
      childName,
      childLabel: `${prefix}: ${childName}`,

      childSupport,
      ccc,
      ccCosts,
      dependentCareBenefits,
      ctc,
      otherDependentCtc,
      eic,
    };
  });
}
