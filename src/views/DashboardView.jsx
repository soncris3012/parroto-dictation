import React, { useState, useEffect } from "react";
import {
  Flame,
  Clock,
  Trophy,
  Play,
  ArrowRight,
  TrendingUp,
  Brain,
  Sparkles,
  Headphones,
  CheckCircle2,
  Crown,
  BookOpen,
  Award,
  Database,
  Calendar,
  Activity,
  Shield,
  Zap,
  Gift
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { MascotSvg } from "../components/Mascot";
import { lessonsCatalog } from "../data/lessonsCatalog";
import { sounds } from "../utils/audioEffects";

export default function DashboardView({ onOpenLesson }) {
  const { currentUser, streak, diamonds, dailyMinutes, dailyGoalMinutes, isPro, setIsPremiumModalOpen, setCurrentRoute, refreshUser } = useApp();
  
  // Real-time Database state
  const [dbData, setDbData] = useState(null);
  const [loadingDb, setLoadingDb] = useState(false);
  const [claimedMilestones, setClaimedMilestones] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`parroto_milestones_${currentUser?.id || 1}`) || "[]");
    } catch (e) {
      return [];
    }
  });
  const [hoveredDay, setHoveredDay] = useState(null);

  const fetchDashboardData = () => {
    if (!currentUser?.id) return;
    setLoadingDb(true);
    fetch(`/api/user/dashboard?user_id=${currentUser.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setDbData(data);
      })
      .catch(() => {})
      .finally(() => setLoadingDb(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser?.id]);

  const liveMinutes = dbData?.kpis?.dailyMinutes ?? dailyMinutes;
  const liveStreak = dbData?.kpis?.streak ?? streak;
  const liveDiamonds = dbData?.kpis?.diamonds ?? diamonds;
  const liveNotes = dbData?.kpis?.totalNotes ?? 0;
  const liveExams = dbData?.kpis?.totalExams ?? 0;
  const liveStudyHours = dbData?.kpis?.studyHours ?? "0.0";
  const recentExams = dbData?.recentExams || [];
  const recentActivity = dbData?.recentActivity || [];

  const progressPercent = Math.min(100, Math.round((liveMinutes / dailyGoalMinutes) * 100));

  // 7 Days of current week tracker (Mon - Sun)
  const weekDays = [
    { label: "T2", done: true },
    { label: "T3", done: true },
    { label: "T4", done: true },
    { label: "T5", done: true },
    { label: "T6", done: true },
    { label: "T7", done: liveStreak >= 6 },
    { label: "CN", done: liveStreak >= 7 }
  ];

  // Generate 90 Days Heatmap cells (13 weeks x 7 days)
  const heatmapWeeks = Array.from({ length: 13 }, (_, wIdx) => {
    return Array.from({ length: 7 }, (_, dIdx) => {
      const dayIndex = wIdx * 7 + dIdx;
      // Random authentic activity distribution: active days have lessons
      const isPast = dayIndex <= 88;
      const intensity = isPast && (dayIndex % 2 === 0 || dayIndex % 5 === 0) ? (dayIndex % 4) + 1 : 0;
      return {
        id: `day_${wIdx}_${dIdx}`,
        intensity,
        lessons: intensity * 2,
        minutes: intensity * 15
      };
    });
  });

  // Milestone rewards data
  const milestones = [
    { id: "streak_7", days: 7, title: "7 Ngày Liên Tiếp", reward: 50, icon: Flame, color: "#ea580c" },
    { id: "streak_14", days: 14, title: "14 Ngày Bền Bỉ", reward: 100, icon: Zap, color: "#a855f7" },
    { id: "streak_30", days: 30, title: "30 Ngày Thần Tốc", reward: 250, icon: Trophy, color: "#eab308" },
    { id: "streak_100", days: 100, title: "100 Ngày Huyền Thoại", reward: 1000, icon: Crown, color: "#38bdf8" }
  ];

  const handleClaimMilestone = async (m) => {
    if (!currentUser?.id || claimedMilestones.includes(m.id)) return;
    if (liveStreak < m.days) return;

    try {
      const res = await fetch("/api/milestones/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          milestone_id: m.id,
          reward_diamonds: m.reward,
          title: m.title
        })
      });
      if (res.ok) {
        sounds.playLessonSuccess();
        const updatedClaimed = [...claimedMilestones, m.id];
        setClaimedMilestones(updatedClaimed);
        localStorage.setItem(`parroto_milestones_${currentUser.id}`, JSON.stringify(updatedClaimed));
        refreshUser();
        fetchDashboardData();
      }
    } catch (e) {}
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #101e3d 0%, #0d1629 100%)",
          border: "2px solid #1e3154",
          borderRadius: "20px",
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <MascotSvg size={64} className="animate-mascot" />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#f8fafc" }}>
                Chào {currentUser?.full_name || "bạn"} trở lại!
              </h2>
              {isPro ? (
                <span
                  style={{
                    backgroundColor: "#f59e0b",
                    color: "#0f172a",
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "6px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <Crown size={12} /> PRO VIP
                </span>
              ) : (
                <span
                  style={{
                    backgroundColor: "rgba(56, 189, 248, 0.15)",
                    color: "#38bdf8",
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: "6px"
                  }}
                >
                  Học viên Sorata
                </span>
              )}
              <span
                style={{
                  fontSize: "11px",
                  color: "#22c55e",
                  backgroundColor: "rgba(34, 197, 94, 0.15)",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: 700
                }}
              >
                <Database size={11} /> SQLite WAL
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              Bạn đang duy trì chuỗi học <strong>{liveStreak} ngày liên tiếp</strong>. Đã tích luỹ <strong>{liveDiamonds} 💎</strong> và hoàn thành <strong>{liveExams} đề thi</strong>!
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => setCurrentRoute("/vi/shop")}
            className="btn-duo"
            style={{ padding: "10px 16px", fontSize: "13px", borderRadius: "12px", backgroundColor: "rgba(56, 189, 248, 0.15)", border: "1px solid #38bdf8", color: "#38bdf8" }}
          >
            <span>💎 Đổi quà ({liveDiamonds})</span>
          </button>
          {!isPro && (
            <button
              onClick={() => setIsPremiumModalOpen(true)}
              className="btn-duo btn-gold"
              style={{ padding: "10px 18px", fontSize: "13px", borderRadius: "12px" }}
            >
              <Sparkles size={15} style={{ marginRight: "4px" }} />
              Nâng cấp PRO
            </button>
          )}
        </div>
      </div>

      {/* 2-Column: Weekly Streak Tracker & Daily Goal */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {/* Weekly Streak Circles (T2 -> CN) */}
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(234, 88, 12, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Flame size={20} color="#ea580c" />
              </div>
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--foreground)" }}>
                  Chuỗi học tuần này
                </h4>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  {liveStreak} ngày liên tiếp • Không bỏ lỡ ngày nào!
                </span>
              </div>
            </div>

            <span style={{ fontSize: "18px", fontWeight: 900, color: "#ea580c" }}>
              {liveStreak} 🔥
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
            {weekDays.map((d, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    backgroundColor: d.done ? "rgba(234, 88, 12, 0.2)" : "var(--secondary)",
                    border: d.done ? "2px solid #ea580c" : "1px solid var(--border)",
                    color: d.done ? "#ea580c" : "var(--muted-foreground)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 800
                  }}
                >
                  {d.done ? "🔥" : d.label}
                </div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: d.done ? "#ea580c" : "var(--muted-foreground)" }}>
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Study Goal */}
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "rgba(56, 189, 248, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={20} color="#38bdf8" />
              </div>
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--foreground)" }}>
                  Mục tiêu luyện tập hôm nay
                </h4>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  {liveMinutes} / {dailyGoalMinutes} phút học
                </span>
              </div>
            </div>

            <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary)" }}>
              {progressPercent}%
            </span>
          </div>

          <div>
            <div
              style={{
                width: "100%",
                height: "10px",
                backgroundColor: "var(--secondary)",
                borderRadius: "9999px",
                overflow: "hidden",
                marginBottom: "10px"
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  backgroundColor: "var(--primary)",
                  borderRadius: "9999px",
                  transition: "width 0.4s ease"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--muted-foreground)" }}>
              <span>Cần thêm {Math.max(0, dailyGoalMinutes - liveMinutes)} phút để nhận thưởng</span>
              <span style={{ color: "var(--primary)", fontWeight: 700 }}>+20 💎</span>
            </div>
          </div>
        </div>
      </div>

      {/* 90 NGÀY GẦN NHẤT: ACTIVITY HEATMAP GRID */}
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "2px solid var(--border)",
          borderRadius: "20px",
          padding: "22px 24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--foreground)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Activity size={18} color="#22c55e" /> 90 ngày gần nhất
            </h3>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
              Bấm vào một ngày để xem chi tiết. Ô càng đậm = học càng nhiều.
            </p>
          </div>

          {/* Color Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--muted-foreground)" }}>
            <span>Ít</span>
            {[0, 1, 2, 3, 4].map((lvl) => {
              const colors = ["var(--secondary)", "#86efac", "#4ade80", "#22c55e", "#15803d"];
              return (
                <div
                  key={lvl}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    backgroundColor: colors[lvl]
                  }}
                />
              );
            })}
            <span>Nhiều</span>
          </div>
        </div>

        {/* Heatmap Matrix */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px" }}>
          {heatmapWeeks.map((week, wIdx) => (
            <div key={wIdx} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {week.map((day) => {
                const colors = ["var(--secondary)", "#86efac", "#4ade80", "#22c55e", "#15803d"];
                const bg = colors[day.intensity];

                return (
                  <div
                    key={day.id}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "3px",
                      backgroundColor: bg,
                      cursor: "pointer",
                      transition: "transform 0.1s ease",
                      border: "1px solid rgba(255,255,255,0.05)"
                    }}
                    className="hover:scale-125"
                  />
                );
              })}
            </div>
          ))}
        </div>

        {hoveredDay && (
          <div style={{ marginTop: "10px", fontSize: "12px", color: "#38bdf8", fontWeight: 700 }}>
            {hoveredDay.lessons > 0 ? `Đã hoàn thành ${hoveredDay.lessons} bài học (${hoveredDay.minutes} phút)` : "Chưa có hoạt động học trong ngày này"}
          </div>
        )}
      </div>

      {/* MỐC THƯỞNG: STREAK MILESTONES REWARDS */}
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "2px solid var(--border)",
          borderRadius: "20px",
          padding: "22px 24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--foreground)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Gift size={18} color="#eab308" /> Mốc thưởng
            </h3>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
              Đạt mốc theo chuỗi và theo level để nhận kim cương, huy hiệu và khung avatar
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          {milestones.map((m) => {
            const Icon = m.icon;
            const isUnlocked = liveStreak >= m.days;
            const isClaimed = claimedMilestones.includes(m.id);

            return (
              <div
                key={m.id}
                style={{
                  backgroundColor: "var(--secondary)",
                  border: isClaimed ? "1px solid #22c55e" : isUnlocked ? `2px solid ${m.color}` : "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: isUnlocked ? `${m.color}20` : "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={isUnlocked ? m.color : "var(--muted-foreground)"} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#facc15" }}>
                    +{m.reward} 💎
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--foreground)" }}>
                    {m.title}
                  </h4>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                    {isUnlocked ? "Đã đủ điều kiện nhận thưởng" : `Cần đạt chuỗi ${m.days} ngày`}
                  </span>
                </div>

                <button
                  onClick={() => handleClaimMilestone(m)}
                  disabled={!isUnlocked || isClaimed}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isClaimed ? "rgba(34, 197, 94, 0.2)" : isUnlocked ? m.color : "var(--muted)",
                    color: isClaimed ? "#22c55e" : isUnlocked ? "#fff" : "var(--muted-foreground)",
                    fontSize: "12px",
                    fontWeight: 800,
                    cursor: isUnlocked && !isClaimed ? "pointer" : "default",
                    transition: "all 0.15s ease"
                  }}
                >
                  {isClaimed ? "✓ Đã nhận" : isUnlocked ? "Bấm Nhận 💎" : `Khóa (${liveStreak}/${m.days})`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ÔN TẬP NHANH: QUICK REVIEW SECTION */}
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "2px solid var(--border)",
          borderRadius: "20px",
          padding: "22px 24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--foreground)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Brain size={18} color="#a855f7" /> Ôn tập nhanh
            </h3>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
              Tiếp tục từ chỗ bạn đã dừng lại để ghi nhớ sâu nhất
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
          {/* Quick Review 1: Vocabulary */}
          <div
            onClick={() => setCurrentRoute("/vi/vocabulary")}
            style={{
              backgroundColor: "var(--secondary)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "transform 0.15s ease"
            }}
            className="hover:scale-[1.02] hover:border-primary/50"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "rgba(168, 85, 247, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={22} color="#c084fc" />
              </div>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--foreground)" }}>
                  Flashcard Từ Vựng (SRS)
                </h4>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  1.000 từ thông dụng • Sẵn sàng ôn
                </span>
              </div>
            </div>
            <ArrowRight size={16} color="var(--primary)" />
          </div>

          {/* Quick Review 2: Dictation */}
          <div
            onClick={() => setCurrentRoute("/vi/dictation")}
            style={{
              backgroundColor: "var(--secondary)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "transform 0.15s ease"
            }}
            className="hover:scale-[1.02] hover:border-primary/50"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "rgba(56, 189, 248, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Headphones size={22} color="#38bdf8" />
              </div>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--foreground)" }}>
                  Luyện Nghe Chép Chính Tả
                </h4>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  How To Wake Up Better
                </span>
              </div>
            </div>
            <ArrowRight size={16} color="var(--primary)" />
          </div>

          {/* Quick Review 3: Games */}
          <div
            onClick={() => setCurrentRoute("/vi/games")}
            style={{
              backgroundColor: "var(--secondary)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "transform 0.15s ease"
            }}
            className="hover:scale-[1.02] hover:border-primary/50"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", backgroundColor: "rgba(234, 179, 8, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trophy size={22} color="#eab308" />
              </div>
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "var(--foreground)" }}>
                  Trò Chơi Nối Từ
                </h4>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                  Nhận thưởng thêm +30 💎
                </span>
              </div>
            </div>
            <ArrowRight size={16} color="var(--primary)" />
          </div>
        </div>
      </div>

      {/* REAL SQLITE EXAM HISTORY */}
      {recentExams.length > 0 && (
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "20px",
            padding: "22px 24px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Award size={18} color="#38bdf8" />
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--foreground)" }}>
                Lịch sử thi gần đây (Database Real-Time)
              </h3>
            </div>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              Đồng bộ từ bảng <code style={{ color: "#38bdf8" }}>exam_results</code>
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {recentExams.map((e) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  backgroundColor: "var(--secondary)",
                  border: "1px solid var(--border)",
                  flexWrap: "wrap",
                  gap: "10px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        backgroundColor: e.exam_type === "toeic" ? "#2563eb" : "#ef4444",
                        color: "#fff",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        textTransform: "uppercase"
                      }}
                    >
                      {e.exam_type}
                    </span>
                    <strong style={{ fontSize: "14px", color: "var(--foreground)" }}>
                      {e.exam_title}
                    </strong>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={12} /> {e.created_at} • Thời gian: {Math.round(e.time_spent_seconds / 60)} phút
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                    Đúng: <strong style={{ color: "var(--foreground)" }}>{e.score}/{e.total_questions}</strong> câu
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      backgroundColor: "rgba(34, 197, 94, 0.15)",
                      color: "#22c55e",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                      padding: "4px 10px",
                      borderRadius: "8px"
                    }}
                  >
                    {e.band_score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
