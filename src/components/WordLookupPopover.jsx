import React, { useState } from "react";
import { Volume2, Bookmark, Check, X } from "lucide-react";
import { lookupWord } from "../data/dictionary";
import { playGoogleSpeech } from "../utils/pronunciationAudio";

export default function WordLookupPopover({ word, position, onClose, onSaveWord }) {
  const [isSaved, setIsSaved] = useState(false);
  const info = lookupWord(word);

  const speak = () => {
    playGoogleSpeech(word);
  };

  const handleSave = () => {
    setIsSaved(true);
    if (onSaveWord) onSaveWord(info);
    setTimeout(() => setIsSaved(false), 2500);
  };

  if (!info) return null;

  return (
    <div
      style={{
        position: "fixed",
        // Center the popover horizontally relative to the click position, but keep it on screen
        left: Math.min(window.innerWidth - 320, Math.max(16, position.x - 150)),
        // Place it just above the clicked word (approx 200px tall), or fallback if too high
        top: Math.max(16, position.y - 220),
        width: "300px",
        backgroundColor: "var(--card)",
        color: "var(--foreground)",
        border: "2px solid var(--border)",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
        zIndex: 9999,
        animation: "bounce-gentle 0.2s ease-out"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px", fontWeight: 800, textTransform: "capitalize" }}>{info.word}</span>
          <button
            onClick={speak}
            title="Phát âm chuẩn Google TTS"
            style={{
              background: "var(--accent)",
              border: "none",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--primary)"
            }}
          >
            <Volume2 size={16} />
          </button>
        </div>
        <button
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 600 }}>{info.ipa}</span>
        <span
          style={{
            fontSize: "11px",
            backgroundColor: "var(--secondary)",
            color: "var(--primary)",
            padding: "2px 6px",
            borderRadius: "6px",
            fontWeight: 700,
            textTransform: "uppercase"
          }}
        >
          {info.type}
        </span>
      </div>

      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--foreground)", marginBottom: "8px" }}>
        {info.meaning}
      </p>

      {info.example && (
        <p style={{ fontSize: "12px", color: "var(--muted-foreground)", fontStyle: "italic", marginBottom: "12px", borderLeft: "2px solid var(--primary)", paddingLeft: "8px" }}>
          "{info.example}"
        </p>
      )}

      <button
        onClick={handleSave}
        className="btn-duo"
        style={{
          width: "100%",
          padding: "8px",
          fontSize: "13px",
          backgroundColor: isSaved ? "var(--success-bg)" : "var(--secondary)",
          color: isSaved ? "var(--success)" : "var(--foreground)",
          border: isSaved ? "1px solid var(--success)" : "1px solid var(--border)"
        }}
      >
        {isSaved ? (
          <>
            <Check size={16} style={{ marginRight: "6px" }} />
            Đã lưu vào sổ từ vựng!
          </>
        ) : (
          <>
            <Bookmark size={15} style={{ marginRight: "6px" }} />
            Lưu vào sổ từ vựng (SRS)
          </>
        )}
      </button>
    </div>
  );
}
