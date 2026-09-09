import React, { useState } from "react";
import {
  Bookmark,
  Search,
  Trash2,
  Volume2,
  Plus,
  Download,
  BookOpen,
  Pin,
  Layers,
  RotateCw,
  CheckCircle2,
  X,
  FileText,
  Sparkles,
  Share2
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { playGoogleSpeech } from "../utils/pronunciationAudio";
import { sounds } from "../utils/audioEffects";

export default function MyNotesView() {
  const { savedNotes, removeNote, addNote, currentUser, setIsAuthModalOpen } = useApp();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'flashcard'

  // New note form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState("vocabulary");
  const [newIpa, setNewIpa] = useState("");
  const [newExample, setNewExample] = useState("");

  // Flashcard state
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const tags = [
    { id: "all", label: "Tất cả" },
    { id: "vocabulary", label: "Từ vựng" },
    { id: "grammar", label: "Ngữ pháp" },
    { id: "idioms", label: "Thành ngữ & Collocation" },
    { id: "pronunciation", label: "Lỗi phát âm" },
    { id: "general", label: "Ghi chú bài học" }
  ];

  const filtered = savedNotes.filter((n) => {
    const title = n.title || n.word || "";
    const content = n.content || n.meaning || "";
    const matchesSearch =
      title.toLowerCase().includes(search.toLowerCase()) ||
      content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === "all" || n.tag === selectedTag || (selectedTag === "vocabulary" && !n.tag);
    return matchesSearch && matchesTag;
  });

  const speak = (txt) => {
    playGoogleSpeech(txt);
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    await addNote({
      word: newTitle.trim(),
      title: newTitle.trim(),
      meaning: newContent.trim() || "Ghi chú cá nhân",
      content: newContent.trim() || "Ghi chú cá nhân",
      tag: newTag,
      ipa: newIpa.trim(),
      example: newExample.trim(),
      lesson: "Sổ tay cá nhân"
    });

    setNewTitle("");
    setNewContent("");
    setNewIpa("");
    setNewExample("");
    setIsAdding(false);
  };

  // Export notes to Markdown
  const handleExportMarkdown = () => {
    if (savedNotes.length === 0) return;
    let md = "# SỔ TAY GHI CHÚ PARROTO\n\n";
    savedNotes.forEach((n, i) => {
      const title = n.title || n.word;
      const meaning = n.content || n.meaning;
      md += `### ${i + 1}. ${title} ${n.ipa ? `(${n.ipa})` : ""}\n`;
      md += `- **Loại:** ${n.tag || "Từ vựng"}\n`;
      md += `- **Ý nghĩa:** ${meaning}\n`;
      if (n.example) md += `- **Ví dụ:** *${n.example}*\n`;
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `parroto_my_notes_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Flashcard controls
  const currentCard = filtered[flashcardIdx] || filtered[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    if (flashcardIdx + 1 < filtered.length) {
      setFlashcardIdx(flashcardIdx + 1);
    } else {
      setFlashcardIdx(0);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "980px", margin: "0 auto", width: "100%", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--foreground)" }}>
              Sổ Tay Từ Vựng & Ghi Chú Cá Nhân
            </h2>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                padding: "2px 8px",
                borderRadius: "6px"
              }}
            >
              {savedNotes.length} Ghi chú
            </span>
          </div>
          <p style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
            Lưu trữ từ vựng, ngữ pháp, thành ngữ tra cứu được khi luyện nghe và đồng bộ an toàn trên cơ sở dữ liệu SQLite.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Mode Switcher */}
          <div
            style={{
              display: "flex",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "3px"
            }}
          >
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: viewMode === "list" ? "var(--primary)" : "transparent",
                color: viewMode === "list" ? "#fff" : "var(--muted-foreground)"
              }}
            >
              Danh sách
            </button>
            <button
              onClick={() => {
                setViewMode("flashcard");
                setFlashcardIdx(0);
                setIsFlipped(false);
              }}
              style={{
                padding: "6px 12px",
                border: "none",
                borderRadius: "7px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                backgroundColor: viewMode === "flashcard" ? "var(--primary)" : "transparent",
                color: viewMode === "flashcard" ? "#fff" : "var(--muted-foreground)"
              }}
            >
              Flashcard
            </button>
          </div>

          <button
            onClick={handleExportMarkdown}
            className="btn-duo btn-outline"
            style={{ padding: "8px 14px", fontSize: "13px" }}
            title="Tải về file ghi chú Markdown"
          >
            <Download size={15} style={{ marginRight: "6px" }} />
            Xuất file
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="btn-duo btn-primary"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            <Plus size={16} style={{ marginRight: "6px" }} />
            Thêm ghi chú
          </button>
        </div>
      </div>

      {/* Add New Note Form Collapsible */}
      {isAdding && (
        <form
          onSubmit={handleCreateNote}
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--primary)",
            borderRadius: "18px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--foreground)" }}>
              Thêm ghi chú từ vựng / cấu trúc mới
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              style={{ background: "transparent", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "4px" }}>
                Từ vựng / Tiêu đề *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Strike a chord"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "4px" }}>
                Phân loại
              </label>
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontSize: "14px",
                  outline: "none"
                }}
              >
                <option value="vocabulary">Từ vựng</option>
                <option value="grammar">Ngữ pháp</option>
                <option value="idioms">Thành ngữ / Collocation</option>
                <option value="pronunciation">Lỗi phát âm</option>
                <option value="general">Ghi chú bài học</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "4px" }}>
                Phiên âm IPA
              </label>
              <input
                type="text"
                value={newIpa}
                onChange={(e) => setNewIpa(e.target.value)}
                placeholder="/straɪk ə kɔːd/"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "4px" }}>
                Ý nghĩa tiếng Việt *
              </label>
              <input
                type="text"
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Tạo cảm xúc đồng cảm, đánh đúng tâm lý"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "4px" }}>
              Câu ví dụ minh họa
            </label>
            <input
              type="text"
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              placeholder="Her speech struck a chord with the younger audience."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontSize: "13px",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "6px" }}>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="btn-ghost"
              style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px" }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-duo btn-primary"
              style={{ padding: "8px 20px", borderRadius: "10px", fontSize: "13px" }}
            >
              Lưu Vào Sổ Tay SQLite
            </button>
          </div>
        </form>
      )}

      {/* FLASHCARD MODE */}
      {viewMode === "flashcard" && filtered.length > 0 && (
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "24px",
            padding: "36px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "600px",
            margin: "0 auto",
            width: "100%"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "20px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--muted-foreground)" }}>
              Thẻ {flashcardIdx + 1} / {filtered.length}
            </span>
            <button
              onClick={() => speak(currentCard.title || currentCard.word)}
              className="btn-duo btn-ghost"
              style={{ padding: "6px 12px", borderRadius: "8px", color: "var(--primary)" }}
              title="Phát âm chuẩn Google TTS"
            >
              <Volume2 size={16} style={{ marginRight: "4px" }} /> Nghe phát âm
            </button>
          </div>

          {/* Flashcard Body */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              width: "100%",
              minHeight: "220px",
              backgroundColor: "var(--background)",
              border: "2px dashed var(--primary)",
              borderRadius: "20px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.2s ease",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
            }}
          >
            {!isFlipped ? (
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    backgroundColor: "var(--accent)",
                    color: "var(--primary)",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    marginBottom: "12px",
                    display: "inline-block"
                  }}
                >
                  {currentCard.tag || "Từ vựng"}
                </span>
                <h3 style={{ fontSize: "28px", fontWeight: 900, color: "var(--foreground)", marginBottom: "8px" }}>
                  {currentCard.title || currentCard.word}
                </h3>
                {currentCard.ipa && (
                  <p style={{ fontSize: "16px", color: "var(--muted-foreground)", fontWeight: 600 }}>
                    {currentCard.ipa}
                  </p>
                )}
                <span style={{ fontSize: "12px", color: "#38bdf8", marginTop: "16px", display: "block" }}>
                  (Nhấp chuột để lật xem nghĩa tiếng Việt & ví dụ)
                </span>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary)", marginBottom: "12px" }}>
                  🇻🇳 {currentCard.content || currentCard.meaning}
                </p>
                {currentCard.example && (
                  <p style={{ fontSize: "14px", color: "var(--muted-foreground)", fontStyle: "italic", lineHeight: 1.5 }}>
                    "{currentCard.example}"
                  </p>
                )}
                <span style={{ fontSize: "12px", color: "#38bdf8", marginTop: "16px", display: "block" }}>
                  (Nhấp chuột để lật lại mặt trước)
                </span>
              </div>
            )}
          </div>

          {/* Flashcard Bottom Controls */}
          <div style={{ display: "flex", gap: "14px", marginTop: "24px", width: "100%" }}>
            <button
              onClick={() => {
                sounds.playWrong();
                handleNextCard();
              }}
              className="btn-duo btn-outline"
              style={{ flex: 1, padding: "12px", borderRadius: "12px", fontSize: "14px" }}
            >
              Cần ôn lại
            </button>
            <button
              onClick={() => {
                sounds.playCorrect();
                handleNextCard();
              }}
              className="btn-duo btn-success"
              style={{ flex: 1, padding: "12px", borderRadius: "12px", fontSize: "14px" }}
            >
              Đã nhớ (+10 XP)
            </button>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <>
          {/* Filter Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            {/* Tag Pills */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTag(t.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    border: selectedTag === t.id ? "2px solid var(--primary)" : "1px solid var(--border)",
                    backgroundColor: selectedTag === t.id ? "var(--primary)" : "var(--card)",
                    color: selectedTag === t.id ? "#fff" : "var(--foreground)",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "6px 14px",
                width: "240px"
              }}
            >
              <Search size={15} color="var(--muted-foreground)" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm từ hoặc nghĩa..."
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--foreground)",
                  fontSize: "13px",
                  width: "100%"
                }}
              />
            </div>
          </div>

          {/* Notes Cards Grid */}
          {filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                backgroundColor: "var(--card)",
                border: "2px dashed var(--border)",
                borderRadius: "20px"
              }}
            >
              <BookOpen size={48} color="var(--muted-foreground)" style={{ margin: "0 auto 12px auto" }} />
              <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--foreground)", marginBottom: "4px" }}>
                Chưa có từ vựng nào trong mục này
              </h4>
              <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                Hãy tra từ khi luyện nghe hoặc bấm "+ Thêm ghi chú" để lưu từ vựng vào SQLite!
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "16px" }}>
              {filtered.map((n) => {
                const title = n.title || n.word;
                const meaning = n.content || n.meaning;

                return (
                  <div
                    key={n.id}
                    style={{
                      backgroundColor: "var(--card)",
                      border: "2px solid var(--border)",
                      borderRadius: "16px",
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "12px",
                      transition: "all 0.15s ease",
                      position: "relative"
                    }}
                    className="hover:border-primary/50 hover:-translate-y-1"
                  >
                    <div>
                      {/* Card Top: Tag + Audio speaker */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            textTransform: "uppercase",
                            backgroundColor: "var(--accent)",
                            color: "var(--primary)",
                            padding: "2px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {n.tag || "Từ vựng"}
                        </span>

                        <div style={{ display: "flex", gap: "4px" }}>
                          <button
                            onClick={() => speak(title)}
                            className="btn-ghost"
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              color: "var(--primary)",
                              border: "none",
                              cursor: "pointer"
                            }}
                            title="Nghe phát âm chuẩn Google"
                          >
                            <Volume2 size={16} />
                          </button>

                          <button
                            onClick={() => removeNote(n.id)}
                            className="btn-ghost"
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              color: "#ef4444",
                              border: "none",
                              cursor: "pointer"
                            }}
                            title="Xóa ghi chú"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <h4 style={{ fontSize: "18px", fontWeight: 800, color: "var(--foreground)", marginBottom: "4px" }}>
                        {title}
                      </h4>

                      {n.ipa && (
                        <p style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 600, marginBottom: "8px" }}>
                          {n.ipa}
                        </p>
                      )}

                      <p style={{ fontSize: "14px", color: "var(--foreground)", fontWeight: 600, lineHeight: 1.4 }}>
                        {meaning}
                      </p>

                      {n.example && (
                        <p style={{ fontSize: "12px", color: "var(--muted-foreground)", fontStyle: "italic", marginTop: "8px", lineHeight: 1.4 }}>
                          "{n.example}"
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "8px", fontSize: "11px", color: "var(--muted-foreground)" }}>
                      <span>{n.created_at?.slice(0, 10) || "Hôm nay"}</span>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>Đã lưu SQLite</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
