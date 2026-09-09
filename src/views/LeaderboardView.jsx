import React, { useState, useEffect } from "react";
import {
  Trophy,
  Flame,
  Crown,
  Medal,
  Sparkles,
  Search,
  Shield,
  ArrowUp,
  User,
  Database
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function LeaderboardView() {
  const { currentUser } = useApp();
  const [filter, setFilter] = useState("diamonds"); // 'diamonds' | 'streak'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?filter=${filter}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setLeaderboard(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const restList = leaderboard.slice(3);

  // Check if current user is in top 30
  const myRankIndex = leaderboard.findIndex((u) => u.id === currentUser?.id);
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : "30+";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
      {/* Header Banner */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "rgba(234, 179, 8, 0.2)",
              border: "2px solid #eab308",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Trophy size={32} color="#eab308" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#f8fafc" }}>
                Bảng Xếp Hạng Học Viên
              </h2>
              <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "rgba(34, 197, 94, 0.2)", color: "#22c55e", padding: "2px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Database size={12} /> SQLite Real-Time
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              Vinh danh những học viên chăm chỉ và đạt thành tích xuất sắc nhất trên Sorata
            </p>
          </div>
        </div>

        {/* Filter Switcher */}
        <div style={{ display: "flex", backgroundColor: "#13213c", padding: "4px", borderRadius: "12px", border: "1px solid #1e3154" }}>
          <button
            onClick={() => setFilter("diamonds")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: filter === "diamonds" ? "#2563eb" : "transparent",
              color: filter === "diamonds" ? "#fff" : "#94a3b8",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>💎 Theo Kim Cương</span>
          </button>
          <button
            onClick={() => setFilter("streak")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: filter === "streak" ? "#ea580c" : "transparent",
              color: filter === "streak" ? "#fff" : "#94a3b8",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>🔥 Chuỗi Ngày Học</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {leaderboard.length >= 3 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr 1fr",
            gap: "16px",
            alignItems: "flex-end",
            margin: "10px 0"
          }}
        >
          {/* Rank 2 (Silver) */}
          {top2 && (
            <div
              style={{
                backgroundColor: "var(--card)",
                border: "2px solid #94a3b8",
                borderRadius: "20px",
                padding: "20px 16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={top2.avatar}
                  alt={top2.full_name}
                  style={{ width: "64px", height: "64px", borderRadius: "50%", border: "3px solid #94a3b8" }}
                />
                <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#94a3b8", color: "#0f172a", fontWeight: 900, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  2
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px" }}>
                  {top2.full_name}
                </h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "4px" }}>
                  {top2.is_pro === 1 && (
                    <span style={{ backgroundColor: "#f59e0b", color: "#0f172a", fontSize: "10px", fontWeight: 800, padding: "1px 5px", borderRadius: "4px" }}>
                      PRO
                    </span>
                  )}
                  <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                    🔥 {top2.streak} ngày
                  </span>
                </div>
              </div>
              <div style={{ backgroundColor: "var(--secondary)", padding: "6px 14px", borderRadius: "10px", fontWeight: 800, color: "#38bdf8", fontSize: "14px" }}>
                {filter === "diamonds" ? `${top2.diamonds} 💎` : `${top2.streak} Ngày 🔥`}
              </div>
            </div>
          )}

          {/* Rank 1 (Gold Champion) */}
          {top1 && (
            <div
              style={{
                backgroundColor: "var(--card)",
                border: "3px solid #eab308",
                borderRadius: "24px",
                padding: "26px 18px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                boxShadow: "0 12px 35px rgba(234, 179, 8, 0.25)",
                transform: "translateY(-10px)"
              }}
            >
              <div style={{ position: "relative" }}>
                <Crown size={32} color="#eab308" style={{ position: "absolute", top: "-28px", left: "50%", transform: "translateX(-50%)" }} />
                <img
                  src={top1.avatar}
                  alt={top1.full_name}
                  style={{ width: "80px", height: "80px", borderRadius: "50%", border: "4px solid #eab308", boxShadow: "0 0 20px rgba(234, 179, 8, 0.4)" }}
                />
                <div style={{ position: "absolute", top: "-8px", right: "-8px", width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "#eab308", color: "#0f172a", fontWeight: 900, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  1
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: "17px", fontWeight: 900, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "220px" }}>
                  {top1.full_name}
                </h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "4px" }}>
                  {top1.is_pro === 1 && (
                    <span style={{ backgroundColor: "#f59e0b", color: "#0f172a", fontSize: "11px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                      PRO QUÁN QUÂN
                    </span>
                  )}
                  {top1.role === "admin" && (
                    <span style={{ backgroundColor: "#ef4444", color: "#fff", fontSize: "11px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
              <div style={{ backgroundColor: "rgba(234, 179, 8, 0.2)", border: "1px solid #eab308", padding: "8px 18px", borderRadius: "12px", fontWeight: 900, color: "#facc15", fontSize: "16px" }}>
                {filter === "diamonds" ? `${top1.diamonds} 💎` : `${top1.streak} Ngày 🔥`}
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3 && (
            <div
              style={{
                backgroundColor: "var(--card)",
                border: "2px solid #b45309",
                borderRadius: "20px",
                padding: "20px 16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
              }}
            >
              <div style={{ position: "relative" }}>
                <img
                  src={top3.avatar}
                  alt={top3.full_name}
                  style={{ width: "64px", height: "64px", borderRadius: "50%", border: "3px solid #b45309" }}
                />
                <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "26px", height: "26px", borderRadius: "50%", backgroundColor: "#b45309", color: "#fff", fontWeight: 900, fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  3
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--foreground)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px" }}>
                  {top3.full_name}
                </h4>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "4px" }}>
                  {top3.is_pro === 1 && (
                    <span style={{ backgroundColor: "#f59e0b", color: "#0f172a", fontSize: "10px", fontWeight: 800, padding: "1px 5px", borderRadius: "4px" }}>
                      PRO
                    </span>
                  )}
                  <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                    🔥 {top3.streak} ngày
                  </span>
                </div>
              </div>
              <div style={{ backgroundColor: "var(--secondary)", padding: "6px 14px", borderRadius: "10px", fontWeight: 800, color: "#ea580c", fontSize: "14px" }}>
                {filter === "diamonds" ? `${top3.diamonds} 💎` : `${top3.streak} Ngày 🔥`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Current Position Bar */}
      {currentUser && (
        <div
          style={{
            backgroundColor: "rgba(56, 189, 248, 0.15)",
            border: "2px solid #38bdf8",
            borderRadius: "16px",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "18px", fontWeight: 900, color: "#38bdf8", width: "36px" }}>
              #{myRank}
            </span>
            <img
              src={currentUser.avatar}
              alt={currentUser.full_name}
              style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid #38bdf8" }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "15px", fontWeight: 800, color: "#f8fafc" }}>
                  {currentUser.full_name} (Bạn)
                </span>
                {currentUser.is_pro === 1 && (
                  <span style={{ backgroundColor: "#f59e0b", color: "#0f172a", fontSize: "10px", fontWeight: 800, padding: "1px 5px", borderRadius: "4px" }}>
                    PRO
                  </span>
                )}
              </div>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                Thứ hạng hiện tại trên bảng xếp hạng toàn bộ học viên
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: "#ea580c" }}>
              🔥 {currentUser.streak || 1} ngày
            </span>
            <span style={{ fontSize: "15px", fontWeight: 900, color: "#38bdf8" }}>
              💎 {currentUser.diamonds || 100}
            </span>
          </div>
        </div>
      )}

      {/* Ranks 4 to 30 List */}
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "2px solid var(--border)",
          borderRadius: "20px",
          padding: "16px 20px"
        }}
      >
        <h4 style={{ fontSize: "15px", fontWeight: 800, color: "var(--foreground)", marginBottom: "14px" }}>
          Bảng xếp hạng tổng thể
        </h4>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {restList.map((user, idx) => {
            const rank = idx + 4;
            const isMe = user.id === currentUser?.id;

            return (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  backgroundColor: isMe ? "rgba(56, 189, 248, 0.15)" : "var(--secondary)",
                  border: isMe ? "2px solid #38bdf8" : "1px solid var(--border)",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--muted-foreground)", width: "24px", textAlign: "center" }}>
                    {rank}
                  </span>
                  <img
                    src={user.avatar}
                    alt={user.full_name}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid var(--border)" }}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)" }}>
                        {user.full_name}
                      </span>
                      {user.is_pro === 1 && (
                        <span style={{ backgroundColor: "#f59e0b", color: "#0f172a", fontSize: "10px", fontWeight: 800, padding: "1px 5px", borderRadius: "4px" }}>
                          PRO
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                      Kênh: {user.provider.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "13px", color: "#ea580c", fontWeight: 700 }}>
                    🔥 {user.streak}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--primary)", width: "80px", textAlign: "right" }}>
                    {filter === "diamonds" ? `${user.diamonds} 💎` : `${user.streak} Ngày`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
