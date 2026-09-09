import React, { useState } from "react";
import { BookOpen, Sparkles, Film, Coffee, Headphones, Music, Radio, Tv, Flame, Lightbulb, Smile, Globe, BookMarked, Utensils, Wrench, Newspaper, Landmark, Compass, Feather } from "lucide-react";
import { categoriesData } from "../data/categoriesData";

export default function TopicsView({ onSelectTopic }) {
  const [selectedTag, setSelectedTag] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const tags = [
    { id: "all", label: "Tất cả chủ đề" },
    { id: "daily", label: "Đời sống & Giao tiếp" },
    { id: "movie", label: "Phim ảnh & Giải trí" },
    { id: "music", label: "Âm nhạc (US-UK)" },
    { id: "exam", label: "Luyện thi (IELTS/TOEIC)" },
    { id: "news", label: "Tin tức & BBC" },
    { id: "science", label: "Khoa học & TED" }
  ];

  const getTagFromCategory = (cat) => {
    const s = cat.slug.toLowerCase();
    if (s.includes("movie") || s.includes("entertainment")) return "movie";
    if (s.includes("song")) return "music";
    if (s.includes("ielts") || s.includes("toeic") || s.includes("toefl")) return "exam";
    if (s.includes("news") || s.includes("bbc") || s.includes("voa")) return "news";
    if (s.includes("science") || s.includes("ted")) return "science";
    return "daily";
  };

  const filtered = categoriesData.filter((cat) => {
    const tag = getTagFromCategory(cat);
    const matchesTag = selectedTag === "all" || tag === selectedTag;
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.page_title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--foreground)" }}>
            25 Nhóm Chủ Đề Luyện Tiếng Anh
          </h2>
          <span style={{ fontSize: "12px", fontWeight: 800, backgroundColor: "var(--accent)", color: "var(--primary)", padding: "2px 8px", borderRadius: "6px" }}>
            1.000+ BÀI HỌC
          </span>
        </div>
        <p style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
          Khám phá trọn bộ các chủ đề học phong phú từ giao tiếp hàng ngày, phim hoạt hình, tin tức quốc tế đến luyện thi chứng chỉ.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        {/* Tag Filters */}
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

        {/* Search input */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm tên chủ đề..."
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            fontSize: "13px",
            outline: "none",
            width: "220px"
          }}
        />
      </div>

      {/* Categories Grid (All 25 categories) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "18px"
        }}
      >
        {filtered.map((cat, idx) => (
          <div
            key={cat._id || idx}
            onClick={() => onSelectTopic(cat)}
            style={{
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "18px",
              padding: "20px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "14px",
              transition: "all 0.2s ease"
            }}
            className="hover:border-primary/60 hover:-translate-y-1"
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    backgroundColor: "rgba(56, 189, 248, 0.15)",
                    color: "var(--primary)",
                    padding: "3px 8px",
                    borderRadius: "6px"
                  }}
                >
                  {cat.total_lessons || (cat.lessons?.length * 10)} bài học
                </span>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  #{idx + 1}
                </span>
              </div>

              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--foreground)", marginBottom: "6px" }}>
                {cat.name}
              </h3>

              <p style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.5, maxHeight: "42px", overflow: "hidden" }}>
                {cat.page_title}
              </p>
            </div>

            {/* Featured Sample lessons pill */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "12px"
              }}
            >
              <span style={{ color: "var(--muted-foreground)", fontWeight: 500 }}>
                {cat.lessons?.length || 6} bài chọn lọc
              </span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>Xem bài học →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
