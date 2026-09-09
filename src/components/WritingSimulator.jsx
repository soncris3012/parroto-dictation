import React, { useState, useEffect } from "react";
import { Clock, Send, Lock, Save } from "lucide-react";
import { sounds } from "../utils/audioEffects";

export default function WritingSimulator({ taskType, prompt, timeLimit = 60 * 60, onSubmit }) {
  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Word count logic
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [text]);

  // Mock Auto-save
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (text.length > 0) {
        setLastSaved(new Date().toLocaleTimeString());
        // In real app: ws.send(JSON.stringify({ type: "autosave", text }))
      }
    }, 10000);
    return () => clearInterval(autoSave);
  }, [text]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handlePreventCheating = (e) => {
    e.preventDefault();
    // alert("Sao chép và dán không được phép trong bài thi này!");
  };

  const handleSubmit = () => {
    sounds.playLessonSuccess();
    onSubmit({ text, wordCount, timeSpent: timeLimit - timeLeft });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}>
      {/* Top Header Split */}
      <div style={{ display: "flex", gap: "20px", flex: 1, minHeight: "500px" }}>
        
        {/* Left Panel: Prompt */}
        <div style={{ 
          flex: 1, 
          backgroundColor: "var(--card)", 
          border: "2px solid var(--border)", 
          borderRadius: "16px",
          padding: "24px",
          overflowY: "auto"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--foreground)" }}>
              {taskType === "ielts_1" ? "IELTS Academic Writing Task 1" : taskType === "ielts_2" ? "IELTS Academic Writing Task 2" : "Writing Task"}
            </h3>
            <span style={{ fontSize: "12px", backgroundColor: "var(--muted)", padding: "4px 10px", borderRadius: "6px", fontWeight: 700 }}>
              Minimum {taskType === "ielts_1" ? "150" : "250"} words
            </span>
          </div>
          
          <div style={{ fontSize: "15px", color: "var(--foreground)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {prompt}
          </div>
        </div>

        {/* Right Panel: Workspace */}
        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column", 
          backgroundColor: "var(--card)", 
          border: "2px solid var(--border)", 
          borderRadius: "16px",
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{ 
            padding: "16px 20px", 
            borderBottom: "1px solid var(--border)", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            backgroundColor: "var(--muted)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: timeLeft < 300 ? "#ef4444" : "var(--foreground)", fontWeight: 800 }}>
                <Clock size={16} />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "var(--muted-foreground)" }}>
                <Lock size={12} />
                <span>Secure Exam Mode</span>
              </div>
            </div>

            <div style={{ fontSize: "13px", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "8px" }}>
              {lastSaved && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Save size={12}/> Đã lưu lúc {lastSaved}</span>}
              <span style={{ fontWeight: 800, color: wordCount < (taskType === "ielts_1" ? 150 : 250) ? "#f59e0b" : "#4ade80" }}>
                Từ đếm được: {wordCount}
              </span>
            </div>
          </div>

          {/* Text Area */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onCopy={handlePreventCheating}
            onCut={handlePreventCheating}
            onPaste={handlePreventCheating}
            spellCheck={false}
            placeholder="Bắt đầu viết tại đây..."
            style={{
              flex: 1,
              width: "100%",
              padding: "20px",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              color: "var(--foreground)",
              fontSize: "15px",
              lineHeight: 1.6,
              resize: "none",
              fontFamily: "monospace"
            }}
          />

          <div style={{ padding: "16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
             <button
              onClick={handleSubmit}
              className="btn-duo"
              style={{
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 800,
                backgroundColor: "#8b5cf6",
                color: "#fff"
              }}
            >
              Nộp Bài Thi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
