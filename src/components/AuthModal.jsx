import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  CheckCircle2,
  Shield,
  ArrowRight,
  Database,
  Crown,
  ChevronRight,
  ArrowLeft
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, oauthLogin, googleVerify } = useApp();
  const [tab, setTab] = useState("login"); // 'login' | 'register'
  const [oauthProvider, setOauthProvider] = useState(null); // null | 'google' | 'facebook' | 'apple'
  
  // Standard Email/Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // OAuth Form
  const [oauthEmail, setOauthEmail] = useState("");
  const [oauthFullName, setOauthFullName] = useState("");

  // Real Database Accounts
  const [recentDbUsers, setRecentDbUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Fetch real users from SQLite Database on modal open
  useEffect(() => {
    if (isOpen) {
      setError("");
      setOauthProvider(null);
      setLoadingUsers(true);
      fetch("/api/auth/recent-users")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setRecentDbUsers(data);
        })
        .catch(() => {})
        .finally(() => setLoadingUsers(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Submit standard Email & Password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Switch to Provider-specific Account Form
  const startOAuth = (provider) => {
    setError("");
    setOauthProvider(provider);
    setOauthEmail("");
    setOauthFullName("");
  };
  
  // Confirm OAuth Login with user's real account data
  const handleConfirmOAuth = async (e) => {
    e.preventDefault();
    setError("");
    if (!oauthEmail || !oauthEmail.includes("@")) {
      setError("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }

    setLoading(true);
    try {
      const email = oauthEmail.trim().toLowerCase();
      const name = oauthFullName.trim() || email.split("@")[0];
      await oauthLogin({
        provider: oauthProvider,
        email: email,
        full_name: name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || email)}`
      });
      onClose();
    } catch (err) {
      setError(err.message || "Đăng nhập OAuth thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click login into any real database account
  const handleDirectDbLogin = async (dbUser) => {
    setError("");
    setLoading(true);
    try {
      await oauthLogin({
        provider: dbUser.provider || "email",
        email: dbUser.email,
        full_name: dbUser.full_name,
        avatar: dbUser.avatar
      });
      onClose();
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3, 7, 18, 0.85)",
        backdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#0d1527",
          border: "2px solid #1e3154",
          borderRadius: "24px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
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
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Sparkles size={20} color="#38bdf8" />
              </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--foreground)" }}>
                {oauthProvider
                  ? `Đăng nhập qua ${oauthProvider === "google" ? "Google" : oauthProvider === "facebook" ? "Facebook" : "Apple"}`
                  : tab === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản Sorata"}
              </h3>
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                {oauthProvider
                  ? "Nhập email và họ tên của bạn để liên kết tài khoản"
                  : "Học tiếng Anh thông minh với AI & Lặp ngắt quãng"}
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

        {/* Error Notification */}
        {error && (
          <div
            style={{
              margin: "16px 24px 0",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "13px"
            }}
          >
            {error}
          </div>
        )}

        {/* Notification Overlay for OAuth */}
        {toastMessage && loading && (
          <div style={{ padding: "12px", textAlign: "center", color: "var(--primary)", fontWeight: 800 }}>
             {toastMessage}
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN LOGIN / REGISTER MODAL                               */}
        {/* ========================================================= */}
          <div style={{ padding: "20px 24px 24px" }}>
            {oauthProvider ? (
              <div>
                {/* Back button */}
                <div style={{ marginBottom: "16px" }}>
                  <button
                    type="button"
                    onClick={() => { setOauthProvider(null); setError(""); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "transparent",
                      border: "none",
                      color: "#38bdf8",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "4px 0"
                    }}
                  >
                    <ArrowLeft size={16} /> Quay lại phương thức khác
                  </button>
                </div>

                {/* Branded Banner */}
                <div
                  style={{
                    backgroundColor: oauthProvider === "google" ? "rgba(66, 133, 244, 0.1)" : oauthProvider === "facebook" ? "rgba(24, 119, 242, 0.1)" : "rgba(255, 255, 255, 0.08)",
                    border: `1px solid ${oauthProvider === "google" ? "rgba(66, 133, 244, 0.3)" : oauthProvider === "facebook" ? "rgba(24, 119, 242, 0.3)" : "rgba(255, 255, 255, 0.2)"}`,
                    borderRadius: "14px",
                    padding: "14px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      backgroundColor: oauthProvider === "google" ? "#fff" : oauthProvider === "facebook" ? "#1877F2" : "#000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    {oauthProvider === "google" && (
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                    )}
                    {oauthProvider === "facebook" && (
                      <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )}
                    {oauthProvider === "apple" && (
                      <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.35-.57.65-.99 1.71-.85 2.73.99.08 2.01-.51 2.55-1.23z"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#fff", marginBottom: "2px" }}>
                      Tài khoản {oauthProvider === "google" ? "Google" : oauthProvider === "facebook" ? "Facebook" : "Apple"} của bạn
                    </h4>
                    <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Nhập họ tên và email của bạn để đăng nhập nhanh không cần mật khẩu.
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleConfirmOAuth} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
                      Họ và Tên của bạn
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "#13213c",
                        border: "1px solid #1e3154",
                        borderRadius: "12px",
                        padding: "10px 14px"
                      }}
                    >
                      <User size={16} color="#94a3b8" />
                      <input
                        type="text"
                        required
                        value={oauthFullName}
                        onChange={(e) => setOauthFullName(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn An"
                        style={{
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "#fff",
                          fontSize: "14px",
                          width: "100%"
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
                      Địa chỉ Email {oauthProvider.toUpperCase()}
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "#13213c",
                        border: "1px solid #1e3154",
                        borderRadius: "12px",
                        padding: "10px 14px"
                      }}
                    >
                      <Mail size={16} color="#94a3b8" />
                      <input
                        type="email"
                        required
                        value={oauthEmail}
                        onChange={(e) => setOauthEmail(e.target.value)}
                        placeholder={oauthProvider === "google" ? "name@gmail.com" : "name@facebook.com"}
                        style={{
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "#fff",
                          fontSize: "14px",
                          width: "100%"
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: "13px",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: 800,
                      border: "none",
                      cursor: "pointer",
                      marginTop: "6px",
                      backgroundColor: oauthProvider === "google" ? "#1a73e8" : oauthProvider === "facebook" ? "#1877f2" : "#000",
                      color: "#fff",
                      boxShadow: `0 4px 15px ${oauthProvider === "google" ? "rgba(26, 115, 232, 0.4)" : oauthProvider === "facebook" ? "rgba(24, 119, 242, 0.4)" : "rgba(255, 255, 255, 0.2)"}`
                    }}
                  >
                    {loading ? "Đang xử lý..." : `Xác Nhận Đăng Nhập Với ${oauthProvider.toUpperCase()}`}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {/* Tab switchers */}
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "#13213c",
                    borderRadius: "12px",
                    padding: "4px",
                    marginBottom: "18px"
                  }}
                >
                  <button
                    onClick={() => { setTab("login"); setError(""); }}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: "none",
                      borderRadius: "9px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                      backgroundColor: tab === "login" ? "#2563eb" : "transparent",
                      color: tab === "login" ? "#fff" : "#94a3b8",
                      transition: "all 0.15s ease"
                    }}
                  >
                    Đăng Nhập
                  </button>
                  <button
                    onClick={() => { setTab("register"); setError(""); }}
                    style={{
                      flex: 1,
                      padding: "10px",
                      border: "none",
                      borderRadius: "9px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                      backgroundColor: tab === "register" ? "#2563eb" : "transparent",
                      color: tab === "register" ? "#fff" : "#94a3b8",
                      transition: "all 0.15s ease"
                    }}
                  >
                    Đăng Ký Mới
                  </button>
                </div>

                {/* Social OAuth Login buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => startOAuth("google")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      padding: "11px 16px",
                      backgroundColor: "#fff",
                      color: "#1e293b",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)"
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Đăng nhập với Google OAuth</span>
                  </button>

                  {/* Facebook & Apple */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => startOAuth("facebook")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px 14px",
                        backgroundColor: "#1877F2",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer"
                      }}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook OAuth
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => startOAuth("apple")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px 14px",
                        backgroundColor: "#000",
                        color: "#fff",
                        border: "1px solid #334155",
                        borderRadius: "12px",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer"
                      }}
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.35-.57.65-.99 1.71-.85 2.73.99.08 2.01-.51 2.55-1.23z"/>
                      </svg>
                      Apple OAuth
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0" }}>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#1e3154" }} />
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                    hoặc dùng Email & Mật khẩu
                  </span>
                  <div style={{ flex: 1, height: "1px", backgroundColor: "#1e3154" }} />
                </div>

                {/* Standard Email / Password Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {tab === "register" && (
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
                        Họ và tên
                      </label>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          backgroundColor: "#13213c",
                          border: "1px solid #1e3154",
                          borderRadius: "12px",
                          padding: "10px 14px"
                        }}
                      >
                        <User size={16} color="#94a3b8" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ví dụ: Nguyễn Văn An"
                          style={{
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            color: "#fff",
                            fontSize: "14px",
                            width: "100%"
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
                      Địa chỉ Email
                    </label>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "#13213c",
                        border: "1px solid #1e3154",
                        borderRadius: "12px",
                        padding: "10px 14px"
                      }}
                    >
                      <Mail size={16} color="#94a3b8" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        style={{
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "#fff",
                          fontSize: "14px",
                          width: "100%"
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>
                        Mật khẩu
                      </label>
                      {tab === "login" && (
                        <span style={{ fontSize: "12px", color: "#38bdf8", cursor: "pointer", fontWeight: 600 }}>
                          Quên mật khẩu?
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "#13213c",
                        border: "1px solid #1e3154",
                        borderRadius: "12px",
                        padding: "10px 14px"
                      }}
                    >
                      <Lock size={16} color="#94a3b8" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "#fff",
                          fontSize: "14px",
                          width: "100%"
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-duo btn-primary"
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      fontSize: "15px",
                      fontWeight: 800,
                      marginTop: "6px"
                    }}
                  >
                    {loading ? "Đang xử lý..." : tab === "login" ? "Đăng Nhập Ngay" : "Tạo Tài Khoản Miễn Phí"}
                  </button>
                </form>
              </div>
            )}

            {/* REAL DATABASE ACCOUNTS LIST FROM SQLITE */}
            <div
              style={{
                marginTop: "22px",
                paddingTop: "16px",
                borderTop: "1px dashed #1e3154"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Database size={13} /> Tài khoản thực tế trong Database SQLite ({recentDbUsers.length}):
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {recentDbUsers.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleDirectDbLogin(u)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      backgroundColor: "#13213c",
                      border: "1px solid #1e3154",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#38bdf8";
                      e.currentTarget.style.backgroundColor = "rgba(56, 189, 248, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#1e3154";
                      e.currentTarget.style.backgroundColor = "#13213c";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={u.avatar}
                        alt={u.full_name}
                        style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #38bdf8" }}
                      />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>
                            {u.full_name}
                          </span>
                          {u.is_pro === 1 && (
                            <span style={{ backgroundColor: "#f59e0b", color: "#0f172a", fontSize: "10px", fontWeight: 800, padding: "1px 5px", borderRadius: "4px" }}>
                              PRO
                            </span>
                          )}
                          {u.role === "admin" && (
                            <span style={{ backgroundColor: "#ef4444", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "1px 5px", borderRadius: "4px" }}>
                              ADMIN
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                          {u.email} • {u.provider.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>
                      Đăng nhập <ChevronRight size={14} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
