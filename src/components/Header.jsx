import React, { useState, useRef, useEffect } from "react";
import { Search, Flame, Moon, Sun, Menu, Crown, Sparkles, Shield, User, LogOut, LogIn, ChevronDown } from "lucide-react";
import { MascotSvg } from "./Mascot";
import { useApp } from "../context/AppContext";

export default function Header({ theme, setTheme, onOpenDictionary, toggleSidebar }) {
  const {
    streak,
    diamonds,
    isPro,
    setIsPremiumModalOpen,
    setCurrentRoute,
    currentUser,
    setIsAuthModalOpen,
    logout
  } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      style={{
        height: "64px",
        borderBottom: "2px solid var(--border)",
        backgroundColor: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        position: "sticky",
        top: 0,
        zIndex: 40,
        flexShrink: 0
      }}
    >
      {/* Left: Menu toggle & Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={toggleSidebar}
          className="btn-ghost"
          style={{
            border: "none",
            borderRadius: "8px",
            padding: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          title="Thu gọn / Mở rộng menu"
        >
          <Menu size={20} />
        </button>

        <div
          onClick={() => setCurrentRoute("/vi/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer"
          }}
        >
          <MascotSvg size={34} />
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontWeight: 800,
              fontSize: "22px",
              color: "var(--primary)",
              letterSpacing: "-0.5px"
            }}
          >
            Sorata
          </span>
          {isPro && (
            <span
              style={{
                backgroundColor: "#f59e0b",
                color: "#0f172a",
                fontSize: "10px",
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "2px"
              }}
            >
              <Crown size={11} /> PRO
            </span>
          )}
          {currentUser?.role === "admin" && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setCurrentRoute("/vi/admin");
              }}
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                fontSize: "10px",
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
                cursor: "pointer"
              }}
              title="Đi tới trang Bảng điều khiển Quản trị viên"
            >
              <Shield size={11} /> ADMIN
            </span>
          )}
        </div>

        {/* Quick Dictionary Button */}
        <button
          onClick={onOpenDictionary}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "9999px",
            border: "2px solid var(--border)",
            backgroundColor: "var(--muted)",
            color: "var(--muted-foreground)",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            marginLeft: "8px",
            transition: "all 0.15s ease"
          }}
          className="hover:border-primary/40"
        >
          <Search size={15} />
          <span>Tra từ điển</span>
        </button>
      </div>

      {/* Right Stats & Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Admin Direct Button (if admin) */}
        {currentUser?.role === "admin" && (
          <button
            onClick={() => setCurrentRoute("/vi/admin")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            <Shield size={14} /> Quản Trị Web
          </button>
        )}

        {/* Pro Upgrade Button (or Pro Active Badge) */}
        {!isPro ? (
          <button
            onClick={() => setIsPremiumModalOpen(true)}
            className="btn-duo btn-gold"
            style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Crown size={14} />
            <span>Nâng cấp Pro</span>
          </button>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              border: "1px solid #f59e0b",
              color: "#f59e0b",
              padding: "4px 12px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 800
            }}
          >
            <Crown size={14} />
            <span>Thành viên PRO</span>
          </div>
        )}

        {/* Streak Flame */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#ea580c",
            fontWeight: 800,
            fontSize: "14px"
          }}
          title="Chuỗi ngày học liên tiếp (Streak)"
        >
          <Flame size={18} fill="#ea580c" />
          <span>{streak}</span>
        </div>

        {/* Diamonds XP */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#38bdf8",
            fontWeight: 800,
            fontSize: "14px"
          }}
          title="Kim cương & Điểm kinh nghiệm"
        >
          <span style={{ fontSize: "16px" }}>💎</span>
          <span>{diamonds}</span>
        </div>

        {/* Language selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 8px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--foreground)"
          }}
        >
          <span>🇻🇳</span>
          <span>VN</span>
        </div>

        {/* Dark mode switch */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="btn-ghost"
          style={{
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--foreground)"
          }}
          title="Chuyển chế độ sáng/tối"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Account / Login Button */}
        {currentUser ? (
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                padding: "3px 6px 3px 3px",
                borderRadius: "9999px",
                backgroundColor: "var(--secondary)",
                border: "1px solid var(--border)"
              }}
            >
              <img
                src={currentUser.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=SonCris"}
                alt={currentUser.full_name}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: isPro ? "2px solid #f59e0b" : "2px solid var(--primary)"
                }}
              />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground)", maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser.full_name.split(" ").slice(-1)[0]}
              </span>
              <ChevronDown size={14} color="var(--muted-foreground)" />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "42px",
                  right: 0,
                  width: "240px",
                  backgroundColor: "#0d1527",
                  border: "2px solid #1e3154",
                  borderRadius: "16px",
                  padding: "12px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                {/* User info */}
                <div style={{ borderBottom: "1px solid #1e3154", paddingBottom: "10px" }}>
                  <p style={{ fontSize: "14px", fontWeight: 800, color: "#f8fafc" }}>
                    {currentUser.full_name}
                  </p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentUser.email}
                  </p>
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                    {isPro && (
                      <span style={{ backgroundColor: "#f59e0b", color: "#000", fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                        PRO VIP
                      </span>
                    )}
                    <span style={{ backgroundColor: currentUser.role === "admin" ? "#ef4444" : "#3b82f6", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                      {currentUser.role === "admin" ? "ADMINISTRATOR" : "HỌC VIÊN"}
                    </span>
                  </div>
                </div>

                {/* Admin Shortcut */}
                {currentUser.role === "admin" && (
                  <button
                    onClick={() => {
                      setCurrentRoute("/vi/admin");
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 10px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "rgba(239, 68, 68, 0.15)",
                      color: "#f87171",
                      fontWeight: 700,
                      fontSize: "13px",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left"
                    }}
                  >
                    <Shield size={16} /> Bảng Điều Khiển Admin
                  </button>
                )}

                {/* Switch / Login other account */}
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#f8fafc",
                    fontWeight: 600,
                    fontSize: "13px",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left"
                  }}
                  className="hover:bg-slate-800"
                >
                  <User size={16} /> Đổi Tài Khoản / Đăng Ký
                </button>

                {/* Logout */}
                <button
                  onClick={() => {
                    logout();
                    setIsDropdownOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#ef4444",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left"
                  }}
                  className="hover:bg-red-500/10"
                >
                  <LogOut size={16} /> Đăng Xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="btn-duo btn-primary"
            style={{
              padding: "6px 14px",
              borderRadius: "9999px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <LogIn size={15} />
            <span>Đăng Nhập</span>
          </button>
        )}
      </div>
    </header>
  );
}
