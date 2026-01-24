import React from "react";
import HorizontalTabs, { TabDef } from "./tabs/HorizontalTabs";
import GeneralInfoTab from "./tabs/GeneralInfoTab";
import ChildrenTab from "./tabs/ChildrenTab";
import FederalTaxInputsTab from "./tabs/FederalTaxInputsTab";
import StateTaxTab from "./tabs/StateTaxTab";
import { setActiveTopTab, TopTabKey } from "../features/ui/uiSlice";
import { useAppDispatch } from "../app/hooks";


export default function ChildSupportPage() {
  const dispatch = useAppDispatch();

  const [active, setActive] = React.useState<TopTabKey>("general");


  const tabs: TabDef[] = [
    { key: "general", label: "General Info", content: <GeneralInfoTab /> },
    { key: "children", label: "Children", content: <ChildrenTab /> },
    { key: "federal", label: "Federal Tax", content: <FederalTaxInputsTab /> },
    { key: "state", label: "State Tax", content: <StateTaxTab /> },
  ];

  const onChange = (key: string) => {
    const k = key as TopTabKey;
    setActive(k);
    dispatch(setActiveTopTab(k)); // ✅ drives right summary
  };

  React.useEffect(() => {
    dispatch(setActiveTopTab(active)); // initial
  }, [dispatch, active]);



  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 10 }}>Child Support</div>
      <HorizontalTabs tabs={tabs} activeKey={active} onChange={onChange} />
    </div>
  );

}
