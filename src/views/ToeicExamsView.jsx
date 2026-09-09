import React, { useState, useEffect, useRef } from "react";
import {
  ClipboardList,
  Play,
  CheckCircle2,
  Clock,
  Award,
  Lock,
  Crown,
  ChevronRight,
  FileText,
  Bookmark,
  Pause,
  RotateCcw,
  AlertTriangle,
  HelpCircle,
  Volume2
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { toeicExamsData } from "../data/toeicExamsData";
import { sounds } from "../utils/audioEffects";
import { playGoogleSpeech } from "../utils/pronunciationAudio";

export default function ToeicExamsView() {
  const { isPro, setIsPremiumModalOpen, currentUser } = useApp();
  const [selectedSetIdx, setSelectedSetIdx] = useState(0);
  const [activeTest, setActiveTest] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [resultScore, setResultScore] = useState(null);
  const [filterPart, setFilterPart] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all"); // 'all' or 'wrong'

  // Exam Timer state
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef(null);

  const currentSet = toeicExamsData[selectedSetIdx] || toeicExamsData[0];

  useEffect(() => {
    if (activeTest && !resultScore) {
      setTimeLeft(45 * 60);
      setIsTimerRunning(true);
    }
  }, [activeTest, resultScore]);

  useEffect(() => {
    if (!activeTest || resultScore || !isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTest, resultScore, isTimerRunning]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const playQuestionAudio = (txt) => {
    playGoogleSpeech(txt, 0.95);
  };

  const handleSelectOption = (qId, option) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: option
    }));
  };

  const toggleFlagQuestion = (qId) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const scrollToQuestion = (qId) => {
    const el = document.getElementById(`toeic-q-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const submitTest = () => {
    if (!activeTest?.sampleQuestions) return;
    let correctCount = 0;
    activeTest.sampleQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correct) correctCount++;
    });

    const scaledScore = Math.round((correctCount / activeTest.sampleQuestions.length) * 495);
    const timeSpent = 45 * 60 - timeLeft;

    setResultScore({
      correct: correctCount,
      total: activeTest.sampleQuestions.length,
      scaled: scaledScore,
      timeSpent
    });
    sounds.playLessonSuccess();

    // Persist result to SQLite Database
    fetch("/api/exams/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: currentUser?.id || 1,
        exam_type: "toeic",
        exam_id: activeTest.id,
        exam_title: activeTest.title,
        score: correctCount,
        total_questions: activeTest.sampleQuestions.length,
        band_score: `${scaledScore}/495 Listening`,
        time_spent_seconds: timeSpent,
        answers_json: userAnswers
      })
    }).catch(() => {});
  };

  // Questions filtered by part
  const questionsList = activeTest?.sampleQuestions || [];
  const displayedQuestions = questionsList.filter((q) => {
    if (filterPart === "all") return true;
    return q.part.toLowerCase().includes(filterPart.toLowerCase());
  });

  const answeredCount = Object.keys(userAnswers).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1180px", margin: "0 auto", width: "100%", paddingBottom: "40px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--foreground)" }}>
            Luyện Thi TOEIC Online — Đề Thi Thử Chuẩn ETS
          </h2>
          <span style={{ fontSize: "12px", fontWeight: 800, backgroundColor: "#d97706", color: "#fff", padding: "2px 8px", borderRadius: "6px" }}>
            4 BỘ ĐỀ • 16 ĐỀ THI ĐẦY ĐỦ
          </span>
        </div>
        <p style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
          Hệ thống mô phỏng phòng thi chuẩn ETS với 35 câu Listening đầy đủ Part 1 đến Part 5, đếm ngược thời gian và bảng điểm quy đổi chuẩn.
        </p>
      </div>

      {activeTest ? (
        /* Test Taking Simulator */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Top Exam Status Bar (Sticky) */}
          <div
            style={{
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "16px",
              padding: "16px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "14px",
              position: "sticky",
              top: "70px",
              zIndex: 30,
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
            }}
          >
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--foreground)", marginBottom: "2px" }}>
                {activeTest.title}
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: "var(--muted-foreground)" }}>
                <span>Đã làm: <strong style={{ color: "var(--primary)" }}>{answeredCount}</strong>/{questionsList.length} câu</span>
                {flaggedCount > 0 && (
                  <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Bookmark size={13} /> Đánh dấu: {flaggedCount}
                  </span>
                )}
              </div>
            </div>

            {/* Timer & Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {!resultScore && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: timeLeft < 300 ? "rgba(239, 68, 68, 0.2)" : "var(--muted)",
                    color: timeLeft < 300 ? "#ef4444" : "var(--foreground)",
                    border: `1px solid ${timeLeft < 300 ? "#ef4444" : "var(--border)"}`,
                    padding: "8px 16px",
                    borderRadius: "12px",
                    fontWeight: 800,
                    fontSize: "16px"
                  }}
                >
                  <Clock size={18} />
                  <span>{formatTime(timeLeft)}</span>
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", marginLeft: "4px" }}
                    title={isTimerRunning ? "Tạm dừng" : "Tiếp tục"}
                  >
                    {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                </div>
              )}

              {!resultScore ? (
                <button
                  onClick={submitTest}
                  className="btn-duo btn-success"
                  style={{ padding: "10px 22px", fontSize: "14px", fontWeight: 800 }}
                >
                  Nộp Bài Thi
                </button>
              ) : (
                <button
                  onClick={() => {
                    setResultScore(null);
                    setUserAnswers({});
                    setFlaggedQuestions({});
                    setTimeLeft(45 * 60);
                  }}
                  className="btn-duo btn-primary"
                  style={{ padding: "10px 20px", fontSize: "14px" }}
                >
                  <RotateCcw size={15} style={{ marginRight: "6px" }} /> Làm Lại Đề
                </button>
              )}

              <button
                onClick={() => {
                  setActiveTest(null);
                  setResultScore(null);
                  setUserAnswers({});
                  setFlaggedQuestions({});
                }}
                className="btn-ghost"
                style={{ fontSize: "13px", fontWeight: 700 }}
              >
                ← Danh sách đề
              </button>
            </div>
          </div>

          {resultScore ? (
            /* Result Summary & In-Depth Review */
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Score Card */}
              <div
                style={{
                  backgroundColor: "var(--card)",
                  border: "2px solid var(--border)",
                  borderRadius: "20px",
                  padding: "32px 24px",
                  textAlign: "center"
                }}
              >
                <Award size={64} color="#f59e0b" style={{ margin: "0 auto 16px auto" }} />
                <h3 style={{ fontSize: "24px", fontWeight: 900, color: "var(--foreground)", marginBottom: "8px" }}>
                  Kết Quả Bài Thi TOEIC Listening
                </h3>
                <p style={{ fontSize: "15px", color: "var(--muted-foreground)", marginBottom: "20px" }}>
                  Thời gian làm bài: {Math.floor(resultScore.timeSpent / 60)} phút {resultScore.timeSpent % 60} giây
                </p>

                <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap", marginBottom: "24px" }}>
                  <div style={{ backgroundColor: "var(--muted)", padding: "16px 28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 700 }}>Số câu đúng</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--success)" }}>
                      {resultScore.correct} / {resultScore.total}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", border: "2px solid #f59e0b", padding: "16px 36px", borderRadius: "16px" }}>
                    <div style={{ fontSize: "13px", color: "#f59e0b", fontWeight: 700 }}>Điểm Listening ETS Quy Đổi</div>
                    <div style={{ fontSize: "36px", fontWeight: 900, color: "#f59e0b" }}>
                      {resultScore.scaled} / 495
                    </div>
                  </div>

                  <div style={{ backgroundColor: "var(--muted)", padding: "16px 28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 700 }}>Tỷ lệ chính xác</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--primary)" }}>
                      {Math.round((resultScore.correct / resultScore.total) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Filter Review Questions */}
                <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "16px" }}>
                  <button
                    onClick={() => setReviewFilter("all")}
                    className={reviewFilter === "all" ? "btn-duo btn-primary" : "btn-ghost"}
                    style={{ padding: "8px 18px", fontSize: "13px" }}
                  >
                    Xem Tất Cả ({resultScore.total} câu)
                  </button>
                  <button
                    onClick={() => setReviewFilter("wrong")}
                    className={reviewFilter === "wrong" ? "btn-duo btn-primary" : "btn-ghost"}
                    style={{ padding: "8px 18px", fontSize: "13px", color: reviewFilter === "wrong" ? "#fff" : "#ef4444" }}
                  >
                    Chỉ Xem Câu Sai ({resultScore.total - resultScore.correct} câu)
                  </button>
                </div>
              </div>

              {/* Question Review Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {questionsList
                  .filter((q) => {
                    if (reviewFilter === "wrong") {
                      return userAnswers[q.id] !== q.correct;
                    }
                    return true;
                  })
                  .map((q) => {
                    const isCorrect = userAnswers[q.id] === q.correct;
                    const isAnswered = Boolean(userAnswers[q.id]);
                    return (
                      <div
                        key={q.id}
                        style={{
                          backgroundColor: "var(--card)",
                          border: `2px solid ${isCorrect ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                          borderRadius: "16px",
                          padding: "20px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 800,
                                backgroundColor: isCorrect ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                                color: isCorrect ? "#4ade80" : "#f87171",
                                padding: "4px 10px",
                                borderRadius: "6px"
                              }}
                            >
                              Câu {q.id} • {q.part} ({isCorrect ? "Đúng ✓" : isAnswered ? "Sai ✗" : "Chưa trả lời"})
                            </span>
                            <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                              Bạn chọn: <strong>{userAnswers[q.id] || "Chưa chọn"}</strong> | Đáp án đúng: <strong style={{ color: "var(--success)" }}>{q.correct}</strong>
                            </span>
                          </div>
                          <button
                            onClick={() => playQuestionAudio(q.audioText || q.prompt)}
                            className="btn-duo btn-outline"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                          >
                            <Volume2 size={14} style={{ marginRight: "4px" }} /> Nghe Lại Audio
                          </button>
                        </div>

                        <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", marginBottom: "12px" }}>
                          {q.prompt}
                        </p>

                        {/* Audio script transcript */}
                        {q.audioText && (
                          <div style={{ backgroundColor: "var(--muted)", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "12px", fontStyle: "italic" }}>
                            <strong>Transcript:</strong> "{q.audioText}"
                          </div>
                        )}

                        {/* Options display */}
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                          {q.options.map((opt) => {
                            const isUserChoice = userAnswers[q.id] === opt;
                            const isCorrectChoice = q.correct === opt;
                            return (
                              <div
                                key={opt}
                                style={{
                                  padding: "8px 18px",
                                  borderRadius: "10px",
                                  fontWeight: 800,
                                  fontSize: "13px",
                                  border: isCorrectChoice
                                    ? "2px solid #22c55e"
                                    : isUserChoice
                                    ? "2px solid #ef4444"
                                    : "1px solid var(--border)",
                                  backgroundColor: isCorrectChoice
                                    ? "rgba(34, 197, 94, 0.15)"
                                    : isUserChoice
                                    ? "rgba(239, 68, 68, 0.15)"
                                    : "var(--card)",
                                  color: isCorrectChoice
                                    ? "#4ade80"
                                    : isUserChoice
                                    ? "#f87171"
                                    : "var(--muted-foreground)"
                                }}
                              >
                                ({opt}) {isCorrectChoice && "✓"} {isUserChoice && !isCorrectChoice && "✗"}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div style={{ backgroundColor: "rgba(56, 189, 248, 0.1)", borderLeft: "3px solid #38bdf8", padding: "10px 14px", borderRadius: "0 8px 8px 0", fontSize: "13px", color: "var(--foreground)" }}>
                            <strong>Giải thích:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            /* Live Exam Question Layout with Palette */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "24px", alignItems: "start" }}>
              {/* Left Column: Filter Tabs & Questions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Part Filter Bar */}
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                  {[
                    { id: "all", label: `Tất cả (${questionsList.length})` },
                    { id: "Part 1", label: "Part 1: Tranh (1-6)" },
                    { id: "Part 2", label: "Part 2: Hỏi-Đáp (7-14)" },
                    { id: "Part 3", label: "Part 3: Hội thoại (15-23)" },
                    { id: "Part 4", label: "Part 4: Bài nói (24-29)" },
                    { id: "Part 5", label: "Part 5: Điền câu (30-35)" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFilterPart(p.id)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        border: filterPart === p.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                        backgroundColor: filterPart === p.id ? "var(--accent)" : "var(--card)",
                        color: filterPart === p.id ? "var(--primary)" : "var(--muted-foreground)",
                        cursor: "pointer"
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Questions List */}
                {displayedQuestions.map((q) => {
                  const isAnswered = Boolean(userAnswers[q.id]);
                  const isFlagged = Boolean(flaggedQuestions[q.id]);
                  return (
                    <div
                      key={q.id}
                      id={`toeic-q-${q.id}`}
                      style={{
                        backgroundColor: "var(--card)",
                        borderRadius: "16px",
                        padding: "20px",
                        border: isFlagged
                          ? "2px solid #f59e0b"
                          : isAnswered
                          ? "2px solid var(--primary)"
                          : "1px solid var(--border)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 800,
                              backgroundColor: "var(--accent)",
                              color: "var(--primary)",
                              padding: "4px 10px",
                              borderRadius: "8px"
                            }}
                          >
                            Câu {q.id}: {q.part}
                          </span>
                          {isFlagged && (
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#f59e0b", display: "flex", alignItems: "center", gap: "2px" }}>
                              <Bookmark size={12} /> Đã đánh dấu
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <button
                            onClick={() => toggleFlagQuestion(q.id)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "8px",
                              border: "1px solid var(--border)",
                              backgroundColor: isFlagged ? "rgba(245, 158, 11, 0.2)" : "transparent",
                              color: isFlagged ? "#f59e0b" : "var(--muted-foreground)",
                              cursor: "pointer",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                            title="Đánh dấu xem lại sau"
                          >
                            <Bookmark size={13} fill={isFlagged ? "#f59e0b" : "none"} /> Đánh dấu
                          </button>

                          <button
                            onClick={() => playQuestionAudio(q.audioText || q.prompt)}
                            className="btn-duo btn-outline"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                          >
                            <Play size={13} style={{ marginRight: "4px" }} /> Nghe Audio
                          </button>
                        </div>
                      </div>

                      <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", marginBottom: "16px", lineHeight: 1.5 }}>
                        {q.prompt}
                      </p>

                      {/* Options */}
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {q.options.map((opt) => {
                          const isSelected = userAnswers[q.id] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => handleSelectOption(q.id, opt)}
                              style={{
                                padding: "10px 24px",
                                borderRadius: "12px",
                                border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                                backgroundColor: isSelected ? "var(--primary)" : "var(--muted)",
                                color: isSelected ? "#fff" : "var(--foreground)",
                                fontWeight: 800,
                                fontSize: "15px",
                                cursor: "pointer",
                                transition: "all 0.15s ease"
                              }}
                            >
                              ({opt})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Sticky Question Palette */}
              <div
                style={{
                  backgroundColor: "var(--card)",
                  border: "2px solid var(--border)",
                  borderRadius: "16px",
                  padding: "18px",
                  position: "sticky",
                  top: "160px"
                }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--foreground)", marginBottom: "12px" }}>
                  Bảng Điều Hướng Câu Hỏi
                </h4>

                {/* Status Legend */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", marginBottom: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--primary)" }} />
                    <span style={{ color: "var(--muted-foreground)" }}>Đã trả lời ({answeredCount})</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#f59e0b" }} />
                    <span style={{ color: "var(--muted-foreground)" }}>Đã đánh dấu ({flaggedCount})</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "var(--muted)", border: "1px solid var(--border)" }} />
                    <span style={{ color: "var(--muted-foreground)" }}>Chưa làm ({questionsList.length - answeredCount})</span>
                  </div>
                </div>

                {/* Grid of numbers */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px", maxHeight: "340px", overflowY: "auto", paddingRight: "4px" }}>
                  {questionsList.map((q) => {
                    const isAnswered = Boolean(userAnswers[q.id]);
                    const isFlagged = Boolean(flaggedQuestions[q.id]);
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setFilterPart("all");
                          setTimeout(() => scrollToQuestion(q.id), 50);
                        }}
                        style={{
                          height: "36px",
                          borderRadius: "8px",
                          fontWeight: 800,
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: isFlagged
                            ? "2px solid #f59e0b"
                            : isAnswered
                            ? "1px solid var(--primary)"
                            : "1px solid var(--border)",
                          backgroundColor: isFlagged
                            ? "rgba(245, 158, 11, 0.2)"
                            : isAnswered
                            ? "var(--primary)"
                            : "var(--muted)",
                          color: isFlagged
                            ? "#f59e0b"
                            : isAnswered
                            ? "#fff"
                            : "var(--muted-foreground)",
                          transition: "all 0.15s ease"
                        }}
                        title={`Câu ${q.id}: ${q.part}`}
                      >
                        {q.id}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: "16px" }}>
                  <button
                    onClick={submitTest}
                    className="btn-duo btn-success"
                    style={{ width: "100%", padding: "10px", fontSize: "14px", fontWeight: 800 }}
                  >
                    Nộp Bài ({answeredCount}/{questionsList.length})
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* TOEIC Sets & Exams Catalog */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Set Selector Tabs */}
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
            {toeicExamsData.map((set, sIdx) => {
              const isSelected = sIdx === selectedSetIdx;
              return (
                <button
                  key={set.slug}
                  onClick={() => setSelectedSetIdx(sIdx)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "12px",
                    border: isSelected ? "2px solid #f59e0b" : "1px solid var(--border)",
                    backgroundColor: isSelected ? "rgba(245, 158, 11, 0.15)" : "var(--card)",
                    color: isSelected ? "#f59e0b" : "var(--foreground)",
                    fontWeight: 800,
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  <ClipboardList size={16} />
                  {set.name}
                  <span style={{ fontSize: "11px", backgroundColor: "var(--muted)", padding: "2px 6px", borderRadius: "6px" }}>
                    {set.exams.length} Test
                  </span>
                </button>
              );
            })}
          </div>

          {/* Test Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {currentSet.exams.map((exam, idx) => {
              const isLocked = exam.isProOnly && !isPro;
              return (
                <div
                  key={exam.id}
                  style={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px",
                    position: "relative"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          backgroundColor: isLocked ? "rgba(239, 68, 68, 0.15)" : "rgba(34, 197, 94, 0.15)",
                          color: isLocked ? "#f87171" : "#4ade80",
                          padding: "2px 8px",
                          borderRadius: "6px"
                        }}
                      >
                        {isLocked ? "YÊU CẦU PRO" : "MIỄN PHÍ"}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} /> {exam.duration}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--foreground)", marginBottom: "6px" }}>
                      {exam.title}
                    </h4>

                    <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "12px" }}>
                      35 câu trắc nghiệm Listening (Part 1 - Part 5) chuẩn format ETS với giải thích chi tiết.
                    </p>

                    {/* Parts list chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {exam.parts?.map((p, pIdx) => (
                        <span
                          key={pIdx}
                          style={{
                            fontSize: "11px",
                            backgroundColor: "var(--muted)",
                            color: "var(--muted-foreground)",
                            padding: "3px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {p.name.split(":")[0]}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    {isLocked ? (
                      <button
                        onClick={() => setIsPremiumModalOpen(true)}
                        className="btn-duo btn-primary"
                        style={{ width: "100%", padding: "10px", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                      >
                        <Crown size={15} /> Mở Khóa Đề Với PRO
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTest(exam);
                          setUserAnswers({});
                          setFlaggedQuestions({});
                          setResultScore(null);
                        }}
                        className="btn-duo btn-success"
                        style={{ width: "100%", padding: "10px", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                      >
                        <Play size={15} /> Bắt Đầu Làm Bài
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
