import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { Eye, Mic } from "lucide-react";
import { sounds } from "../utils/audioEffects";

/**
 * Sorata-style dictation input:
 * - A textarea where the user types freely what they hear
 * - Word chips below show **** for each character
 * - As the user types correct characters, the * are replaced with the actual letter in real-time
 * - Each word chip has an eye icon to reveal it (counts as a mistake)
 */
export default function FillInBlanksInput({
  sentenceText,
  dictationMode = "medium",
  revealedIndices = [],
  blankAnswers = {},
  onBlankChange,
  correctWords = {},
  hasBeenGraded = false,
  isAllCorrect = false,
  onRevealBlank,
  onWordClick
}) {
  const textareaRef = useRef(null);
  const [typedText, setTypedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const prevFullyMatchedRef = useRef(new Set());

  // Parse sentence into word tokens
  const tokens = useMemo(() => {
    if (!sentenceText) return [];
    const rawTokens = sentenceText.trim().split(/\s+/);
    return rawTokens.map((raw, idx) => {
      const cleanWord = raw.replace(/^[^\w']+|[^\w']+$/g, "");
      const leadingPunc = raw.match(/^[^\w']+/)?.[0] || "";
      const trailingPunc = raw.match(/[^\w']+$/)?.[0] || "";
      return {
        idx,
        raw,
        cleanWord,
        cleanLower: cleanWord.toLowerCase(),
        leadingPunc,
        trailingPunc,
        isPunctuationOnly: cleanWord.length === 0
      };
    });
  }, [sentenceText]);

  // Reset typed text when sentence changes
  useEffect(() => {
    setTypedText("");
    prevFullyMatchedRef.current = new Set();
  }, [sentenceText]);

  // Focus textarea on mount / sentence change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (textareaRef.current) textareaRef.current.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [sentenceText]);

  // ──────────────────────────────────────────────────────────────
  // Core matching engine
  //
  // Strategy:
  // 1. Get list of target words that need to be typed (not pre-revealed, not hint-revealed)
  // 2. Split user input into words by whitespace
  // 3. If input does NOT end with space/newline, the last word is "partial" (still being typed)
  // 4. Match complete user words 1:1 against target words (exact match = fully revealed)
  // 5. For the partial word, do character-by-character comparison
  // ──────────────────────────────────────────────────────────────
  const revealMap = useMemo(() => {
    // revealMap[tokenIdx] = number of characters revealed (0 to word.length)
    const map = {};

    // Get tokens that need to be typed by the user
    const typableTokens = tokens.filter(
      t => !t.isPunctuationOnly && !revealedIndices.includes(t.idx) && !correctWords[t.idx]
    );

    // Split user input into parts
    const trimmed = typedText.toLowerCase();
    const parts = trimmed.split(/\s+/).filter(Boolean);

    // Determine if the last part is still being typed (no trailing whitespace)
    const hasTrailingSpace = typedText.length > 0 && /\s$/.test(typedText);
    const completeParts = hasTrailingSpace ? parts : parts.slice(0, -1);
    const partialPart = hasTrailingSpace ? null : (parts.length > 0 ? parts[parts.length - 1] : null);

    let partIdx = 0;
    let usedPartial = false;

    for (const token of typableTokens) {
      const target = token.cleanLower;

      // Try to match a complete user word first
      if (partIdx < completeParts.length) {
        const userWord = completeParts[partIdx];
        if (userWord === target) {
          // Perfect full match
          map[token.idx] = target.length;
          partIdx++;
          continue;
        } else {
          // User typed a wrong word — count matching chars from start, then consume and move on
          let matched = 0;
          for (let i = 0; i < Math.min(userWord.length, target.length); i++) {
            if (userWord[i] === target[i]) matched++;
            else break;
          }
          map[token.idx] = matched;
          partIdx++;
          continue;
        }
      }

      // Try partial match (user is currently typing this word)
      if (!usedPartial && partialPart !== null && partIdx >= completeParts.length) {
        let matched = 0;
        for (let i = 0; i < Math.min(partialPart.length, target.length); i++) {
          if (partialPart[i] === target[i]) matched++;
          else break;
        }
        map[token.idx] = matched;
        usedPartial = true;

        // If partial actually fully matches, mark it
        if (partialPart === target) {
          map[token.idx] = target.length;
        }
        continue;
      }

      // No more user input — 0 chars revealed
      map[token.idx] = 0;
    }

    return map;
  }, [typedText, tokens, revealedIndices, correctWords]);

  // Notify parent when a word becomes fully matched
  useEffect(() => {
    const newlyMatched = [];
    for (const token of tokens) {
      if (token.isPunctuationOnly) continue;
      if (revealedIndices.includes(token.idx)) continue;
      if (correctWords[token.idx]) continue;

      const revealed = revealMap[token.idx] || 0;
      if (revealed >= token.cleanWord.length) {
        if (!prevFullyMatchedRef.current.has(token.idx)) {
          prevFullyMatchedRef.current.add(token.idx);
          newlyMatched.push(token);
        }
      }
    }

    for (const token of newlyMatched) {
      onBlankChange(token.idx, token.cleanWord);
      sounds.playCorrect();
    }
  }, [revealMap, tokens, revealedIndices, correctWords, onBlankChange]);

  // Check if ALL words are fully matched
  const allWordsMatched = useMemo(() => {
    if (tokens.length === 0) return false;
    return tokens
      .filter(t => !t.isPunctuationOnly)
      .every(t => {
        if (revealedIndices.includes(t.idx)) return true;
        if (correctWords[t.idx]) return true;
        return (revealMap[t.idx] || 0) >= t.cleanWord.length;
      });
  }, [tokens, revealMap, revealedIndices, correctWords]);

  // Play completion sound
  const prevAllMatched = useRef(false);
  useEffect(() => {
    if (allWordsMatched && !prevAllMatched.current && tokens.length > 0) {
      sounds.playSentenceComplete();
    }
    prevAllMatched.current = allWordsMatched;
  }, [allWordsMatched, tokens.length]);

  // ──────────────────────────────────────────────────────────────
  // Speech recognition
  // ──────────────────────────────────────────────────────────────
  const toggleSpeechRecognition = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setTypedText(t);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [isListening]);

  // ──────────────────────────────────────────────────────────────
  // Render a single word chip
  // ──────────────────────────────────────────────────────────────
  const renderWordChip = useCallback((token) => {
    const { idx, cleanWord, leadingPunc, trailingPunc, isPunctuationOnly } = token;

    if (isPunctuationOnly) {
      return (
        <span key={idx} style={{ fontSize: "17px", fontWeight: 700, color: "var(--foreground)" }}>
          {token.raw}
        </span>
      );
    }

    const isPreRevealed = revealedIndices.includes(idx);
    const isHintRevealed = correctWords[idx];
    const isFullyRevealed = isPreRevealed || isHintRevealed || isAllCorrect;

    // Number of chars to reveal from user typing
    const typedReveal = revealMap[idx] || 0;
    const totalRevealed = isFullyRevealed ? cleanWord.length : typedReveal;
    const isComplete = totalRevealed >= cleanWord.length;

    // Build char array
    const chars = cleanWord.split("").map((ch, ci) => ({
      char: ch,
      revealed: ci < totalRevealed
    }));

    // Visual styles
    let chipBg, chipBorder, textColor;

    if (isComplete) {
      if (isPreRevealed) {
        chipBg = "rgba(100, 116, 139, 0.15)";
        chipBorder = "1px solid rgba(100, 116, 139, 0.25)";
        textColor = "var(--foreground)";
      } else {
        chipBg = "rgba(34, 197, 94, 0.12)";
        chipBorder = "1px solid rgba(34, 197, 94, 0.35)";
        textColor = "#4ade80";
      }
    } else if (totalRevealed > 0) {
      chipBg = "rgba(250, 204, 21, 0.08)";
      chipBorder = "1px solid rgba(250, 204, 21, 0.3)";
      textColor = "#facc15";
    } else {
      chipBg = "rgba(30, 41, 59, 0.6)";
      chipBorder = "1px solid rgba(71, 85, 105, 0.4)";
      textColor = "rgba(148, 163, 184, 0.5)";
    }

    return (
      <div
        key={idx}
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          marginTop: "18px"
        }}
      >
        {/* Eye reveal button */}
        {!isComplete && onRevealBlank && (
          <button
            type="button"
            onClick={() => onRevealBlank(idx)}
            title="Tiết lộ từ này (tính là lỗi)"
            tabIndex={-1}
            style={{
              position: "absolute",
              top: "-16px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--muted-foreground)",
              padding: "1px",
              display: "flex",
              opacity: 0.4,
              transition: "opacity 0.15s"
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "1"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "0.4"; }}
          >
            <Eye size={12} />
          </button>
        )}

        {/* The chip */}
        <span
          onClick={(e) => {
            if (isComplete && onWordClick) {
              const rect = e.currentTarget.getBoundingClientRect();
              onWordClick(cleanWord, { x: rect.left + rect.width / 2, y: rect.top });
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 5px",
            borderRadius: "6px",
            backgroundColor: chipBg,
            border: chipBorder,
            cursor: isComplete ? "pointer" : "default",
            transition: "all 0.2s ease",
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace"
          }}
        >
          {leadingPunc && (
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", marginRight: "1px" }}>
              {leadingPunc}
            </span>
          )}
          {chars.map((c, ci) => (
            <span
              key={ci}
              style={{
                display: "inline-block",
                width: "0.65em",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: 700,
                color: c.revealed ? textColor : "rgba(148, 163, 184, 0.5)",
                transition: "color 0.15s ease"
              }}
            >
              {c.revealed ? c.char : "*"}
            </span>
          ))}
          {trailingPunc && (
            <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", marginLeft: "1px" }}>
              {trailingPunc}
            </span>
          )}
        </span>
      </div>
    );
  }, [revealMap, revealedIndices, correctWords, isAllCorrect, onRevealBlank, onWordClick]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", minHeight: "120px" }}>
      {/* Label */}
      <div style={{
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "1px",
        color: "var(--muted-foreground)"
      }}>
        Gõ những gì bạn nghe được:
      </div>

      {/* Textarea + mic */}
      <div style={{ position: "relative" }}>
        <textarea
          ref={textareaRef}
          value={typedText}
          onChange={e => setTypedText(e.target.value)}
          placeholder="Gõ câu tiếng Anh bạn nghe được vào đây..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          rows={3}
          style={{
            width: "100%",
            padding: "12px 44px 12px 14px",
            borderRadius: "12px",
            border: allWordsMatched ? "2px solid rgba(34, 197, 94, 0.5)" : "2px solid var(--border)",
            backgroundColor: allWordsMatched ? "rgba(34, 197, 94, 0.05)" : "var(--card)",
            color: "var(--foreground)",
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: 1.6,
            outline: "none",
            resize: "none",
            fontFamily: "inherit",
            transition: "border-color 0.2s ease",
            boxSizing: "border-box"
          }}
          onFocus={e => { if (!allWordsMatched) e.target.style.borderColor = "var(--primary)"; }}
          onBlur={e => { if (!allWordsMatched) e.target.style.borderColor = "var(--border)"; }}
        />
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          title="Nhấn để nói"
          style={{
            position: "absolute",
            right: "10px",
            bottom: "10px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: isListening ? "rgba(239, 68, 68, 0.2)" : "rgba(148, 163, 184, 0.15)",
            color: isListening ? "#ef4444" : "var(--muted-foreground)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s"
          }}
        >
          <Mic size={16} />
        </button>
      </div>

      {/* Word chips */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        gap: "8px 5px",
        paddingTop: "2px"
      }}>
        {tokens.map(renderWordChip)}
      </div>

      {/* Helper text */}
      <div style={{
        fontSize: "11px",
        color: "var(--muted-foreground)",
        fontStyle: "italic"
      }}>
        Các từ được tiết lộ sẽ bị tính là lỗi và ảnh hưởng đến điểm số của bạn.
      </div>
    </div>
  );
}
