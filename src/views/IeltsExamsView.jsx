import React, { useState, useEffect, useRef } from "react";
import {
  GraduationCap,
  Award,
  Play,
  Clock,
  Lock,
  ArrowRight,
  CheckCircle2,
  Bookmark,
  Pause,
  RotateCcw,
  Volume2,
  Crown,
  HelpCircle,
  FileCheck
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ieltsExamsData } from "../data/ieltsExamsData";
import { sounds } from "../utils/audioEffects";
import { playGoogleSpeech } from "../utils/pronunciationAudio";

export default function IeltsExamsView() {
  const { isPro, setIsPremiumModalOpen, currentUser } = useApp();
  const [selectedSetIdx, setSelectedSetIdx] = useState(0);
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [bandResult, setBandResult] = useState(null);
  const [filterSection, setFilterSection] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all"); // 'all' or 'wrong'
  const [playedAudio, setPlayedAudio] = useState({}); // track played audio

  // Exam Timer State
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const timerRef = useRef(null);

  const currentSet = ieltsExamsData[selectedSetIdx] || ieltsExamsData[0];

  useEffect(() => {
    if (activeTest && !bandResult) {
      setTimeLeft(30 * 60);
      setIsTimerRunning(true);
    }
  }, [activeTest, bandResult]);

  useEffect(() => {
    if (!activeTest || bandResult || !isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitIelts();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTest, bandResult, isTimerRunning]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const playAudio = (qId, txt) => {
    if (playedAudio[qId]) {
      alert("Trong chế độ thi thực tế, audio chỉ được phát DUY NHẤT 1 lần!");
      return;
    }
    setPlayedAudio(prev => ({...prev, [qId]: true}));
    playGoogleSpeech(txt, 0.92);
  };

  const handleInputChange = (qId, val) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: val
    }));
  };

  const handleSelectOption = (qId, opt) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: opt
    }));
  };

  const toggleFlagQuestion = (qId) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const scrollToQuestion = (qId) => {
    const el = document.getElementById(`ielts-q-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const calculateBand = (correct, total) => {
    const ratio = correct / total;
    if (ratio >= 0.88) return "8.5 - 9.0 (Expert)";
    if (ratio >= 0.76) return "7.5 - 8.0 (Very Good)";
    if (ratio >= 0.65) return "6.5 - 7.0 (Good)";
    if (ratio >= 0.50) return "5.5 - 6.0 (Competent)";
    if (ratio >= 0.35) return "4.5 - 5.0 (Modest)";
    return "3.5 - 4.0 (Limited)";
  };

  const isQuestionCorrect = (q) => {
    const userVal = (answers[q.id] || "").trim().toLowerCase();
    if (q.type === "choice") {
      return userVal === (q.correct || "").trim().toLowerCase();
    } else {
      return userVal === (q.answer || "").trim().toLowerCase();
    }
  };

  const submitIelts = () => {
    if (!activeTest?.sampleQuestions) return;
    let correct = 0;
    activeTest.sampleQuestions.forEach((q) => {
      if (isQuestionCorrect(q)) correct++;
    });

    const total = activeTest.sampleQuestions.length;
    const band = calculateBand(correct, total);
    const timeSpent = 30 * 60 - timeLeft;

    setBandResult({
      correct,
      total,
      band,
      timeSpent
    });
    sounds.playLessonSuccess();

    // Persist result to SQLite Database
    fetch("/api/exams/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: currentUser?.id || 1,
        exam_type: "ielts",
        exam_id: activeTest.id,
        exam_title: activeTest.title,
        score: correct,
        total_questions: total,
        band_score: `Band ${band}`,
        time_spent_seconds: timeSpent,
        answers_json: answers
      })
    }).catch(() => {});
  };

  const questionsList = activeTest?.sampleQuestions || [];
  const displayedQuestions = questionsList.filter((q) => {
    if (filterSection === "all") return true;
    return q.section.toLowerCase().includes(filterSection.toLowerCase());
  });

  const answeredCount = Object.keys(answers).filter((k) => (answers[k] || "").trim().length > 0).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1180px", margin: "0 auto", width: "100%", paddingBottom: "40px" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--foreground)" }}>
            Luyện Thi IELTS Online (Cambridge & Actual Tests)
          </h2>
          <span style={{ fontSize: "12px", fontWeight: 800, backgroundColor: "#8b5cf6", color: "#fff", padding: "2px 8px", borderRadius: "6px" }}>
            10 BỘ ĐỀ CAM & VOL • 40 ĐỀ THI ĐẦY ĐỦ
          </span>
        </div>
        <p style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
          Mô phỏng kỳ thi IELTS Listening Academic chuẩn Cambridge với 30 câu trọn vẹn 4 Section (Form filling, Multiple choice, Research lecture) và ước tính Band Score 1.0 - 9.0.
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
                <span>Đã làm: <strong style={{ color: "#a78bfa" }}>{answeredCount}</strong>/{questionsList.length} câu</span>
                {flaggedCount > 0 && (
                  <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Bookmark size={13} /> Đánh dấu: {flaggedCount}
                  </span>
                )}
              </div>
            </div>

            {/* Timer & Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {!bandResult && (
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

              {!bandResult ? (
                <button
                  onClick={submitIelts}
                  className="btn-duo"
                  style={{
                    padding: "10px 22px",
                    fontSize: "14px",
                    fontWeight: 800,
                    backgroundColor: "#8b5cf6",
                    color: "#fff"
                  }}
                >
                  Nộp Bài Thi
                </button>
              ) : (
                <button
                  onClick={() => {
                    setBandResult(null);
                    setAnswers({});
                    setFlaggedQuestions({});
                    setTimeLeft(30 * 60);
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
                  setBandResult(null);
                  setAnswers({});
                  setFlaggedQuestions({});
                }}
                className="btn-ghost"
                style={{ fontSize: "13px", fontWeight: 700 }}
              >
                ← Danh sách đề
              </button>
            </div>
          </div>

          {bandResult ? (
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
                <Award size={64} color="#8b5cf6" style={{ margin: "0 auto 16px auto" }} />
                <h3 style={{ fontSize: "24px", fontWeight: 900, color: "var(--foreground)", marginBottom: "8px" }}>
                  Kết Quả Kỳ Thi IELTS Listening
                </h3>
                <p style={{ fontSize: "15px", color: "var(--muted-foreground)", marginBottom: "20px" }}>
                  Thời gian làm bài: {Math.floor(bandResult.timeSpent / 60)} phút {bandResult.timeSpent % 60} giây
                </p>

                <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap", marginBottom: "24px" }}>
                  <div style={{ backgroundColor: "var(--muted)", padding: "16px 28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 700 }}>Số câu đúng</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "var(--success)" }}>
                      {bandResult.correct} / {bandResult.total}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "rgba(139, 92, 246, 0.15)", border: "2px solid #8b5cf6", padding: "16px 36px", borderRadius: "16px" }}>
                    <div style={{ fontSize: "13px", color: "#a78bfa", fontWeight: 700 }}>Ước Tính Band Score</div>
                    <div style={{ fontSize: "32px", fontWeight: 900, color: "#8b5cf6" }}>
                      Band {bandResult.band}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "var(--muted)", padding: "16px 28px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 700 }}>Độ chính xác</div>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "#a78bfa" }}>
                      {Math.round((bandResult.correct / bandResult.total) * 100)}%
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
                    Xem Tất Cả ({bandResult.total} câu)
                  </button>
                  <button
                    onClick={() => setReviewFilter("wrong")}
                    className={reviewFilter === "wrong" ? "btn-duo btn-primary" : "btn-ghost"}
                    style={{ padding: "8px 18px", fontSize: "13px", color: reviewFilter === "wrong" ? "#fff" : "#ef4444" }}
                  >
                    Chỉ Xem Câu Sai ({bandResult.total - bandResult.correct} câu)
                  </button>
                </div>
              </div>

              {/* Question Review Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {questionsList
                  .filter((q) => {
                    if (reviewFilter === "wrong") {
                      return !isQuestionCorrect(q);
                    }
                    return true;
                  })
                  .map((q) => {
                    const correct = isQuestionCorrect(q);
                    const userVal = answers[q.id] || "Chưa làm";
                    const expectedVal = q.type === "choice" ? q.correct : q.answer;

                    return (
                      <div
                        key={q.id}
                        style={{
                          backgroundColor: "var(--card)",
                          border: `2px solid ${correct ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
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
                                backgroundColor: correct ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                                color: correct ? "#4ade80" : "#f87171",
                                padding: "4px 10px",
                                borderRadius: "6px"
                              }}
                            >
                              Câu {q.id} • {q.section} ({correct ? "Đúng ✓" : "Sai ✗"})
                            </span>
                            <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                              Bạn làm: <strong style={{ color: correct ? "#4ade80" : "#f87171" }}>{userVal}</strong> | Đáp án chuẩn: <strong style={{ color: "var(--success)" }}>{expectedVal}</strong>
                            </span>
                          </div>
                          <button
                            onClick={() => playAudio(q.audioText || q.prompt)}
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
                            <strong>Audio Transcript:</strong> "{q.audioText}"
                          </div>
                        )}

                        {/* Options if choice */}
                        {q.type === "choice" && q.options && (
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                            {q.options.map((opt, oIdx) => {
                              const optLetter = ["A", "B", "C", "D"][oIdx];
                              const isUserChoice = (answers[q.id] || "").toUpperCase() === optLetter;
                              const isCorrectChoice = q.correct === optLetter;
                              return (
                                <div
                                  key={opt}
                                  style={{
                                    padding: "8px 16px",
                                    borderRadius: "10px",
                                    fontWeight: 700,
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
                                  ({optLetter}) {opt} {isCorrectChoice && "✓"} {isUserChoice && !isCorrectChoice && "✗"}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                          <div style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", borderLeft: "3px solid #8b5cf6", padding: "10px 14px", borderRadius: "0 8px 8px 0", fontSize: "13px", color: "var(--foreground)" }}>
                            <strong>Giải thích đáp án:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            /* Live Exam Question Layout with Palette (SPLIT SCREEN) */
            <div style={{ display: "flex", gap: "24px", height: "calc(100vh - 220px)", minHeight: "600px", alignItems: "start" }}>
              
              {/* Left Column: Reading Passage / Context (Split Screen 1) */}
              <div style={{ 
                flex: 1, 
                height: "100%", 
                overflowY: "auto", 
                backgroundColor: "var(--card)", 
                border: "2px solid var(--border)", 
                borderRadius: "16px", 
                padding: "24px" 
              }}>
                <h3 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "16px", color: "var(--foreground)" }}>
                   Bài Đọc / Ngữ cảnh ({filterSection === "all" ? "Toàn bài" : filterSection})
                </h3>
                <div style={{ fontSize: "15px", lineHeight: 1.8, color: "var(--muted-foreground)" }}>
                   <p style={{ marginBottom: "12px" }}><strong>Instructions:</strong> Read the passage below or listen to the audio extract to answer the questions on the right.</p>
                   <p style={{ marginBottom: "12px" }}>The history of modern transportation is a fascinating journey from the invention of the wheel to the development of supersonic jets. In the early 19th century, the steam engine revolutionized travel, making it possible to cross vast distances in a fraction of the time it previously took...</p>
                   <p style={{ marginBottom: "12px" }}>As cities grew, the need for efficient public transport became paramount. The first underground railway opened in London in 1863, paving the way for subway systems worldwide...</p>
                   <p style={{ padding: "16px", backgroundColor: "var(--muted)", borderRadius: "12px", borderLeft: "4px solid #8b5cf6", marginTop: "24px" }}>
                     <em>Ghi chú: Trong môi trường thi thực tế, khu vực này sẽ hiển thị toàn bộ nội dung PDF bài đọc hoặc hướng dẫn chi tiết bài nghe. Trình phát Audio cũng sẽ tự động chạy một lần duy nhất tại đây.</em>
                   </p>
                </div>
              </div>

              {/* Right Column: Questions & Inputs (Split Screen 2) */}
              <div style={{ 
                flex: 1, 
                height: "100%", 
                overflowY: "auto", 
                display: "flex", 
                flexDirection: "column", 
                gap: "16px" 
              }}>
                {/* Section Filter Bar */}
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                  {[
                    { id: "all", label: `Tất cả (${questionsList.length})` },
                    { id: "Section 1", label: "Section 1: Daily (1-8)" },
                    { id: "Section 2", label: "Section 2: Social (9-15)" },
                    { id: "Section 3", label: "Section 3: Academic (16-22)" },
                    { id: "Section 4", label: "Section 4: Lecture (23-30)" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setFilterSection(s.id)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        border: filterSection === s.id ? "2px solid #8b5cf6" : "1px solid var(--border)",
                        backgroundColor: filterSection === s.id ? "rgba(139, 92, 246, 0.2)" : "var(--card)",
                        color: filterSection === s.id ? "#a78bfa" : "var(--muted-foreground)",
                        cursor: "pointer"
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Questions List */}
                {displayedQuestions.map((q) => {
                  const isAnswered = Boolean((answers[q.id] || "").trim());
                  const isFlagged = Boolean(flaggedQuestions[q.id]);

                  return (
                    <div
                      key={q.id}
                      id={`ielts-q-${q.id}`}
                      style={{
                        backgroundColor: "var(--card)",
                        borderRadius: "16px",
                        padding: "20px",
                        border: isFlagged
                          ? "2px solid #f59e0b"
                          : isAnswered
                          ? "2px solid #8b5cf6"
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
                              backgroundColor: "rgba(139, 92, 246, 0.2)",
                              color: "#a78bfa",
                              padding: "4px 10px",
                              borderRadius: "8px"
                            }}
                          >
                            Câu {q.id}: {q.section}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                            {q.type === "fill" ? "Điền từ (Điền vào chỗ trống)" : "Trắc nghiệm"}
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
                            onClick={() => playAudio(q.id, q.audioText || q.prompt)}
                            disabled={playedAudio[q.id]}
                            className="btn-duo btn-outline"
                            style={{ 
                              padding: "6px 12px", 
                              fontSize: "12px",
                              opacity: playedAudio[q.id] ? 0.5 : 1,
                              cursor: playedAudio[q.id] ? "not-allowed" : "pointer"
                            }}
                          >
                            <Play size={13} style={{ marginRight: "4px" }} /> {playedAudio[q.id] ? "Đã Nghe (Khóa)" : "Nghe Audio (1 Lần)"}
                          </button>
                        </div>
                      </div>

                      <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", marginBottom: "16px", lineHeight: 1.5 }}>
                        {q.prompt}
                      </p>

                      {/* Question Content based on Type */}
                      {q.type === "choice" ? (
                        /* Multiple choice options */
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {q.options?.map((opt, oIdx) => {
                            const optLetter = ["A", "B", "C", "D"][oIdx];
                            const isSelected = answers[q.id] === optLetter;
                            return (
                              <button
                                key={opt}
                                onClick={() => handleSelectOption(q.id, optLetter)}
                                style={{
                                  padding: "10px 18px",
                                  borderRadius: "12px",
                                  border: isSelected ? "2px solid #8b5cf6" : "1px solid var(--border)",
                                  backgroundColor: isSelected ? "rgba(139, 92, 246, 0.2)" : "var(--muted)",
                                  color: isSelected ? "#a78bfa" : "var(--foreground)",
                                  fontWeight: 700,
                                  fontSize: "14px",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                <span style={{ fontWeight: 900, color: isSelected ? "#a78bfa" : "var(--muted-foreground)" }}>
                                  ({optLetter})
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Fill-in-the-blank input */
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <input
                            type="text"
                            value={answers[q.id] || ""}
                            onChange={(e) => handleInputChange(q.id, e.target.value)}
                            placeholder="Nhập từ cần điền vào chỗ trống..."
                            style={{
                              flex: 1,
                              maxWidth: "420px",
                              backgroundColor: "var(--muted)",
                              border: isAnswered ? "2px solid #8b5cf6" : "1px solid var(--border)",
                              borderRadius: "10px",
                              padding: "10px 14px",
                              color: "var(--foreground)",
                              fontSize: "14px",
                              fontWeight: 700,
                              outline: "none"
                            }}
                          />
                          {isAnswered && (
                            <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                              <CheckCircle2 size={14} /> Đã nhập
                            </span>
                          )}
                        </div>
                      )}
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
                  Bảng Điều Hướng IELTS
                </h4>

                {/* Status Legend */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", marginBottom: "14px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#8b5cf6" }} />
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
                    const isAnswered = Boolean((answers[q.id] || "").trim());
                    const isFlagged = Boolean(flaggedQuestions[q.id]);
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setFilterSection("all");
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
                            ? "1px solid #8b5cf6"
                            : "1px solid var(--border)",
                          backgroundColor: isFlagged
                            ? "rgba(245, 158, 11, 0.2)"
                            : isAnswered
                            ? "#8b5cf6"
                            : "var(--muted)",
                          color: isFlagged
                            ? "#f59e0b"
                            : isAnswered
                            ? "#fff"
                            : "var(--muted-foreground)",
                          transition: "all 0.15s ease"
                        }}
                        title={`Câu ${q.id}: ${q.section}`}
                      >
                        {q.id}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: "16px" }}>
                  <button
                    onClick={submitIelts}
                    className="btn-duo"
                    style={{
                      width: "100%",
                      padding: "10px",
                      fontSize: "14px",
                      fontWeight: 800,
                      backgroundColor: "#8b5cf6",
                      color: "#fff"
                    }}
                  >
                    Nộp Bài ({answeredCount}/{questionsList.length})
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* IELTS Sets & Exams Catalog */
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Set Selector Tabs */}
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
            {ieltsExamsData.map((set, sIdx) => {
              const isSelected = sIdx === selectedSetIdx;
              return (
                <button
                  key={set.slug}
                  onClick={() => setSelectedSetIdx(sIdx)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "12px",
                    border: isSelected ? "2px solid #8b5cf6" : "1px solid var(--border)",
                    backgroundColor: isSelected ? "rgba(139, 92, 246, 0.15)" : "var(--card)",
                    color: isSelected ? "#8b5cf6" : "var(--foreground)",
                    fontWeight: 800,
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  <GraduationCap size={16} />
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
                      30 câu hỏi hoàn chỉnh 4 Section (Form filling, Multiple Choice, Research discussion, Academic lecture) kèm chấm Band Score chuẩn.
                    </p>

                    {/* Section breakdown pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {exam.sections?.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            fontSize: "11px",
                            backgroundColor: "var(--muted)",
                            color: "var(--muted-foreground)",
                            padding: "3px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {s.name.split(":")[0]}
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
                          setAnswers({});
                          setFlaggedQuestions({});
                          setBandResult(null);
                        }}
                        className="btn-duo"
                        style={{
                          width: "100%",
                          padding: "10px",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          backgroundColor: "#8b5cf6",
                          color: "#fff"
                        }}
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
