import React from "react";

export default function Header() {
  return (
    <div style={{
      height: 56, display: "flex", alignItems: "center", padding: "0 16px",
      borderBottom: "1px solid #e6e8f0", background: "white"
    }}>
      <div style={{ fontWeight: 700 }}>Child Support Calculator</div>
      <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
        Home / Child Support
      </div>
    </div>
  );
}
