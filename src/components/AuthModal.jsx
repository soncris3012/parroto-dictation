import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  Shield,
  ShieldCheck,
  ArrowRight,
  Database,
  ChevronRight,
  ArrowLeft,
  Settings,
  Copy,
  Check,
  ExternalLink,
  Code2,
  KeyRound
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, oauthLogin } = useApp();
  const [tab, setTab] = useState("login"); // 'login' | 'register' | 'oauth_config'

  // Standard Email/Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // OAuth 2.0 Configuration State
  const [oauthConfig, setOauthConfig] = useState({
    google_client_id: "",
    facebook_app_id: "",
    is_google_configured: false,
    is_facebook_configured: false
  });
  const [cfgGoogleClientId, setCfgGoogleClientId] = useState("");
  const [cfgGoogleClientSecret, setCfgGoogleClientSecret] = useState("");
  const [cfgFacebookAppId, setCfgFacebookAppId] = useState("");
  const [cfgFacebookAppSecret, setCfgFacebookAppSecret] = useState("");
  const [copiedUri, setCopiedUri] = useState("");

  // Real Database Accounts
  const [recentDbUsers, setRecentDbUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const redirectUri = `${window.location.origin}/auth/callback`;

  // Fetch OAuth configuration & recent users
  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccessMsg("");
      fetch("/api/auth/oauth/config")
        .then((res) => (res.ok ? res.json() : {}))
        .then((data) => {
          if (data) {
            setOauthConfig(data);
            if (data.google_client_id) setCfgGoogleClientId(data.google_client_id);
            if (data.facebook_app_id) setCfgFacebookAppId(data.facebook_app_id);
          }
        })
        .catch(() => {});

      fetch("/api/auth/recent-users")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setRecentDbUsers(data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Copy URI to clipboard
  const handleCopyUri = (uri) => {
    navigator.clipboard.writeText(uri);
    setCopiedUri(uri);
    setTimeout(() => setCopiedUri(""), 2000);
  };

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

  // =====================================================================
  // BƯỚC 2: FRONTEND CHUYỂN HƯỚNG TRÌNH DUYỆT SANG GOOGLE / FACEBOOK OAUTH
  // =====================================================================
  const generateCsrfToken = (provider) => {
    const randomState = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("oauth_csrf_state", randomState);
    return JSON.stringify({ provider, csrf: randomState });
  };

  const handleGoogleOAuth2Redirect = () => {
    setError("");
    const clientId = oauthConfig.google_client_id || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      // Nếu chưa có Client ID, mở tab cấu hình để người dùng nhập
      setTab("oauth_config");
      setError("Bạn chưa cấu hình GOOGLE_CLIENT_ID. Vui lòng nhập Client ID và Client Secret bên dưới.");
      return;
    }

    // Tạo URL ủy quyền chuẩn Google OAuth 2.0 Authorization Code Flow
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "select_account");
    url.searchParams.set("state", generateCsrfToken("google"));

    window.location.href = url.toString();
  };

  const handleFacebookOAuth2Redirect = () => {
    setError("");
    const appId = oauthConfig.facebook_app_id || import.meta.env.VITE_FACEBOOK_APP_ID;

    if (!appId) {
      // Nếu chưa có App ID, mở tab cấu hình để người dùng nhập
      setTab("oauth_config");
      setError("Bạn chưa cấu hình FACEBOOK_APP_ID. Vui lòng nhập App ID và App Secret bên dưới.");
      return;
    }

    // Tạo URL ủy quyền chuẩn Facebook OAuth 2.0 Dialog
    const url = new URL("https://www.facebook.com/v18.0/dialog/oauth");
    url.searchParams.set("client_id", appId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "email,public_profile");
    url.searchParams.set("state", generateCsrfToken("facebook"));

    window.location.href = url.toString();
  };

  // Save OAuth Configuration to Server .env
  const handleSaveOAuthConfig = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/oauth/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          google_client_id: cfgGoogleClientId,
          google_client_secret: cfgGoogleClientSecret,
          facebook_app_id: cfgFacebookAppId,
          facebook_app_secret: cfgFacebookAppSecret
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu cấu hình");

      setOauthConfig(data);
      setSuccessMsg("Lưu cấu hình OAuth 2.0 thành công vào file .env!");
    } catch (err) {
      setError(err.message || "Lỗi lưu cấu hình OAuth");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Simulated Authorization Code Grant (Test backend code exchange)
  const handleSimulateOAuthCallback = (provider) => {
    onClose();
    // Simulate redirect with ?code=sim_code&state=provider
    const simCode = "sim_" + Math.random().toString(36).substring(2, 15);
    const simUrl = `/auth/callback?code=${simCode}&state=${encodeURIComponent(JSON.stringify({ provider }))}`;
    window.location.href = simUrl;
  };

  // Direct login for quick DB testing
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
        backdropFilter: "blur(10px)",
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
          maxWidth: tab === "oauth_config" ? "560px" : "480px",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.15)",
          animation: "scaleUp 0.18s ease-out",
          transition: "max-width 0.2s ease"
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
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
                {tab === "oauth_config"
                  ? "Cấu Hình OAuth 2.0 (Google & Meta)"
                  : tab === "login"
                  ? "Chào mừng trở lại!"
                  : "Tạo tài khoản Sorata"}
              </h3>
              <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                {tab === "oauth_config"
                  ? "Authorization Code Flow (Server-to-Server Exchange)"
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

        {/* Success Notification */}
        {successMsg && (
          <div
            style={{
              margin: "16px 24px 0",
              backgroundColor: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              color: "#4ade80",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "13px"
            }}
          >
            {successMsg}
          </div>
        )}

        <div style={{ padding: "20px 24px 24px" }}>
          {/* Tabs */}
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
              onClick={() => { setTab("login"); setError(""); setSuccessMsg(""); }}
              style={{
                flex: 1,
                padding: "9px",
                border: "none",
                borderRadius: "9px",
                fontWeight: 700,
                fontSize: "13.5px",
                cursor: "pointer",
                backgroundColor: tab === "login" ? "#2563eb" : "transparent",
                color: tab === "login" ? "#fff" : "#94a3b8"
              }}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); setSuccessMsg(""); }}
              style={{
                flex: 1,
                padding: "9px",
                border: "none",
                borderRadius: "9px",
                fontWeight: 700,
                fontSize: "13.5px",
                cursor: "pointer",
                backgroundColor: tab === "register" ? "#2563eb" : "transparent",
                color: tab === "register" ? "#fff" : "#94a3b8"
              }}
            >
              Đăng Ký
            </button>
            <button
              onClick={() => { setTab("oauth_config"); setError(""); setSuccessMsg(""); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                padding: "9px 12px",
                border: "none",
                borderRadius: "9px",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                backgroundColor: tab === "oauth_config" ? "#0284c7" : "transparent",
                color: tab === "oauth_config" ? "#fff" : "#38bdf8"
              }}
            >
              <Settings size={14} /> Cấu hình OAuth 2.0
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1 & 2: LOGIN / REGISTER WITH REAL OAUTH 2.0 REDIRECTS                 */}
          {/* ========================================================================= */}
          {(tab === "login" || tab === "register") && (
            <div>
              {/* REAL OAUTH 2.0 BUTTONS (Redirect to Google / Facebook) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                {/* Google OAuth 2.0 Redirect Button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleOAuth2Redirect}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    padding: "11px 16px",
                    backgroundColor: "#ffffff",
                    color: "#1e293b",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    transition: "transform 0.1s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Tiếp tục với Google</span>
                  {oauthConfig.is_google_configured && (
                    <span style={{ fontSize: "10px", backgroundColor: "#dcfce7", color: "#166534", padding: "1px 6px", borderRadius: "10px", fontWeight: 800 }}>
                      Live
                    </span>
                  )}
                </button>

                {/* Facebook OAuth 2.0 Redirect Button */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFacebookOAuth2Redirect}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "9px",
                    padding: "11px 16px",
                    backgroundColor: "#1877F2",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(24, 119, 242, 0.3)",
                    transition: "transform 0.1s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Tiếp tục với Facebook</span>
                  {oauthConfig.is_facebook_configured && (
                    <span style={{ fontSize: "10px", backgroundColor: "#dcfce7", color: "#166534", padding: "1px 6px", borderRadius: "10px", fontWeight: 800 }}>
                      Live
                    </span>
                  )}
                </button>
              </div>

              {/* Notice for OAuth status */}
              {(!oauthConfig.is_google_configured || !oauthConfig.is_facebook_configured) && (
                <div
                  style={{
                    backgroundColor: "rgba(56, 189, 248, 0.08)",
                    border: "1px dashed rgba(56, 189, 248, 0.3)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    fontSize: "12px",
                    color: "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px"
                  }}
                >
                  <span>Bạn muốn cấu hình Client ID thật hoặc chạy thử nghiệm?</span>
                  <button
                    type="button"
                    onClick={() => setTab("oauth_config")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#38bdf8",
                      fontWeight: 700,
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    Xem cài đặt &gt;
                  </button>
                </div>
              )}

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

              {/* REAL DATABASE ACCOUNTS LIST */}
              {recentDbUsers.length > 0 && (
                <div
                  style={{
                    marginTop: "22px",
                    paddingTop: "16px",
                    borderTop: "1px dashed #1e3154"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Database size={13} /> Tài khoản đã lưu trong Database:
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {recentDbUsers.slice(0, 2).map((u) => (
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
                            style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #38bdf8", objectFit: "cover" }}
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
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: OAUTH 2.0 CONFIGURATION & TESTING PANEL                            */}
          {/* ========================================================================= */}
          {tab === "oauth_config" && (
            <div>
              {/* Architecture Explanation Steps */}
              <div
                style={{
                  backgroundColor: "#13213c",
                  borderRadius: "14px",
                  padding: "16px",
                  marginBottom: "20px",
                  border: "1px solid #1e3154"
                }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: 800, color: "#38bdf8", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={16} /> Tiêu chuẩn OAuth 2.0 (Authorization Code Flow)
                </h4>
                <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5, marginBottom: "12px" }}>
                  Ứng dụng không bao giờ nhìn thấy mật khẩu. Trình duyệt chuyển hướng đến Google/Facebook để lấy <strong style={{ color: "#fff" }}>Authorization Code</strong>, sau đó Backend dùng <strong style={{ color: "#fff" }}>Client Secret</strong> để đổi sang Access Token và lưu thông tin người dùng.
                </p>

                {/* Redirect URI Box */}
                <div style={{ backgroundColor: "#0b1324", padding: "10px 12px", borderRadius: "10px", border: "1px solid #1e3154" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                      REDIRECT URI ĐĂNG KÝ VỚI GOOGLE & META:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyUri(redirectUri)}
                      style={{
                        background: "none",
                        border: "none",
                        color: copiedUri === redirectUri ? "#22c55e" : "#38bdf8",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                        fontWeight: 700
                      }}
                    >
                      {copiedUri === redirectUri ? <Check size={12} /> : <Copy size={12} />}
                      {copiedUri === redirectUri ? "Đã copy!" : "Copy URI"}
                    </button>
                  </div>
                  <code style={{ fontSize: "12px", color: "#38bdf8", wordBreak: "break-all" }}>
                    {redirectUri}
                  </code>
                </div>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleSaveOAuthConfig} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Google Section */}
                <div style={{ border: "1px solid #1e3154", borderRadius: "12px", padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                      Google OAuth 2.0 (Google Cloud Console)
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
                        GOOGLE_CLIENT_ID
                      </label>
                      <input
                        type="text"
                        value={cfgGoogleClientId}
                        onChange={(e) => setCfgGoogleClientId(e.target.value)}
                        placeholder="VD: 123456789-abc.apps.googleusercontent.com"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          backgroundColor: "#0b1324",
                          border: "1px solid #1e3154",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                          outline: "none"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
                        GOOGLE_CLIENT_SECRET (Chỉ lưu an toàn trên Backend)
                      </label>
                      <input
                        type="password"
                        value={cfgGoogleClientSecret}
                        onChange={(e) => setCfgGoogleClientSecret(e.target.value)}
                        placeholder="GOCSPX-••••••••••••••••"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          backgroundColor: "#0b1324",
                          border: "1px solid #1e3154",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Facebook Section */}
                <div style={{ border: "1px solid #1e3154", borderRadius: "12px", padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <svg width="18" height="18" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>
                      Facebook Login (Meta for Developers)
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
                        FACEBOOK_APP_ID
                      </label>
                      <input
                        type="text"
                        value={cfgFacebookAppId}
                        onChange={(e) => setCfgFacebookAppId(e.target.value)}
                        placeholder="VD: 150382474..."
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          backgroundColor: "#0b1324",
                          border: "1px solid #1e3154",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                          outline: "none"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>
                        FACEBOOK_APP_SECRET
                      </label>
                      <input
                        type="password"
                        value={cfgFacebookAppSecret}
                        onChange={(e) => setCfgFacebookAppSecret(e.target.value)}
                        placeholder="••••••••••••••••••••"
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          backgroundColor: "#0b1324",
                          border: "1px solid #1e3154",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-duo btn-primary"
                    style={{
                      flex: 1,
                      padding: "11px",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 800
                    }}
                  >
                    {loading ? "Đang lưu..." : "Lưu Cấu Hình Vào Server (.env)"}
                  </button>
                </div>
              </form>

              {/* Simulation Sandbox Testing */}
              <div
                style={{
                  marginTop: "20px",
                  paddingTop: "16px",
                  borderTop: "1px dashed #1e3154"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Code2 size={16} color="#38bdf8" />
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#fff" }}>
                    Kiểm thử luồng Authorization Code Flow:
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>
                  Chạy mô phỏng nhận mã code từ Google/Facebook và gửi lên Backend để hoàn tất đăng nhập thực tế:
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => handleSimulateOAuthCallback("google")}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(66, 133, 244, 0.15)",
                      border: "1px solid rgba(66, 133, 244, 0.4)",
                      color: "#60a5fa",
                      fontWeight: 700,
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    Test Code Google
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateOAuthCallback("facebook")}
                    style={{
                      padding: "10px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(24, 119, 242, 0.15)",
                      border: "1px solid rgba(24, 119, 242, 0.4)",
                      color: "#93c5fd",
                      fontWeight: 700,
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    Test Code Facebook
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
