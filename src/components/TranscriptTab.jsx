import React, { useState } from "react";
import { Play, CheckCircle2, Search, Volume2 } from "lucide-react";
import { playGoogleSpeech } from "../utils/pronunciationAudio";

export default function TranscriptTab({
  sentences = [],
  activeIndex = 0,
  onSelectSentence,
  completedIndices = new Set()
}) {
  const [search, setSearch] = useState("");

  const filtered = sentences.filter(
    (s) =>
      s.text.toLowerCase().includes(search.toLowerCase()) ||
      (s.translations?.vi && s.translations.vi.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--card)",
        borderRadius: "16px",
        border: "2px solid var(--border)",
        overflow: "hidden"
      }}
    >
      {/* Header Search */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}
      >
        <Search size={16} color="var(--muted-foreground)" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm câu trong bài..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            color: "var(--foreground)",
            fontSize: "14px",
            fontWeight: 500
          }}
        />
        <span style={{ fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 600 }}>
          {completedIndices.size} / {sentences.length} câu
        </span>
      </div>

      {/* Sentence List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {filtered.map((item, originalIdx) => {
          const actualIndex = sentences.indexOf(item);
          const isCurrent = actualIndex === activeIndex;
          const isDone = completedIndices.has(actualIndex);

          return (
            <div
              key={item._id || actualIndex}
              onClick={() => onSelectSentence(actualIndex)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "12px",
                marginBottom: "6px",
                cursor: "pointer",
                backgroundColor: isCurrent ? "var(--accent)" : "transparent",
                border: isCurrent ? "1px solid var(--primary)" : "1px solid transparent",
                transition: "all 0.15s ease"
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: isDone ? "var(--success)" : isCurrent ? "var(--primary)" : "var(--secondary)",
                  color: isDone || isCurrent ? "#fff" : "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {isDone ? <CheckCircle2 size={16} /> : actualIndex + 1}
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)", marginBottom: "2px" }}>
                  {item.text}
                </p>
                {item.translations?.vi && (
                  <p style={{ fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 500 }}>
                    {item.translations.vi}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playGoogleSpeech(item.text);
                }}
                className="btn-duo btn-ghost"
                title="Nghe phát âm chuẩn Google"
                style={{
                  padding: "6px",
                  borderRadius: "8px",
                  color: "var(--primary)",
                  flexShrink: 0
                }}
              >
                <Volume2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
