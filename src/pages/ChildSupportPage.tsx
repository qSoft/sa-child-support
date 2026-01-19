import React from "react";
import HorizontalTabs, { TabDef } from "./tabs/HorizontalTabs";
import GeneralInfoTab from "./tabs/GeneralInfoTab";
import ChildrenTab from "./tabs/ChildrenTab";

export default function ChildSupportPage() {
  const [active, setActive] = React.useState<string>("general");

  const tabs: TabDef[] = [
    { key: "general", label: "General Info", content: <GeneralInfoTab /> },
    { key: "children", label: "Children", content: <ChildrenTab /> },
    { key: "fedtax", label: "Federal Tax Inputs", content: <div>Coming soon</div> },
    { key: "deductions", label: "Deductions", content: <div>Coming soon</div> },
    { key: "business", label: "Business Income", content: <div>Coming soon</div> },
    { key: "amt", label: "AMT", content: <div>Coming soon</div> },
    { key: "edu", label: "Education Credits", content: <div>Coming soon</div> },
  ];

  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Child Support</div>
      <HorizontalTabs tabs={tabs} activeKey={active} onChange={setActive} />
    </div>
  );
}
