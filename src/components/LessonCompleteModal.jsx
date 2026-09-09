import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, CheckCircle, RotateCcw, ArrowRight, Star } from "lucide-react";
import { MascotSvg } from "./Mascot";
import { sounds } from "../utils/audioEffects";

export default function LessonCompleteModal({ isOpen, onClose, onRestart, totalSentences = 33 }) {
  useEffect(() => {
    if (isOpen) {
      sounds.playLessonSuccess();
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
          maxWidth: "480px",
          backgroundColor: "var(--card)",
          borderRadius: "24px",
          border: "2px solid var(--border)",
          padding: "32px 24px",
          textAlign: "center",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          animation: "bounce-gentle 0.3s ease-out"
        }}
      >
        {/* Mascot & Trophy */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <MascotSvg size={72} />
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(234, 179, 8, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#eab308"
            }}
          >
            <Trophy size={32} />
          </div>
        </div>

        <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--foreground)", marginBottom: "6px" }}>
          Chúc Mừng Bạn Đã Hoàn Thành!
        </h2>
        <p style={{ fontSize: "14px", color: "var(--muted-foreground)", marginBottom: "24px" }}>
          Bạn vừa hoàn thành xuất sắc bài nghe chép chính tả <strong>"How To Wake Up Better"</strong>.
        </p>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "28px"
          }}
        >
          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              backgroundColor: "var(--muted)",
              border: "1px solid var(--border)"
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 600 }}>Độ chính xác</span>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--success)" }}>98%</p>
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              backgroundColor: "var(--muted)",
              border: "1px solid var(--border)"
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 600 }}>Số câu</span>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)" }}>{totalSentences} / {totalSentences}</p>
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              backgroundColor: "var(--muted)",
              border: "1px solid var(--border)"
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 600 }}>Thưởng XP</span>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "#eab308" }}>+50 💎</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={onClose}
            className="btn-duo btn-success"
            style={{ width: "100%", padding: "12px", fontSize: "15px" }}
          >
            Tiếp tục học bài tiếp theo
            <ArrowRight size={18} style={{ marginLeft: "8px" }} />
          </button>

          <button
            onClick={onRestart}
            className="btn-duo btn-outline"
            style={{ width: "100%", padding: "12px", fontSize: "14px" }}
          >
            <RotateCcw size={16} style={{ marginRight: "8px" }} />
            Luyện tập lại bài này
          </button>
        </div>
      </div>
    </div>
  );
}
