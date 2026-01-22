import React from "react";
import "./AppLayout.css";
import Header from "./Header";
import LeftNav from "./LeftNav";
import RightSummary from "../Summary/RightSummary";

export type AppLayoutProps = {
  middle: React.ReactNode;
};

const AppLayout: React.FC<AppLayoutProps> = ({ middle }) => {
  return (
    <div className="appShell">
      <Header />
      <div className="appBody">
        <aside className="leftNav">
          <LeftNav />
        </aside>
        <main className="middle">{middle}</main>
        <aside className="rightSummary">
          <RightSummary />
        </aside>
      </div>
    </div>
  );
};

export default AppLayout;
