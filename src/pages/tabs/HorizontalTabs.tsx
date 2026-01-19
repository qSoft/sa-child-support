import React from "react";

export type TabDef = {
  key: string;
  label: string;
  content: React.ReactNode;
};

type Props = {
  tabs: TabDef[];
  activeKey: string;
  onChange: (key: string) => void;
};

export default function HorizontalTabs({ tabs, activeKey, onChange }: Props) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #eef0f6", paddingBottom: 8 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              border: "1px solid #e6e8f0",
              background: activeKey === t.key ? "#111827" : "white",
              color: activeKey === t.key ? "white" : "#111827",
              padding: "8px 10px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ paddingTop: 12 }}>
        {tabs.find((t) => t.key === activeKey)?.content}
      </div>
    </div>
  );
}
