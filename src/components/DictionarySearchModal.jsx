import React, { useState } from "react";
import { Search, X, Volume2, Bookmark, Check } from "lucide-react";
import { lookupWord, dictionary } from "../data/dictionary";
import { playGoogleSpeech } from "../utils/pronunciationAudio";

export default function DictionarySearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWord, setSelectedWord] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const res = lookupWord(searchTerm.trim());
    setSelectedWord(res);
  };

  const speak = (word) => {
    playGoogleSpeech(word);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "var(--card)",
          borderRadius: "20px",
          border: "2px solid var(--border)",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--foreground)" }}>Tra Từ Điển Nhanh</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              backgroundColor: "var(--muted)",
              borderRadius: "12px",
              border: "1px solid var(--border)"
            }}
          >
            <Search size={16} color="var(--muted-foreground)" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nhập từ tiếng Anh (vd: morning, snooze...)"
              autoFocus
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                color: "var(--foreground)"
              }}
            />
          </div>
          <button type="submit" className="btn-duo btn-primary" style={{ padding: "8px 16px" }}>
            Tra
          </button>
        </form>

        {selectedWord ? (
          <div
            style={{
              padding: "16px",
              borderRadius: "14px",
              backgroundColor: "var(--muted)",
              border: "1px solid var(--border)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px", fontWeight: 800, textTransform: "capitalize" }}>
                  {selectedWord.word}
                </span>
                <button
                  onClick={() => speak(selectedWord.word)}
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
              <span
                style={{
                  fontSize: "11px",
                  backgroundColor: "var(--secondary)",
                  color: "var(--primary)",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  fontWeight: 700
                }}
              >
                {selectedWord.type}
              </span>
            </div>

            <p style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 600, marginBottom: "8px" }}>
              {selectedWord.ipa}
            </p>

            <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", marginBottom: "8px" }}>
              {selectedWord.meaning}
            </p>

            {selectedWord.example && (
              <p style={{ fontSize: "13px", color: "var(--muted-foreground)", fontStyle: "italic", borderLeft: "2px solid var(--primary)", paddingLeft: "8px", marginBottom: "16px" }}>
                "{selectedWord.example}"
              </p>
            )}

            <button
              onClick={() => {
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
              }}
              className="btn-duo"
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "13px",
                backgroundColor: isSaved ? "var(--success-bg)" : "var(--card)",
                color: isSaved ? "var(--success)" : "var(--foreground)",
                border: isSaved ? "1px solid var(--success)" : "1px solid var(--border)"
              }}
            >
              {isSaved ? (
                <>
                  <Check size={16} style={{ marginRight: "6px" }} />
                  Đã thêm vào bộ nhớ lặp ngắt quãng!
                </>
              ) : (
                <>
                  <Bookmark size={15} style={{ marginRight: "6px" }} />
                  Lưu vào bộ từ vựng (Spaced Repetition)
                </>
              )}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted-foreground)", fontSize: "13px" }}>
            Nhập từ bạn muốn tra hoặc nhấp trực tiếp vào các từ trong bài nghe.
          </div>
        )}
      </div>
    </div>
  );
}
