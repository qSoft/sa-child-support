import React from "react";
import HorizontalTabs, { TabDef } from "./HorizontalTabs";

// new nested tabs
import FederalGeneralInfoTab from "./federal/FederalGeneralInfoTab";
import FederalIncomeTab from "./federal/FederalIncomeTab";

// existing moved tabs
import DeductionsTab from "./federal/DeductionsTab";
import BusinessIncomeTab from "./federal/BusinessIncomeTab";
import AmtTab from "./federal/AmtTab";
import EducationCreditsTab from "./federal/EducationCreditsTab";

export default function FederalTaxInputsTab() {
    const [active, setActive] = React.useState<string>("fedGeneral");

    const tabs: TabDef[] = [
        { key: "fedGeneral", label: "General Info", content: <FederalGeneralInfoTab /> },
        { key: "income", label: "Personal Income", content: <FederalIncomeTab /> },
        { key: "business", label: "Business Income", content: <BusinessIncomeTab /> },
        { key: "deductions", label: "Deductions", content: <DeductionsTab /> },
        { key: "amt", label: "AMT", content: <AmtTab /> },
        { key: "edu", label: "Education Credits", content: <EducationCreditsTab /> },
    ];

    return (
        <div>
            <div style={{ fontWeight: 800, marginBottom: 10 }}></div>
            <HorizontalTabs tabs={tabs} activeKey={active} onChange={setActive} />
        </div>
    );
}
