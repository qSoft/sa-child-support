import React from "react";

export default function LeftNav() {
  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7, marginBottom: 8 }}>MENU</div>
      <a
        href="#/child-support"
        style={{
          display: "block",
          padding: "10px 10px",
          borderRadius: 8,
          textDecoration: "none",
          background: "#eef2ff",
          fontWeight: 600,
          color: "#111827",
        }}
      >
        Child Support
      </a>
    </div>
  );
}
