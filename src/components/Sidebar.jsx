import React from "react";
import {
  House,
  BookOpen,
  Headphones,
  Repeat,
  BookText,
  Mic,
  ClipboardList,
  GraduationCap,
  Bookmark,
  Crown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  Trophy,
  ShoppingBag,
  Gamepad2
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Sidebar({ collapsed, setCollapsed }) {
  const { currentRoute, setCurrentRoute, isPro, setIsPremiumModalOpen, currentUser } = useApp();

  const studyItems = [
    { icon: House, label: "Trang chủ", route: "/vi/dashboard" },
    { icon: BookOpen, label: "Chủ đề", route: "/vi/topics" },
    { icon: Headphones, label: "Luyện nghe", route: "/vi/dictation" },
    { icon: Repeat, label: "Shadowing", route: "/vi/shadowing" },
    { icon: BookText, label: "Từ vựng (SRS)", route: "/vi/vocabulary" },
    { icon: Mic, label: "Luyện nói AI", route: "/vi/practice-english-speaking" },
    { icon: ClipboardList, label: "Luyện thi TOEIC", route: "/vi/exams/toeic" },
    { icon: GraduationCap, label: "Luyện thi IELTS", route: "/vi/exams/ielts" },
    { icon: Gamepad2, label: "Trò Chơi", route: "/vi/games" },
    { icon: Bookmark, label: "Sổ tay ghi chú", route: "/vi/my-notes" }
  ];

  const communityItems = [
    { icon: Trophy, label: "Bảng xếp hạng", route: "/vi/leaderboard" }
  ];

  const utilityItems = [
    { icon: ShoppingBag, label: "Đổi quà", route: "/vi/shop" }
  ];

  if (currentUser?.role === "admin") {
    utilityItems.push({
      icon: Shield,
      label: "Quản trị Admin",
      route: "/vi/admin",
      isAdmin: true
    });
  }

  const sidebarWidth = collapsed ? "70px" : "240px";

  return (
    <aside
      style={{
        width: sidebarWidth,
        height: "calc(100vh - 64px)",
        borderRight: "2px solid var(--border)",
        backgroundColor: "var(--background)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "width 0.25s ease",
        flexShrink: 0,
        overflow: "hidden"
      }}
    >
      <div style={{ padding: "12px 8px", overflowY: "auto", flex: 1 }}>
        {/* 1. Study Navigation Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {studyItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;

            return (
              <button
                key={item.route}
                onClick={() => setCurrentRoute(item.route)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "9px 13px",
                  borderRadius: "12px",
                  border: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                  backgroundColor: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                  fontWeight: 700,
                  fontSize: "13px",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap"
                }}
                className="hover:bg-muted hover:text-foreground"
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* 2. Community Items */}
        <div style={{ margin: "14px 0 4px 0", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
          {!collapsed && (
            <p style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", paddingLeft: "10px", marginBottom: "6px", letterSpacing: "0.08em" }}>
              Cộng đồng
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {communityItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => setCurrentRoute(item.route)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "9px 13px",
                    borderRadius: "12px",
                    border: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                    backgroundColor: isActive ? "var(--accent)" : "transparent",
                    color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap"
                  }}
                  className="hover:bg-muted hover:text-foreground"
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Utility Items */}
        <div style={{ margin: "10px 0 4px 0", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
          {!collapsed && (
            <p style={{ fontSize: "10px", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", paddingLeft: "10px", marginBottom: "6px", letterSpacing: "0.08em" }}>
              Tiện ích
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {utilityItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => setCurrentRoute(item.route)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "9px 13px",
                    borderRadius: "12px",
                    border: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                    backgroundColor: isActive ? "var(--accent)" : "transparent",
                    color: isActive ? "var(--primary)" : "var(--muted-foreground)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap"
                  }}
                  className="hover:bg-muted hover:text-foreground"
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Pro Banner Promo inside Sidebar */}
        {!collapsed && !isPro && (
          <div
            onClick={() => setIsPremiumModalOpen(true)}
            style={{
              margin: "18px 4px 6px 4px",
              padding: "14px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)",
              border: "1px solid #f59e0b",
              cursor: "pointer",
              transition: "transform 0.15s ease"
            }}
            className="hover:scale-[1.02]"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Crown size={18} color="#f59e0b" />
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#f59e0b" }}>
                Sorata Premium
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: 1.4, marginBottom: "8px" }}>
              Mở khóa 1.000+ bài học, đề thi TOEIC & tạo bài từ YouTube!
            </p>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#0f172a",
                backgroundColor: "#f59e0b",
                padding: "3px 8px",
                borderRadius: "6px",
                display: "inline-block"
              }}
            >
              Nâng cấp ngay →
            </span>
          </div>
        )}
      </div>

      {/* Collapse button */}
      <div style={{ padding: "8px", borderTop: "2px solid var(--border)" }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "transparent",
            color: "var(--muted-foreground)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: 700
          }}
          className="hover:bg-muted hover:text-foreground"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Thu gọn thanh bên</span>}
        </button>
      </div>
    </aside>
  );
}
