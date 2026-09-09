import React from "react";

export default function DictationModeSelect({ mode, onChange }) {
  const modes = [
    { id: "easy", label: "Dễ", desc: "Ẩn ít từ" },
    { id: "medium", label: "Trung bình", desc: "Ẩn vừa" },
    { id: "hard", label: "Khó", desc: "Ẩn 100%" }
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: "var(--secondary)",
        borderRadius: "10px",
        padding: "3px",
        gap: "4px"
      }}
    >
      {modes.map((m) => {
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              borderRadius: "8px",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: isActive ? "var(--primary)" : "transparent",
              color: isActive ? "#ffffff" : "var(--muted-foreground)",
              transition: "all 0.15s ease"
            }}
          >
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
