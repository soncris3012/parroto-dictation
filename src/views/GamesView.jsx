import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Sparkles,
  Flame,
  Volume2,
  RotateCcw,
  CheckCircle2,
  Timer,
  Trophy,
  ArrowRight,
  Zap,
  Layers,
  Keyboard,
  Shuffle,
  Clock,
  Award
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { sounds } from "../utils/audioEffects";
import { playGoogleSpeech } from "../utils/pronunciationAudio";
import { vocabularyDecksData } from "../data/vocabularyDecksData";

export default function GamesView() {
  const { currentUser, diamonds, setDiamonds, refreshUser } = useApp();
  const [activeGame, setActiveGame] = useState("match"); // 'match' | 'speed' | 'typing' | 'scramble'
  const [selectedDeckIdx, setSelectedDeckIdx] = useState(0);

  const currentDeck = vocabularyDecksData[selectedDeckIdx] || vocabularyDecksData[0];
  const deckWords = currentDeck.words || [];

  // ==========================================
  // GAME 1: WORD MATCH 3D STATE
  // ==========================================
  const [matchPairCount, setMatchPairCount] = useState(6); // 6, 8, 10
  const [matchCards, setMatchCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [matchScore, setMatchScore] = useState(0);
  const [matchTimer, setMatchTimer] = useState(45);
  const [matchFinished, setMatchFinished] = useState(false);

  const startMatchGame = () => {
    // Pick random unique words from deck
    const shuffledDeck = [...deckWords].sort(() => Math.random() - 0.5);
    const rawWords = shuffledDeck.slice(0, matchPairCount);
    const cardItems = [];

    rawWords.forEach((w, idx) => {
      cardItems.push({ id: `en_${idx}`, pairId: idx, text: w.word, type: "en", ipa: w.ipa });
      cardItems.push({ id: `vi_${idx}`, pairId: idx, text: w.meaning, type: "vi" });
    });

    const shuffled = [...cardItems].sort(() => Math.random() - 0.5);
    setMatchCards(shuffled);
    setSelectedCards([]);
    setMatchedPairs([]);
    setMatchScore(0);
    setMatchTimer(matchPairCount * 8);
    setMatchFinished(false);
  };

  useEffect(() => {
    if (activeGame === "match") startMatchGame();
  }, [selectedDeckIdx, matchPairCount, activeGame]);

  useEffect(() => {
    if (activeGame !== "match" || matchFinished || matchTimer <= 0) return;
    const t = setInterval(() => {
      setMatchTimer((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setMatchFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [activeGame, matchFinished, matchTimer]);

  const handleCardClick = (card) => {
    if (selectedCards.length === 2 || matchedPairs.includes(card.pairId)) return;
    if (selectedCards.some((c) => c.id === card.id)) return;

    if (card.type === "en") playGoogleSpeech(card.text, 1.0);

    const nextSelected = [...selectedCards, card];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      const [first, second] = nextSelected;
      if (first.pairId === second.pairId) {
        sounds.playCorrect();
        setMatchedPairs((prev) => [...prev, first.pairId]);
        setMatchScore((prev) => prev + 15);
        setSelectedCards([]);

        if (matchedPairs.length + 1 >= matchPairCount) {
          sounds.playLessonSuccess();
          setMatchFinished(true);
          awardDiamonds(30, "Hoàn thành xuất sắc Trò chơi Nối Thẻ Từ Vựng");
        }
      } else {
        sounds.playWrong();
        setTimeout(() => setSelectedCards([]), 400);
      }
    }
  };

  // ==========================================
  // GAME 2: SPEED REFLEX QUIZ STATE
  // ==========================================
  const [speedQuestions, setSpeedQuestions] = useState([]);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedStreak, setSpeedStreak] = useState(0);
  const [speedTimer, setSpeedTimer] = useState(6);
  const [speedFinished, setSpeedFinished] = useState(false);
  const [selectedSpeedOpt, setSelectedSpeedOpt] = useState(null);

  const startSpeedQuiz = () => {
    const shuffled = [...deckWords].sort(() => Math.random() - 0.5).slice(0, 10);
    const questions = shuffled.map((correctWord) => {
      const wrongPool = deckWords.filter((w) => w.word !== correctWord.word).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [
        { text: correctWord.meaning, isCorrect: true },
        ...wrongPool.map((w) => ({ text: w.meaning, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);
      return { word: correctWord, options };
    });

    setSpeedQuestions(questions);
    setSpeedIdx(0);
    setSpeedScore(0);
    setSpeedStreak(0);
    setSpeedTimer(6);
    setSelectedSpeedOpt(null);
    setSpeedFinished(false);
  };

  useEffect(() => {
    if (activeGame === "speed") startSpeedQuiz();
  }, [selectedDeckIdx, activeGame]);

  // Speed timer countdown
  useEffect(() => {
    if (activeGame !== "speed" || speedFinished || selectedSpeedOpt !== null) return;
    const t = setInterval(() => {
      setSpeedTimer((prev) => {
        if (prev <= 1) {
          // Time's up! Move to next question
          sounds.playWrong();
          setSpeedStreak(0);
          handleNextSpeedQuestion();
          return 6;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [activeGame, speedIdx, speedFinished, selectedSpeedOpt]);

  const handleSelectSpeedOption = (opt) => {
    if (selectedSpeedOpt !== null) return;
    setSelectedSpeedOpt(opt);

    if (opt.isCorrect) {
      sounds.playCorrect();
      setSpeedScore((s) => s + 10 + speedStreak * 2);
      setSpeedStreak((s) => s + 1);
    } else {
      sounds.playWrong();
      setSpeedStreak(0);
    }

    setTimeout(() => {
      handleNextSpeedQuestion();
    }, 900);
  };

  const handleNextSpeedQuestion = () => {
    setSelectedSpeedOpt(null);
    setSpeedTimer(6);
    if (speedIdx + 1 < speedQuestions.length) {
      setSpeedIdx((i) => i + 1);
    } else {
      setSpeedFinished(true);
      sounds.playLessonSuccess();
      awardDiamonds(25, "Hoàn thành Bắn Từ Phản Xạ");
    }
  };

  // ==========================================
  // GAME 3: TYPING SPRINT (CHÍNH TẢ TỐC ĐỘ)
  // ==========================================
  const [typingWords, setTypingWords] = useState([]);
  const [typingIdx, setTypingIdx] = useState(0);
  const [typingInput, setTypingInput] = useState("");
  const [typingScore, setTypingScore] = useState(0);
  const [typingFinished, setTypingFinished] = useState(false);

  const startTypingSprint = () => {
    const shuffled = [...deckWords].sort(() => Math.random() - 0.5).slice(0, 10);
    setTypingWords(shuffled);
    setTypingIdx(0);
    setTypingInput("");
    setTypingScore(0);
    setTypingFinished(false);
    if (shuffled[0]) playGoogleSpeech(shuffled[0].word, 1.0);
  };

  useEffect(() => {
    if (activeGame === "typing") startTypingSprint();
  }, [selectedDeckIdx, activeGame]);

  const handleTypingSubmit = (e) => {
    e.preventDefault();
    const current = typingWords[typingIdx];
    if (!current) return;

    if (typingInput.trim().toLowerCase() === current.word.toLowerCase()) {
      sounds.playCorrect();
      setTypingScore((s) => s + 1);
    } else {
      sounds.playWrong();
    }

    setTypingInput("");
    if (typingIdx + 1 < typingWords.length) {
      setTypingIdx((i) => i + 1);
      playGoogleSpeech(typingWords[typingIdx + 1].word, 1.0);
    } else {
      setTypingFinished(true);
      sounds.playLessonSuccess();
      awardDiamonds(30, "Hoàn thành Đua Gõ Chính Tả Siêu Tốc");
    }
  };

  // ==========================================
  // GAME 4: WORD SCRAMBLE (ĐẢO CHỮ)
  // ==========================================
  const [scrambleWords, setScrambleWords] = useState([]);
  const [scrambleIdx, setScrambleIdx] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [builtWord, setBuiltWord] = useState([]);
  const [scrambleScore, setScrambleScore] = useState(0);
  const [scrambleFinished, setScrambleFinished] = useState(false);

  const startScramble = () => {
    const shuffled = [...deckWords]
      .filter((w) => w.word.length >= 4 && w.word.length <= 9 && !w.word.includes(" "))
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    setScrambleWords(shuffled);
    setScrambleIdx(0);
    setScrambleScore(0);
    setScrambleFinished(false);
    if (shuffled[0]) initScrambleWord(shuffled[0]);
  };

  const initScrambleWord = (w) => {
    const chars = w.word.toUpperCase().split("");
    let mixed = [...chars].sort(() => Math.random() - 0.5);
    while (mixed.join("") === chars.join("") && chars.length > 2) {
      mixed = [...chars].sort(() => Math.random() - 0.5);
    }
    setScrambledLetters(mixed.map((c, i) => ({ id: i, char: c, used: false })));
    setBuiltWord([]);
  };

  useEffect(() => {
    if (activeGame === "scramble") startScramble();
  }, [selectedDeckIdx, activeGame]);

  const handlePickLetter = (item) => {
    if (item.used) return;
    setBuiltWord((prev) => [...prev, item]);
    setScrambledLetters((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, used: true } : c))
    );

    // Check if word complete
    const currentW = scrambleWords[scrambleIdx];
    if (builtWord.length + 1 === currentW.word.length) {
      const finalStr = [...builtWord, item].map((x) => x.char).join("");
      if (finalStr.toUpperCase() === currentW.word.toUpperCase()) {
        sounds.playCorrect();
        setScrambleScore((s) => s + 1);
        setTimeout(() => {
          if (scrambleIdx + 1 < scrambleWords.length) {
            setScrambleIdx((i) => i + 1);
            initScrambleWord(scrambleWords[scrambleIdx + 1]);
          } else {
            setScrambleFinished(true);
            sounds.playLessonSuccess();
            awardDiamonds(25, "Hoàn thành Đảo Chữ Kỳ Diệu");
          }
        }, 600);
      } else {
        sounds.playWrong();
        setTimeout(() => {
          setBuiltWord([]);
          setScrambledLetters((prev) => prev.map((c) => ({ ...c, used: false })));
        }, 800);
      }
    }
  };

  const handleResetScrambleWord = () => {
    setBuiltWord([]);
    setScrambledLetters((prev) => prev.map((c) => ({ ...c, used: false })));
  };

  // Award diamonds in SQLite Database
  const awardDiamonds = (amt, reason) => {
    if (!currentUser?.id) return;
    fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: currentUser.id,
        diamonds: (currentUser.diamonds || 100) + amt
      })
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setDiamonds(data.user.diamonds);
          refreshUser();
        }
      })
      .catch(() => {});
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "980px", margin: "0 auto", width: "100%" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #101e3d 0%, #0d1629 100%)",
          border: "2px solid #1e3154",
          borderRadius: "20px",
          padding: "22px 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              backgroundColor: "rgba(168, 85, 247, 0.2)",
              border: "2px solid #a855f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Gamepad2 size={30} color="#c084fc" />
          </div>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#f8fafc", marginBottom: "2px" }}>
              Đấu Trường Trò Chơi Từ Vựng Sorata
            </h2>
            <p style={{ fontSize: "13px", color: "#94a3b8" }}>
              Vừa giải trí vừa khắc sâu từ vựng, phản xạ tức thì và nhận kim cương 💎 thưởng
            </p>
          </div>
        </div>

        {/* Deck Selector Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700 }}>Bộ từ vựng:</span>
          <select
            value={selectedDeckIdx}
            onChange={(e) => setSelectedDeckIdx(Number(e.target.value))}
            style={{
              backgroundColor: "#13213c",
              border: "1px solid #1e3154",
              borderRadius: "10px",
              padding: "8px 12px",
              color: "#f8fafc",
              fontSize: "13px",
              fontWeight: 700,
              outline: "none",
              cursor: "pointer",
              maxWidth: "240px"
            }}
          >
            {vocabularyDecksData.map((d, i) => (
              <option key={d.slug} value={i}>
                {d.name} ({d.words?.length || 0} từ)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Games Tabs Switcher */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          padding: "6px",
          borderRadius: "14px",
          overflowX: "auto"
        }}
      >
        <button
          onClick={() => setActiveGame("match")}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeGame === "match" ? "#a855f7" : "transparent",
            color: activeGame === "match" ? "#fff" : "var(--muted-foreground)",
            fontWeight: 800,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            whiteSpace: "nowrap"
          }}
        >
          <Layers size={16} /> 🃏 Nối Thẻ 3D
        </button>

        <button
          onClick={() => setActiveGame("speed")}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeGame === "speed" ? "#2563eb" : "transparent",
            color: activeGame === "speed" ? "#fff" : "var(--muted-foreground)",
            fontWeight: 800,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            whiteSpace: "nowrap"
          }}
        >
          <Zap size={16} /> ⚡ Bắn Từ Phản Xạ
        </button>

        <button
          onClick={() => setActiveGame("typing")}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeGame === "typing" ? "#ea580c" : "transparent",
            color: activeGame === "typing" ? "#fff" : "var(--muted-foreground)",
            fontWeight: 800,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            whiteSpace: "nowrap"
          }}
        >
          <Keyboard size={16} /> 🏁 Đua Gõ Chính Tả
        </button>

        <button
          onClick={() => setActiveGame("scramble")}
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: activeGame === "scramble" ? "#16a34a" : "transparent",
            color: activeGame === "scramble" ? "#fff" : "var(--muted-foreground)",
            fontWeight: 800,
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            whiteSpace: "nowrap"
          }}
        >
          <Shuffle size={16} /> 🧩 Đảo Chữ Kỳ Diệu
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. WORD MATCH 3D GAME                                    */}
      {/* ========================================================= */}
      {activeGame === "match" && (
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "20px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: 800, color: matchTimer < 10 ? "#ef4444" : "var(--foreground)" }}>
                <Timer size={18} />
                <span>Thời gian: {matchTimer}s</span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--primary)" }}>
                Điểm: {matchScore}
              </span>
            </div>

            {/* Pair Count Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 700 }}>Độ khó:</span>
              {[6, 8, 10].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setMatchPairCount(cnt)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 800,
                    border: matchPairCount === cnt ? "2px solid #a855f7" : "1px solid var(--border)",
                    backgroundColor: matchPairCount === cnt ? "rgba(168, 85, 247, 0.2)" : "var(--secondary)",
                    color: matchPairCount === cnt ? "#c084fc" : "var(--muted-foreground)",
                    cursor: "pointer"
                  }}
                >
                  {cnt} cặp ({cnt * 2} thẻ)
                </button>
              ))}
              <button
                onClick={startMatchGame}
                className="btn-ghost"
                style={{ padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, marginLeft: "6px" }}
              >
                <RotateCcw size={14} /> Chơi Lại
              </button>
            </div>
          </div>

          {!matchFinished ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              {matchCards.map((card) => {
                const isSelected = selectedCards.some((c) => c.id === card.id);
                const isMatched = matchedPairs.includes(card.pairId);

                let bg = "var(--secondary)";
                let border = "2px solid var(--border)";
                let textColor = "var(--foreground)";

                if (isSelected) {
                  bg = "rgba(168, 85, 247, 0.25)";
                  border = "2px solid #a855f7";
                  textColor = "#c084fc";
                } else if (isMatched) {
                  bg = "rgba(34, 197, 94, 0.15)";
                  border = "2px solid #22c55e";
                  textColor = "#4ade80";
                }

                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    disabled={isMatched}
                    style={{
                      minHeight: "100px",
                      borderRadius: "14px",
                      backgroundColor: bg,
                      border: border,
                      color: textColor,
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isMatched ? "default" : "pointer",
                      transition: "all 0.15s ease",
                      opacity: isMatched ? 0.6 : 1,
                      transform: isSelected ? "scale(1.02)" : "none"
                    }}
                  >
                    <span style={{ fontSize: card.type === "en" ? "17px" : "14px", fontWeight: 800, textAlign: "center", lineHeight: 1.3 }}>
                      {card.text}
                    </span>
                    {card.ipa && (
                      <span style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "4px" }}>
                        {card.ipa}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px 20px" }}>
              <Trophy size={60} color="#eab308" style={{ margin: "0 auto 14px auto" }} />
              <h3 style={{ fontSize: "22px", fontWeight: 900, color: "var(--foreground)", marginBottom: "6px" }}>
                {matchedPairs.length >= matchPairCount ? "Tuyệt Vời! Bạn Đã Ghép Đúng Tất Cả Thẻ!" : "Hết Giờ Rồi!"}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--muted-foreground)", marginBottom: "16px" }}>
                Điểm số đạt được: <strong style={{ color: "var(--success)" }}>{matchScore} điểm</strong> ({matchedPairs.length}/{matchPairCount} cặp thẻ)
              </p>
              {matchedPairs.length >= matchPairCount && (
                <div style={{ display: "inline-block", backgroundColor: "rgba(234, 179, 8, 0.15)", border: "1px solid #eab308", padding: "8px 20px", borderRadius: "10px", marginBottom: "18px", color: "#facc15", fontWeight: 800 }}>
                  🎉 Phần thưởng đã lưu vào SQLite: +30 💎 Kim Cương
                </div>
              )}
              <div>
                <button onClick={startMatchGame} className="btn-duo btn-primary" style={{ padding: "10px 24px" }}>
                  <RotateCcw size={15} style={{ marginRight: "6px" }} /> Chơi Lượt Mới
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SPEED REFLEX QUIZ                                      */}
      {/* ========================================================= */}
      {activeGame === "speed" && (
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "20px",
            padding: "26px",
            textAlign: "center"
          }}
        >
          {!speedFinished ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "18px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--primary)" }}>
                  Câu {speedIdx + 1} / {speedQuestions.length}
                </span>
                {speedStreak > 1 && (
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#ea580c", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Flame size={15} /> Chuỗi: {speedStreak}🔥
                  </span>
                )}
                <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                  Điểm: <strong style={{ color: "var(--success)" }}>{speedScore}</strong>
                </span>
              </div>

              {/* 5s Countdown Bar */}
              <div style={{ width: "100%", height: "6px", backgroundColor: "var(--secondary)", borderRadius: "9999px", overflow: "hidden", marginBottom: "20px" }}>
                <div
                  style={{
                    width: `${(speedTimer / 6) * 100}%`,
                    height: "100%",
                    backgroundColor: speedTimer < 3 ? "#ef4444" : "#2563eb",
                    transition: "width 0.9s linear"
                  }}
                />
              </div>

              <span style={{ fontSize: "12px", color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 700 }}>
                Chọn nghĩa tiếng Việt chính xác (Còn {speedTimer}s):
              </span>
              <h3 style={{ fontSize: "36px", fontWeight: 900, color: "var(--foreground)", margin: "10px 0 6px 0" }}>
                {speedQuestions[speedIdx]?.word?.word}
              </h3>
              <p style={{ fontSize: "14px", color: "var(--muted-foreground)", marginBottom: "24px" }}>
                {speedQuestions[speedIdx]?.word?.ipa}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxWidth: "600px", margin: "0 auto" }}>
                {speedQuestions[speedIdx]?.options?.map((opt, oIdx) => {
                  let bg = "var(--secondary)";
                  let border = "1px solid var(--border)";
                  let color = "var(--foreground)";

                  if (selectedSpeedOpt !== null) {
                    if (opt.isCorrect) {
                      bg = "rgba(34, 197, 94, 0.2)";
                      border = "2px solid #22c55e";
                      color = "#4ade80";
                    } else if (selectedSpeedOpt === opt && !opt.isCorrect) {
                      bg = "rgba(239, 68, 68, 0.2)";
                      border = "2px solid #ef4444";
                      color = "#f87171";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectSpeedOption(opt)}
                      disabled={selectedSpeedOpt !== null}
                      style={{
                        padding: "14px 18px",
                        borderRadius: "12px",
                        backgroundColor: bg,
                        border: border,
                        color: color,
                        fontSize: "14px",
                        fontWeight: 700,
                        cursor: selectedSpeedOpt !== null ? "default" : "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ padding: "20px" }}>
              <Trophy size={60} color="#eab308" style={{ margin: "0 auto 14px auto" }} />
              <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--foreground)", marginBottom: "6px" }}>
                Hoàn Thành Bắn Từ Phản Xạ!
              </h3>
              <p style={{ fontSize: "15px", color: "var(--muted-foreground)", marginBottom: "16px" }}>
                Tổng điểm: <strong style={{ color: "var(--success)" }}>{speedScore} điểm</strong>
              </p>
              <button onClick={startSpeedQuiz} className="btn-duo btn-primary" style={{ padding: "10px 24px" }}>
                <RotateCcw size={15} style={{ marginRight: "6px" }} /> Làm Lại Vòng Khác
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TYPING SPRINT                                          */}
      {/* ========================================================= */}
      {activeGame === "typing" && (
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "20px",
            padding: "30px 24px",
            textAlign: "center"
          }}
        >
          {!typingFinished ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "20px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--primary)" }}>
                  Từ {typingIdx + 1} / {typingWords.length}
                </span>
                <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                  Đúng: <strong style={{ color: "var(--success)" }}>{typingScore}</strong> từ
                </span>
              </div>

              <p style={{ fontSize: "14px", color: "var(--muted-foreground)", marginBottom: "18px" }}>
                Lắng nghe phát âm và gõ chính xác các chữ cái của từ:
              </p>

              <button
                onClick={() => playGoogleSpeech(typingWords[typingIdx]?.word, 1.0)}
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(234, 88, 12, 0.2)",
                  border: "2px solid #ea580c",
                  color: "#ea580c",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginBottom: "20px"
                }}
              >
                <Volume2 size={32} />
              </button>

              <p style={{ fontSize: "16px", fontWeight: 800, color: "var(--foreground)", marginBottom: "20px" }}>
                Gợi ý nghĩa: <span style={{ color: "#38bdf8" }}>{typingWords[typingIdx]?.meaning}</span>
              </p>

              <form onSubmit={handleTypingSubmit} style={{ display: "flex", justifyContent: "center", gap: "10px", maxWidth: "420px", margin: "0 auto" }}>
                <input
                  type="text"
                  value={typingInput}
                  onChange={(e) => setTypingInput(e.target.value)}
                  placeholder="Gõ từ tiếng Anh..."
                  autoFocus
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    borderRadius: "12px",
                    backgroundColor: "var(--secondary)",
                    border: "2px solid var(--border)",
                    color: "var(--foreground)",
                    fontSize: "16px",
                    fontWeight: 700,
                    textAlign: "center",
                    outline: "none"
                  }}
                />
                <button type="submit" className="btn-duo btn-primary" style={{ padding: "12px 20px" }}>
                  Gửi →
                </button>
              </form>
            </div>
          ) : (
            <div>
              <Trophy size={60} color="#eab308" style={{ margin: "0 auto 14px auto" }} />
              <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--foreground)", marginBottom: "6px" }}>
                Hoàn Thành Đua Gõ Chính Tả!
              </h3>
              <p style={{ fontSize: "15px", color: "var(--muted-foreground)", marginBottom: "16px" }}>
                Bạn đã gõ đúng: <strong style={{ color: "var(--success)" }}>{typingScore} / {typingWords.length}</strong> từ
              </p>
              <button onClick={startTypingSprint} className="btn-duo btn-primary" style={{ padding: "10px 24px" }}>
                <RotateCcw size={15} style={{ marginRight: "6px" }} /> Thử Lại Lượt Khác
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. WORD SCRAMBLE (ĐẢO CHỮ)                                */}
      {/* ========================================================= */}
      {activeGame === "scramble" && (
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "20px",
            padding: "30px 24px",
            textAlign: "center"
          }}
        >
          {!scrambleFinished ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "20px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--primary)" }}>
                  Từ {scrambleIdx + 1} / {scrambleWords.length}
                </span>
                <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                  Đúng: <strong style={{ color: "var(--success)" }}>{scrambleScore}</strong> từ
                </span>
              </div>

              <p style={{ fontSize: "15px", color: "var(--muted-foreground)", marginBottom: "16px" }}>
                Nghĩa tiếng Việt: <strong style={{ color: "#38bdf8" }}>{scrambleWords[scrambleIdx]?.meaning}</strong>
              </p>

              {/* Built Word Tiles Display */}
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", minHeight: "56px", marginBottom: "24px" }}>
                {scrambleWords[scrambleIdx]?.word?.split("").map((_, i) => {
                  const letterItem = builtWord[i];
                  return (
                    <div
                      key={i}
                      style={{
                        width: "48px",
                        height: "52px",
                        borderRadius: "12px",
                        backgroundColor: letterItem ? "rgba(34, 197, 94, 0.2)" : "var(--secondary)",
                        border: letterItem ? "2px solid #22c55e" : "2px dashed var(--border)",
                        color: letterItem ? "#4ade80" : "transparent",
                        fontSize: "22px",
                        fontWeight: 900,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {letterItem?.char || ""}
                    </div>
                  );
                })}
              </div>

              {/* Scrambled Clickable Letter Tiles */}
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
                {scrambledLetters.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handlePickLetter(item)}
                    disabled={item.used}
                    style={{
                      width: "50px",
                      height: "54px",
                      borderRadius: "12px",
                      backgroundColor: item.used ? "var(--muted)" : "rgba(56, 189, 248, 0.2)",
                      border: item.used ? "1px solid var(--border)" : "2px solid #38bdf8",
                      color: item.used ? "var(--muted-foreground)" : "#38bdf8",
                      fontSize: "20px",
                      fontWeight: 900,
                      cursor: item.used ? "default" : "pointer",
                      opacity: item.used ? 0.3 : 1,
                      transition: "transform 0.1s ease"
                    }}
                    className="hover:scale-105"
                  >
                    {item.char}
                  </button>
                ))}
              </div>

              <div>
                <button
                  onClick={handleResetScrambleWord}
                  className="btn-ghost"
                  style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 700 }}
                >
                  <RotateCcw size={14} style={{ marginRight: "4px" }} /> Xóa & Chọn Lại
                </button>
              </div>
            </div>
          ) : (
            <div>
              <Trophy size={60} color="#eab308" style={{ margin: "0 auto 14px auto" }} />
              <h3 style={{ fontSize: "22px", fontWeight: 800, color: "var(--foreground)", marginBottom: "6px" }}>
                Hoàn Thành Trò Chơi Đảo Chữ!
              </h3>
              <p style={{ fontSize: "15px", color: "var(--muted-foreground)", marginBottom: "16px" }}>
                Đúng: <strong style={{ color: "var(--success)" }}>{scrambleScore} / {scrambleWords.length}</strong> từ
              </p>
              <button onClick={startScramble} className="btn-duo btn-primary" style={{ padding: "10px 24px" }}>
                <RotateCcw size={15} style={{ marginRight: "6px" }} /> Chơi Vòng Mới
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
