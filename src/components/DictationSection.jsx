import React, { useState, useEffect, useMemo } from "react";
import {
  RotateCcw,
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  Volume2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import FillInBlanksInput from "./FillInBlanksInput";
import DictationModeSelect from "./DictationModeSelect";
import Mascot from "./Mascot";
import { sounds } from "../utils/audioEffects";
import { playGoogleSpeech } from "../utils/pronunciationAudio";

export default function DictationSection({
  sentence,
  sentenceIndex,
  totalSentences,
  dictationMode,
  setDictationMode,
  blankAnswers,
  setBlankAnswers,
  correctWords,
  setCorrectWords,
  hasBeenGraded,
  setHasBeenGraded,
  isCompleted,
  onReplay,
  onNext,
  onPrev,
  onWordClick
}) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showIPA, setShowIPA] = useState(false);
  const [allRevealed, setAllRevealed] = useState(false);
  const [mascotMessage, setMascotMessage] = useState(
    "Lắng nghe kỹ audio và gõ những gì bạn nghe được vào ô bên dưới nhé!"
  );

  // Reset state when sentence changes
  useEffect(() => {
    setAllRevealed(false);
    setMascotMessage("Lắng nghe kỹ audio và gõ những gì bạn nghe được vào ô bên dưới nhé!");
  }, [sentenceIndex]);

  // Compute revealed indices depending on mode
  const revealedIndices = useMemo(() => {
    if (!sentence?.text) return [];
    if (dictationMode === "hard") return [];

    const words = sentence.text.trim().split(/\s+/);
    const count = words.length;
    if (count <= 2) return [];

    const revealRatio = dictationMode === "easy" ? 0.45 : 0.2;
    const numToReveal = Math.floor(count * revealRatio);

    const indices = [];
    for (let i = 0; i < count; i++) {
      const clean = words[i].replace(/[^\w]/g, "");
      if (clean.length <= 3 && indices.length < numToReveal) {
        indices.push(i);
      }
    }
    return indices;
  }, [sentence, dictationMode]);

  const handleBlankChange = (idx, value) => {
    setBlankAnswers((prev) => ({
      ...prev,
      [idx]: value
    }));
  };

  const handleRevealBlank = (idx) => {
    if (!sentence?.text) return;
    const words = sentence.text.trim().split(/\s+/);
    const raw = words[idx];
    const clean = raw.replace(/^[^\w]+|[^\w]+$/g, "");

    setBlankAnswers((prev) => ({
      ...prev,
      [idx]: clean
    }));
    setCorrectWords((prev) => ({
      ...prev,
      [idx]: true
    }));
    sounds.playCorrect();
    setMascotMessage(`Gợi ý: từ đó là "${clean}"! Hãy ghi nhớ nhé.`);
  };

  // Reveal ALL words
  const handleRevealAll = () => {
    if (!sentence?.text) return;
    const words = sentence.text.trim().split(/\s+/);
    const newAnswers = { ...blankAnswers };
    const newCorrect = { ...correctWords };

    words.forEach((raw, idx) => {
      const clean = raw.replace(/^[^\w]+|[^\w]+$/g, "");
      if (clean.length > 0 && !revealedIndices.includes(idx)) {
        newAnswers[idx] = clean;
        newCorrect[idx] = true;
      }
    });

    setBlankAnswers(newAnswers);
    setCorrectWords(newCorrect);
    setAllRevealed(true);
    setHasBeenGraded(true);
    setMascotMessage("Đã hiện tất cả từ! Hãy đọc lại câu và ghi nhớ nhé.");
  };

  // Check if all words are correctly matched (for auto-advance)
  const isAllCorrectNow = useMemo(() => {
    if (!sentence?.text) return false;
    const words = sentence.text.trim().split(/\s+/);
    return words.every((raw, idx) => {
      const clean = raw.replace(/^[^\w]+|[^\w]+$/g, "");
      if (clean.length === 0) return true;
      if (revealedIndices.includes(idx)) return true;
      if (correctWords[idx]) return true;
      const userVal = (blankAnswers[idx] || "").trim().toLowerCase();
      return userVal === clean.toLowerCase();
    });
  }, [sentence, blankAnswers, correctWords, revealedIndices]);

  // Auto-advance when all correct
  useEffect(() => {
    if (isAllCorrectNow && !allRevealed && sentenceIndex + 1 < totalSentences) {
      setMascotMessage("Xuất sắc! Bạn đã chép chính tả đúng 100% câu này!");
      const timer = setTimeout(() => {
        onNext();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAllCorrectNow, allRevealed, sentenceIndex, totalSentences, onNext]);

  const progressPercent = Math.round(((sentenceIndex + 1) / totalSentences) * 100);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--card)",
        border: "2px solid var(--border)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        height: "100%",
        justifyContent: "space-between"
      }}
    >
      {/* Top Header info */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 800,
                color: "var(--primary)",
                backgroundColor: "var(--accent)",
                padding: "4px 10px",
                borderRadius: "8px"
              }}
            >
              Câu {sentenceIndex + 1} / {totalSentences}
            </span>
            <span style={{ fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 600 }}>
              Tiến độ {progressPercent}%
            </span>
          </div>

          <DictationModeSelect mode={dictationMode} onChange={setDictationMode} />
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: "6px",
            backgroundColor: "var(--secondary)",
            borderRadius: "9999px",
            overflow: "hidden",
            marginBottom: "16px"
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              backgroundColor: "var(--primary)",
              transition: "width 0.3s ease"
            }}
          />
        </div>

        {/* Mascot reaction row */}
        <div style={{ marginBottom: "16px" }}>
          <Mascot message={mascotMessage} />
        </div>

        {/* Fill in Blanks Area — Sorata-style */}
        <div
          style={{
            backgroundColor: "var(--muted)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "16px 20px",
            marginBottom: "16px"
          }}
        >
          <FillInBlanksInput
            sentenceText={sentence?.text}
            dictationMode={dictationMode}
            revealedIndices={revealedIndices}
            blankAnswers={blankAnswers}
            onBlankChange={handleBlankChange}
            correctWords={correctWords}
            hasBeenGraded={hasBeenGraded}
            isAllCorrect={isCompleted || isAllCorrectNow}
            onRevealBlank={handleRevealBlank}
            onWordClick={onWordClick}
          />
        </div>

        {/* IPA Phonetics toggle */}
        {showIPA && sentence?.ipa && (
          <div
            style={{
              marginTop: "12px",
              paddingTop: "8px",
              borderTop: "1px dashed var(--border)",
              fontSize: "14px",
              color: "var(--muted-foreground)",
              fontWeight: 600
            }}
          >
            Phát âm IPA: <span style={{ color: "var(--foreground)" }}>{sentence.ipa}</span>
          </div>
        )}

        {/* Vietnamese translation toggle */}
        {showTranslation && sentence?.translations?.vi && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "14px",
              color: "var(--primary)",
              fontWeight: 600,
              backgroundColor: "var(--card)",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid var(--border)"
            }}
          >
            🇻🇳 {sentence.translations.vi}
          </div>
        )}

        {/* Subtitle / IPA View Toggles */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", marginTop: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setShowTranslation(!showTranslation)}
            className="btn-duo btn-ghost"
            style={{ fontSize: "12px", padding: "6px 10px", borderRadius: "8px" }}
          >
            {showTranslation ? <EyeOff size={14} style={{ marginRight: "4px" }} /> : <Eye size={14} style={{ marginRight: "4px" }} />}
            {showTranslation ? "Ẩn dịch nghĩa" : "Hiện dịch nghĩa tiếng Việt"}
          </button>

          <button
            type="button"
            onClick={() => setShowIPA(!showIPA)}
            className="btn-duo btn-ghost"
            style={{ fontSize: "12px", padding: "6px 10px", borderRadius: "8px" }}
          >
            <Volume2 size={14} style={{ marginRight: "4px" }} />
            {showIPA ? "Ẩn IPA" : "Hiện phiên âm IPA"}
          </button>

          <button
            type="button"
            onClick={() => playGoogleSpeech(sentence?.text)}
            className="btn-duo btn-ghost"
            style={{
              fontSize: "12px",
              padding: "6px 10px",
              borderRadius: "8px",
              color: "var(--primary)",
              backgroundColor: "rgba(56, 189, 248, 0.1)"
            }}
            title="Nghe phát âm chuẩn giọng Google AI"
          >
            <Volume2 size={14} style={{ marginRight: "4px" }} />
            Phát âm Google
          </button>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        {/* Reveal All + Next buttons — Sorata style */}
        {!isAllCorrectNow && !allRevealed && (
          <button
            onClick={handleRevealAll}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: "12px",
              border: "2px solid rgba(250, 204, 21, 0.4)",
              backgroundColor: "rgba(250, 204, 21, 0.1)",
              color: "#facc15",
              fontSize: "14px",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            Hiện tất cả từ
          </button>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onReplay}
              className="btn-duo btn-outline"
              style={{ padding: "10px 16px" }}
              title="Space hoặc Tab để nghe lại"
            >
              <RotateCcw size={16} style={{ marginRight: "6px" }} />
              Nghe lại
            </button>
            <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 600 }}>
              [Space / Tab]
            </span>
          </div>

          <button
            onClick={onNext}
            style={{
              padding: "12px 28px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: isAllCorrectNow || allRevealed ? "var(--primary)" : "rgba(56, 189, 248, 0.15)",
              color: isAllCorrectNow || allRevealed ? "#fff" : "var(--primary)",
              fontSize: "15px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s"
            }}
          >
            Tiếp theo
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
