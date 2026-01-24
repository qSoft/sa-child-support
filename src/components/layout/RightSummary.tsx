import React from "react";
import { useAppSelector } from "../../app/hooks";
import ChildSupportSummary from "../Summary/ChildSupportSummary";
import FederalTaxSummary from "./FederalTaxSummary";
import StateTaxSummary from "./StateTaxSummary";

export default function RightSummary() {
  const activeTopTab = useAppSelector((s) => s.ui.activeTopTab);
  console.log("activeTopTab =", activeTopTab);

  if (activeTopTab === "federal") return <FederalTaxSummary />;
  if (activeTopTab === "state") return <StateTaxSummary />;

  return <ChildSupportSummary />;
}
