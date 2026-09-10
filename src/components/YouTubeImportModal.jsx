import React, { useState, useEffect } from "react";
import { X, Video, Sparkles, CheckCircle2, Play, AlertCircle, FileText, ExternalLink, RefreshCw } from "lucide-react";
import { useApp } from "../context/AppContext";
import { sounds } from "../utils/audioEffects";

const SAMPLE_VIDEOS = [
  {
    title: "How To Wake Up Better (BuzzFeed)",
    url: "https://www.youtube.com/watch?v=nfu3opYpD7E",
    tag: "Khoa học đời sống"
  },
  {
    title: "Steve Jobs Stanford Speech (Stay Hungry)",
    url: "https://www.youtube.com/watch?v=UF8uR6Z6KLc",
    tag: "Diễn thuyết truyền cảm hứng"
  },
  {
    title: "Never Gonna Give You Up (Rick Astley)",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    tag: "Bài hát tiếng Anh"
  }
];

export default function YouTubeImportModal({ isOpen, onClose, onImportSuccess }) {
  const [url, setUrl] = useState("");
  const [customTranscript, setCustomTranscript] = useState("");
  const [showManualTranscript, setShowManualTranscript] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [stepIndex, setStepIndex] = useState(0); // 0: metadata, 1: captions, 2: translate, 3: done
  const [previewMeta, setPreviewMeta] = useState(null);
  const [error, setError] = useState("");

  // Extract video ID helper
  const getVideoId = (str) => {
    if (!str) return null;
    const match = str.trim().match(/(?:v=|\/vi\/|\/embed\/|\/watch\?v=|youtu\.be\/|\/shorts\/)([\w-]{11})/);
    return match ? match[1] : (str.length === 11 ? str : null);
  };

  // Preview video metadata on URL change
  useEffect(() => {
    if (!isOpen) {
      setPreviewMeta(null);
      return;
    }
    const videoId = getVideoId(url);
    if (!videoId) {
      setPreviewMeta(null);
      return;
    }

    let isSubscribed = true;
    fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isSubscribed && data) {
          setPreviewMeta({
            title: data.title,
            author: data.author_name,
            thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            videoId
          });
          setError("");
        }
      })
      .catch(() => {});

    return () => {
      isSubscribed = false;
    };
  }, [url, isOpen]);

  const handleImport = async (e) => {
    if (e) e.preventDefault();
    const videoId = getVideoId(url);
    if (!videoId) {
      setError("Vui lòng dán đường dẫn YouTube hợp lệ (ví dụ: https://www.youtube.com/watch?v=...)");
      return;
    }

    setError("");
    setLoading(true);
    setStepIndex(0);
    setStatusText("Đang kết nối YouTube và phân tích video...");

    try {
      // Step 1: Request backend extract API
      const progressTimer1 = setTimeout(() => {
        setStepIndex(1);
        setStatusText("Đang trích xuất phụ đề gốc và phân tách mốc thời gian mili-giây...");
      }, 800);

      const progressTimer2 = setTimeout(() => {
        setStepIndex(2);
        setStatusText("Đang dịch nghĩa song ngữ tiếng Việt & tối ưu hóa bài tập...");
      }, 2000);

      const res = await fetch("/api/youtube/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          transcriptText: customTranscript.trim() || undefined
        })
      });

      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);

      const data = await res.json();

      if (!res.ok || !data.success) {
        // If captions are not available, prompt user to supply manual transcript
        if (data.needManualTranscript) {
          setShowManualTranscript(true);
          setError(data.message || "Video này không có phụ đề tự động. Bạn có thể dán nội dung văn bản bên dưới để tạo bài học!");
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Không thể tạo bài học từ video này.");
      }

      setStepIndex(3);
      setStatusText("Hoàn tất! Đang chuyển vào phòng luyện Dictation...");
      sounds.playSentenceComplete();

      setTimeout(() => {
        if (onImportSuccess) {
          onImportSuccess(data.lesson);
        }
        onClose();
        setLoading(false);
        setUrl("");
        setCustomTranscript("");
        setShowManualTranscript(false);
        setPreviewMeta(null);
      }, 1000);
    } catch (err) {
      console.error("[YouTube Import] Error:", err);
      setError(err.message || "Đã xảy ra lỗi khi tạo bài học. Vui lòng kiểm tra lại link hoặc dán lời thoại.");
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleUrl) => {
    setUrl(sampleUrl);
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3, 7, 18, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "560px",
          maxHeight: "92vh",
          overflowY: "auto",
          backgroundColor: "#0d1527",
          color: "#f8fafc",
          borderRadius: "24px",
          border: "2px solid #1e3154",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.15)",
          animation: "scaleUp 0.2s ease-out"
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid #1e3154"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: "#dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)"
              }}
            >
              <Video size={22} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#f8fafc" }}>
                  Tạo Bài Học Từ YouTube
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    backgroundColor: "rgba(56, 189, 248, 0.15)",
                    color: "#38bdf8",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    padding: "2px 7px",
                    borderRadius: "6px"
                  }}
                >
                  AI TRANSCRIBE
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                Tự động lấy phụ đề theo mốc thời gian mili-giây và dịch nghĩa song ngữ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "20px 24px" }}>
          {loading ? (
            /* Loading State */
            <div style={{ textAlign: "center", padding: "36px 16px" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  border: "4px solid #1e3154",
                  borderTopColor: "#38bdf8",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 20px auto"
                }}
              />
              <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc", marginBottom: "8px" }}>
                {statusText}
              </h4>

              {/* Step indicator */}
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "18px" }}>
                {["Video", "Phụ đề", "Dịch nghĩa", "Sẵn sàng"].map((label, idx) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: idx <= stepIndex ? "#38bdf8" : "#475569"
                    }}
                  >
                    <span>{idx <= stepIndex ? "●" : "○"}</span> {label}
                    {idx < 3 && <span style={{ color: "#334155", margin: "0 2px" }}>→</span>}
                  </div>
                ))}
              </div>

              {previewMeta && (
                <div
                  style={{
                    marginTop: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "12px",
                    backgroundColor: "#13213c",
                    border: "1px solid #1e3154",
                    textAlign: "left"
                  }}
                >
                  <img
                    src={previewMeta.thumbnail}
                    alt=""
                    style={{ width: "64px", height: "40px", objectFit: "cover", borderRadius: "6px" }}
                  />
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {previewMeta.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{previewMeta.author}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Normal Input Form */
            <form onSubmit={handleImport}>
              {/* Error Message */}
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    backgroundColor: "rgba(239, 68, 68, 0.12)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    color: "#fca5a5",
                    fontSize: "13px",
                    marginBottom: "16px"
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>{error}</div>
                </div>
              )}

              {/* URL Input */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#f8fafc", marginBottom: "8px" }}>
                  Đường dẫn Video YouTube
                </label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#13213c",
                    border: "1px solid #1e3154",
                    borderRadius: "14px",
                    padding: "4px 6px 4px 14px"
                  }}
                >
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    style={{
                      flex: 1,
                      backgroundColor: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#f8fafc",
                      fontSize: "14px",
                      padding: "8px 0"
                    }}
                  />
                  {url && (
                    <button
                      type="button"
                      onClick={() => setUrl("")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "6px"
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Video Live Preview Card */}
              {previewMeta && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "14px",
                    backgroundColor: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    marginBottom: "16px"
                  }}
                >
                  <img
                    src={previewMeta.thumbnail}
                    alt=""
                    style={{ width: "80px", height: "48px", objectFit: "cover", borderRadius: "8px" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {previewMeta.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#38bdf8", marginTop: "2px" }}>
                      Kênh: {previewMeta.author}
                    </div>
                  </div>
                  <CheckCircle2 size={20} color="#38bdf8" style={{ flexShrink: 0 }} />
                </div>
              )}

              {/* Quick Sample Picks */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: "8px" }}>
                  💡 Hoặc chọn nhanh video mẫu đã kiểm chứng phụ đề:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {SAMPLE_VIDEOS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSample(sample.url)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        backgroundColor: url === sample.url ? "rgba(56, 189, 248, 0.15)" : "#13213c",
                        border: url === sample.url ? "1px solid #38bdf8" : "1px solid #1e3154",
                        borderRadius: "10px",
                        cursor: "pointer",
                        textAlign: "left",
                        color: "#f8fafc",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Play size={13} color="#38bdf8" />
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>{sample.title}</span>
                      </div>
                      <span style={{ fontSize: "11px", color: "#94a3b8", backgroundColor: "rgba(255, 255, 255, 0.06)", padding: "2px 6px", borderRadius: "4px" }}>
                        {sample.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Custom Transcript Area */}
              <div style={{ marginBottom: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowManualTranscript(!showManualTranscript)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "transparent",
                    border: "none",
                    color: "#38bdf8",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    padding: "0"
                  }}
                >
                  <FileText size={14} />
                  {showManualTranscript ? "Ẩn khung dán transcript" : "+ Tùy chọn: Tự dán transcript / lời thoại nếu video không có phụ đề sẵn"}
                </button>

                {showManualTranscript && (
                  <div style={{ marginTop: "10px" }}>
                    <textarea
                      value={customTranscript}
                      onChange={(e) => setCustomTranscript(e.target.value)}
                      placeholder="Dán toàn bộ văn bản tiếng Anh hoặc lời bài hát vào đây. AI sẽ tự chia thành từng câu và khớp thời gian phát cho bạn..."
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        borderRadius: "12px",
                        backgroundColor: "#13213c",
                        border: "1px solid #1e3154",
                        color: "#f8fafc",
                        fontSize: "13px",
                        outline: "none",
                        resize: "vertical"
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-duo btn-primary"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: 800,
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 20px rgba(56, 189, 248, 0.3)"
                }}
              >
                <Sparkles size={18} />
                Tự Động Tạo Bài Học Ngay (AI)
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
