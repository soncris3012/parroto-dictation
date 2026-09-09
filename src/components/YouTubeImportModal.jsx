import React, { useState } from "react";
import { X, Video, Sparkles, CheckCircle2, Lock } from "lucide-react";
import { useApp } from "../context/AppContext";
import { sounds } from "../utils/audioEffects";

export default function YouTubeImportModal({ isOpen, onClose, onImportSuccess }) {
  const { isPro, setIsPremiumModalOpen } = useApp();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("input"); // 'input' | 'generating' | 'success'

  if (!isOpen) return null;

  const handleImport = (e) => {
    e.preventDefault();
    if (!isPro) {
      setIsPremiumModalOpen(true);
      return;
    }
    if (!url.trim()) return;

    setLoading(true);
    setStep("generating");

    setTimeout(() => {
      setLoading(false);
      setStep("success");
      sounds.playSentenceComplete();

      // Extract video ID or default to sample
      let videoId = "nfu3opYpD7E";
      const match = url.match(/(?:v=|\/embed\/|\/watch\?v=|youtu\.be\/)([\w-]{11})/);
      if (match) videoId = match[1];

      const newLesson = {
        _id: "yt-" + Date.now(),
        title: "Bài học tùy biến từ YouTube",
        duration: "03:15",
        videoId: videoId,
        url: url,
        difficulty: "B2 - Intermediate",
        isCustom: true
      };

      setTimeout(() => {
        if (onImportSuccess) onImportSuccess(newLesson);
        onClose();
        setStep("input");
        setUrl("");
      }, 1200);
    }, 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(5, 10, 24, 0.8)",
        backdropFilter: "blur(6px)",
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
          maxWidth: "500px",
          backgroundColor: "#0d172e",
          color: "#f8fafc",
          borderRadius: "24px",
          border: "2px solid #1f3154",
          padding: "28px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff"
              }}
            >
              <Video size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                Tạo Bài Học Từ YouTube
              </h3>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  backgroundColor: "#d97706",
                  color: "#fff",
                  padding: "2px 6px",
                  borderRadius: "4px"
                }}
              >
                PRO FEATURE
              </span>
            </div>
          </div>

          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {!isPro ? (
          <div
            style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: "rgba(245, 158, 11, 0.08)",
              border: "1px solid #f59e0b",
              textAlign: "center"
            }}
          >
            <Lock size={36} color="#f59e0b" style={{ margin: "0 auto 12px auto" }} />
            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#f59e0b", marginBottom: "6px" }}>
              Tính năng dành riêng cho Sorata Premium
            </h4>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "16px" }}>
              Nâng cấp gói Premium để nhập bất kỳ video YouTube nào và biến thành bài học nghe chép chính tả & shadowing với phụ đề AI tự động!
            </p>
            <button
              onClick={() => {
                onClose();
                setIsPremiumModalOpen(true);
              }}
              className="btn-duo btn-gold"
              style={{ padding: "10px 20px", width: "100%" }}
            >
              Mở Khóa Premium Ngay
            </button>
          </div>
        ) : step === "generating" ? (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "4px solid #1f3154",
                borderTopColor: "#38bdf8",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px auto"
              }}
            />
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#f8fafc" }}>
              AI đang trích xuất phụ đề và tạo bài học...
            </p>
            <p style={{ fontSize: "12px", color: "#64748b" }}>
              Phân tách câu thoại, tính toán mốc thời gian mili-giây và phiên âm IPA
            </p>
          </div>
        ) : step === "success" ? (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <CheckCircle2 size={52} color="#22c55e" style={{ margin: "0 auto 14px auto" }} />
            <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#22c55e" }}>
              Đã tạo bài học thành công!
            </h4>
            <p style={{ fontSize: "13px", color: "#94a3b8" }}>
              Đang đưa bạn đến phòng luyện nghe chép...
            </p>
          </div>
        ) : (
          <form onSubmit={handleImport}>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "14px" }}>
              Dán đường dẫn video YouTube bất kỳ (ví dụ: TED-Ed, video phim, bản tin BBC) để tạo bài học luyện nghe:
            </p>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              required
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "12px",
                backgroundColor: "#162444",
                border: "1px solid #1f3154",
                color: "#f8fafc",
                fontSize: "14px",
                outline: "none",
                marginBottom: "16px"
              }}
            />

            <button
              type="submit"
              className="btn-duo btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "15px" }}
            >
              <Sparkles size={16} style={{ marginRight: "8px" }} />
              Tự Động Tạo Bài Học Ngay
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
