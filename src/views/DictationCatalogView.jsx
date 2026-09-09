import React, { useState, useMemo } from "react";
import { Headphones, Plus, Play, Sparkles, Filter, Search, Crown, Lock, Flame } from "lucide-react";
import { useApp } from "../context/AppContext";
import { categoriesData } from "../data/categoriesData";
import { lessonsCatalog } from "../data/lessonsCatalog";

export default function DictationCatalogView({ onOpenLesson, onOpenYouTubeModal }) {
  const { isPro, setIsPremiumModalOpen, customLessons } = useApp();
  const [filterLevel, setFilterLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Flatten all 150 lessons from categoriesData
  const allExtractedLessons = useMemo(() => {
    const list = [];
    // Prioritize our fully transcribed lessons
    lessonsCatalog.forEach((l) => {
      list.push({
        _id: l._id,
        title: l.title,
        slug: l.slug,
        duration: l.duration,
        difficulty: l.difficulty,
        topic: l.topic_id?.name || "Science & Life",
        thumbnail: `https://img.youtube.com/vi/${l.videoId || "nfu3opYpD7E"}/mqdefault.jpg`,
        is_pro: false,
        total_view_count: l.total_view_count || 45000,
        playableLesson: l
      });
    });

    categoriesData.forEach((cat) => {
      (cat.lessons || []).forEach((l) => {
        // avoid duplicating if slug matches
        if (!list.some((existing) => existing.slug === l.slug)) {
          list.push({
            _id: l._id,
            title: l.title,
            slug: l.slug,
            duration: l.duration,
            difficulty: l.difficulty,
            topic: cat.name,
            thumbnail: l.thumbnail,
            is_pro: l.is_pro,
            total_view_count: l.total_view_count
          });
        }
      });
    });

    return [...customLessons, ...list];
  }, [customLessons]);

  const filtered = allExtractedLessons.filter((item) => {
    const matchesLvl = filterLevel === "all" || (item.difficulty && item.difficulty.toLowerCase().includes(filterLevel.toLowerCase()));
    const matchesCat = selectedCategory === "all" || item.topic === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.topic && item.topic.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesLvl && matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1150px", margin: "0 auto", width: "100%" }}>
      {/* Top Banner with YouTube Importer CTA */}
      <div
        style={{
          background: "linear-gradient(135deg, #101c36 0%, #0a1124 100%)",
          border: "2px solid #1f3154",
          borderRadius: "20px",
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#f8fafc" }}>
              Kho Bài Luyện Nghe Chép (Dictation)
            </h2>
            <span
              style={{
                backgroundColor: "rgba(56, 189, 248, 0.2)",
                color: "#38bdf8",
                fontSize: "12px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "6px"
              }}
            >
              {allExtractedLessons.length}+ BÀI HỌC
            </span>
          </div>
          <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "620px" }}>
            Nghe chép chính tả từng từ kết hợp phụ đề song ngữ và nhận diện âm chuẩn bản xứ.
          </p>
        </div>

        {/* YouTube Import Button */}
        <button
          onClick={onOpenYouTubeModal}
          className="btn-duo btn-gold"
          style={{ padding: "12px 20px", fontSize: "14px", borderRadius: "12px" }}
        >
          <Plus size={18} style={{ marginRight: "6px" }} />
          Tạo Bài Học Từ YouTube (PRO)
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "12px",
            padding: "8px 14px",
            width: "320px"
          }}
        >
          <Search size={16} color="var(--muted-foreground)" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm trong 150+ bài nghe..."
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

        {/* Category selector dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: "8px 14px",
            borderRadius: "10px",
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            fontSize: "13px",
            fontWeight: 600,
            outline: "none"
          }}
        >
          <option value="all">Tất cả danh mục (25 Chủ đề)</option>
          {categoriesData.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Level Filters */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["all", "A1", "A2", "B1", "B2", "C1"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: filterLevel === lvl ? "2px solid var(--primary)" : "1px solid var(--border)",
                backgroundColor: filterLevel === lvl ? "var(--primary)" : "var(--card)",
                color: filterLevel === lvl ? "#fff" : "var(--foreground)",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              {lvl === "all" ? "Tất cả" : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Grid (150+ items) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "18px"
        }}
      >
        {filtered.map((item) => {
          const isLocked = item.is_pro && !isPro;

          return (
            <div
              key={item._id}
              onClick={() => {
                if (isLocked) {
                  setIsPremiumModalOpen(true);
                } else {
                  onOpenLesson(item.playableLesson || item);
                }
              }}
              style={{
                backgroundColor: "var(--card)",
                border: "2px solid var(--border)",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.15s ease",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
              className="hover:border-primary/60 hover:-translate-y-1"
            >
              {/* Thumbnail */}
              <div
                style={{
                  height: "150px",
                  backgroundColor: "#0d1629",
                  backgroundImage: `url('${item.thumbnail}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  position: "relative"
                }}
              >
                {item.duration && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: "8px",
                      right: "8px",
                      backgroundColor: "rgba(0,0,0,0.75)",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "4px"
                    }}
                  >
                    {item.duration}
                  </span>
                )}

                {isLocked && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(8, 14, 30, 0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      color: "#f59e0b",
                      fontWeight: 800,
                      fontSize: "14px"
                    }}
                  >
                    <Lock size={18} />
                    Mở khóa với PRO
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        backgroundColor: "var(--secondary)",
                        color: "var(--primary)",
                        padding: "2px 8px",
                        borderRadius: "6px"
                      }}
                    >
                      {item.difficulty || "B1"}
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                      {item.total_view_count ? `${Number(item.total_view_count).toLocaleString()} lượt xem` : "Bài mới"}
                    </span>
                  </div>

                  <h4
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "var(--foreground)",
                      marginBottom: "6px",
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {item.title}
                  </h4>
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "10px",
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "var(--muted-foreground)"
                  }}
                >
                  <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.topic}
                  </span>
                  <span style={{ color: "var(--primary)", fontWeight: 700 }}>Học ngay →</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
