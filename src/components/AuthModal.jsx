import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  Shield,
  ArrowRight,
  Database,
  ChevronRight,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, oauthLogin } = useApp();
  const [tab, setTab] = useState("login"); // 'login' | 'register'
  const [oauthProvider, setOauthProvider] = useState(null); // null | 'google' | 'facebook' | 'apple'
  
  // Custom account switcher inside Google/OAuth
  const [showOtherAccount, setShowOtherAccount] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  // Standard Email/Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Real Database Accounts
  const [recentDbUsers, setRecentDbUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch real users from Database on modal open
  useEffect(() => {
    if (isOpen) {
      setError("");
      setOauthProvider(null);
      setShowOtherAccount(false);
      setCustomEmail("");
      setCustomName("");
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

  // Switch to Provider-specific 1-click modal
  const startOAuth = (provider) => {
    setError("");
    setShowOtherAccount(false);
    setCustomEmail("");
    setCustomName("");
    setOauthProvider(provider);
  };
  
  // Instant 1-click OAuth Login
  const handleQuickOAuthLogin = async ({ provider, email, full_name, avatar }) => {
    setError("");
    setLoading(true);
    try {
      await oauthLogin({
        provider,
        email: email.trim().toLowerCase(),
        full_name: full_name.trim(),
        avatar
      });
      onClose();
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Submit other/custom account inside OAuth
  const handleCustomOAuthSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!customEmail || !customEmail.includes("@")) {
      setError("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }
    const cleanEmail = customEmail.trim().toLowerCase();
    const cleanName = customName.trim() || cleanEmail.split("@")[0];
    await handleQuickOAuthLogin({
      provider: oauthProvider || "google",
      email: cleanEmail,
      full_name: cleanName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`
    });
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
        backdropFilter: "blur(10px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px"
      }}
      onClick={onClose}
    >
      {/* ========================================================================= */}
      {/* 1. FACEBOOK OAUTH MODAL (Exact match to Facebook Consent Screenshot)       */}
      {/* ========================================================================= */}
      {oauthProvider === "facebook" && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "460px",
            overflow: "hidden",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(24, 119, 242, 0.25)",
            animation: "scaleUp 0.18s ease-out",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: "#050505"
          }}
        >
          {/* Top Header Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px",
              borderBottom: "1px solid #e4e6eb",
              backgroundColor: "#ffffff"
            }}
          >
            {/* Facebook Round Blue Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="34" height="34" viewBox="0 0 36 36" fill="#1877F2">
                <circle cx="18" cy="18" r="18" />
                <path
                  fill="#ffffff"
                  d="M24.5 18h-4v12h-5V18h-2.5v-4.5H15.5v-2.8c0-3.3 1.8-5.2 5.1-5.2 1.6 0 3 .1 3.4.2v4.1h-2.3c-1.6 0-2 .8-2 2v1.7h4.3l-.5 4.5z"
                />
              </svg>
            </div>

            {/* Profile Avatar & Name */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src="/fb_avatar.png"
                alt="Trường Sơn"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #e4e6eb"
                }}
              />
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#050505" }}>
                Trường Sơn
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                margin: "12px 18px 0",
                backgroundColor: "#fee2e2",
                border: "1px solid #f87171",
                color: "#b91c1c",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px"
              }}
            >
              {error}
            </div>
          )}

          {/* Body Section */}
          <div style={{ padding: "26px 24px 20px" }}>
            {/* Linked App Connection Logos */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "20px"
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "#1877F2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <svg width="26" height="26" fill="#fff" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>

              {/* Exchange Arrows */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#65676b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3 4 7l4 4" />
                <path d="M4 7h16" />
                <path d="m16 21 4-4-4-4" />
                <path d="M20 17H4" />
              </svg>

              {/* Sorata App Icon */}
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 10px rgba(244, 63, 94, 0.3)"
                }}
              >
                <Sparkles size={24} color="#ffffff" />
              </div>
            </div>

            <div style={{ height: "1px", backgroundColor: "#e4e6eb", marginBottom: "20px" }} />

            {/* Heading */}
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#050505",
                lineHeight: 1.3,
                marginBottom: "8px"
              }}
            >
              Bạn từng đăng nhập vào Sorata bằng Facebook.
            </h2>
            <p style={{ fontSize: "15px", color: "#050505", marginBottom: "26px" }}>
              Bạn có muốn tiếp tục không?
            </p>

            {/* 1-Click Primary Action */}
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                handleQuickOAuthLogin({
                  provider: "facebook",
                  email: "sn30122006@gmail.com",
                  full_name: "Trường Sơn",
                  avatar: "/fb_avatar.png"
                })
              }
              style={{
                width: "100%",
                padding: "13px 20px",
                borderRadius: "8px",
                backgroundColor: "#1877F2",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 700,
                border: "none",
                cursor: loading ? "wait" : "pointer",
                transition: "background-color 0.15s ease",
                marginBottom: "10px"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#166fe5")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1877F2")}
            >
              {loading ? "Đang kết nối Facebook..." : "Tiếp tục dưới tên Trường"}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              disabled={loading}
              onClick={() => setOauthProvider(null)}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: "8px",
                backgroundColor: "#e4e6eb",
                color: "#050505",
                fontSize: "15px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                marginBottom: "20px"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#d8dadf")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e4e6eb")}
            >
              Hủy
            </button>

            {/* Legal Notice */}
            <p
              style={{
                fontSize: "12px",
                color: "#65676b",
                lineHeight: 1.45,
                textAlign: "left"
              }}
            >
              Bằng cách tiếp tục, Sorata sẽ được quyền truy cập liên tục vào thông tin mà bạn chia sẻ đồng thời, Meta sẽ ghi lại thời điểm Sorata truy cập vào thông tin đó.{" "}
              <span style={{ fontWeight: 700, color: "#050505", cursor: "pointer" }}>
                Tìm hiểu thêm
              </span>{" "}
              về lựa chọn chia sẻ này và các cài đặt mà bạn có.
            </p>

            <div
              style={{
                marginTop: "12px",
                fontSize: "12px",
                color: "#1877F2",
                fontWeight: 600,
                display: "flex",
                gap: "4px",
                flexWrap: "wrap"
              }}
            >
              <span style={{ cursor: "pointer" }}>Chính sách quyền riêng tư</span>
              <span style={{ color: "#65676b" }}>và</span>
              <span style={{ cursor: "pointer" }}>Điều khoản dịch vụ</span>
              <span style={{ color: "#65676b" }}>của Sorata</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GOOGLE OAUTH MODAL (Exact match to Google Account Chooser Screenshot)   */}
      {/* ========================================================================= */}
      {oauthProvider === "google" && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#202124",
            border: "1px solid #3c4043",
            borderRadius: "28px",
            width: "100%",
            maxWidth: "460px",
            overflow: "hidden",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(66, 133, 244, 0.2)",
            animation: "scaleUp 0.18s ease-out",
            fontFamily: "Google Sans, Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
            color: "#e8eaed",
            padding: "28px 24px 24px"
          }}
        >
          {/* Google Scalloped Badge with G Logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#2d2f31",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.5), inset 0 0 0 1px #3c4043"
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize: "19px",
              fontWeight: 600,
              color: "#e8eaed",
              lineHeight: 1.35,
              marginBottom: "6px",
              textAlign: "left"
            }}
          >
            Đăng nhập vào sorata.app bằng tài khoản google.com
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#9aa0a6",
              marginBottom: "16px",
              textAlign: "left"
            }}
          >
            Chọn một tài khoản để tiếp tục
          </p>

          {/* Divider */}
          <div style={{ height: "1px", backgroundColor: "#3c4043", margin: "14px 0 10px" }} />

          {/* Error Banner */}
          {error && (
            <div
              style={{
                marginBottom: "12px",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                border: "1px solid #f87171",
                color: "#fca5a5",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px"
              }}
            >
              {error}
            </div>
          )}

          {/* 1-Click Interactive Account Row (Matching Trường Sơn / Arsenal Avatar) */}
          <div
            onClick={() =>
              handleQuickOAuthLogin({
                provider: "google",
                email: "sn30122006@gmail.com",
                full_name: "Trường Sơn",
                avatar: "/arsenal_avatar.png"
              })
            }
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: "12px",
              cursor: loading ? "wait" : "pointer",
              transition: "background-color 0.15s ease",
              userSelect: "none"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {/* Authentic Arsenal Avatar */}
              <img
                src="/arsenal_avatar.png"
                alt="Trường Sơn"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
                }}
              />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#e8eaed" }}>
                  Trường Sơn
                </div>
                <div style={{ fontSize: "13px", color: "#9aa0a6" }}>
                  sn30122006@gmail.com
                </div>
              </div>
            </div>

            {/* Right Triangle Arrow */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#9aa0a6">
              <polygon points="6,3 18,12 6,21" />
            </svg>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", backgroundColor: "#3c4043", margin: "10px 0 20px" }} />

          {/* Optional: Use another account form */}
          {showOtherAccount && (
            <form onSubmit={handleCustomOAuthSubmit} style={{ marginBottom: "20px" }}>
              <div style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "12px", color: "#9aa0a6", marginBottom: "6px" }}>
                  Nhập địa chỉ Email Google khác:
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#131517",
                    border: "1px solid #5f6368",
                    borderRadius: "10px",
                    color: "#e8eaed",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "9px 16px",
                    backgroundColor: "#8ab4f8",
                    color: "#202124",
                    borderRadius: "18px",
                    fontWeight: 700,
                    fontSize: "13px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Đăng nhập tài khoản này
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtherAccount(false)}
                  style={{
                    padding: "9px 14px",
                    backgroundColor: "transparent",
                    color: "#9aa0a6",
                    borderRadius: "18px",
                    fontSize: "13px",
                    border: "1px solid #5f6368",
                    cursor: "pointer"
                  }}
                >
                  Đóng
                </button>
              </div>
            </form>
          )}

          {/* Bottom Action Pill Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px"
            }}
          >
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowOtherAccount(!showOtherAccount)}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #5f6368",
                borderRadius: "24px",
                padding: "9px 18px",
                color: "#e8eaed",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Sử dụng tài khoản khác
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => setOauthProvider(null)}
              style={{
                backgroundColor: "rgba(138, 180, 248, 0.08)",
                border: "1px solid rgba(138, 180, 248, 0.35)",
                borderRadius: "24px",
                padding: "9px 24px",
                color: "#8ab4f8",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background-color 0.15s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(138, 180, 248, 0.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(138, 180, 248, 0.08)")}
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. APPLE OAUTH MODAL                                                      */}
      {/* ========================================================================= */}
      {oauthProvider === "apple" && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#1c1c1e",
            border: "1px solid #38383a",
            borderRadius: "24px",
            width: "100%",
            maxWidth: "440px",
            overflow: "hidden",
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.95)",
            animation: "scaleUp 0.18s ease-out",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            color: "#ffffff",
            padding: "26px 22px 22px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <svg width="40" height="40" fill="#fff" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.35-.57.65-.99 1.71-.85 2.73.99.08 2.01-.51 2.55-1.23z"/>
            </svg>
          </div>

          <h2 style={{ fontSize: "19px", fontWeight: 700, textAlign: "center", marginBottom: "6px" }}>
            Đăng nhập bằng Apple ID
          </h2>
          <p style={{ fontSize: "13.5px", color: "#8e8e93", textAlign: "center", marginBottom: "20px" }}>
            Tiếp tục vào Sorata bằng Apple ID của bạn
          </p>

          <div
            onClick={() =>
              handleQuickOAuthLogin({
                provider: "apple",
                email: "sn30122006@icloud.com",
                full_name: "Trường Sơn",
                avatar: "/arsenal_avatar.png"
              })
            }
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 14px",
              borderRadius: "12px",
              backgroundColor: "#2c2c2e",
              cursor: "pointer",
              marginBottom: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <img
                src="/arsenal_avatar.png"
                alt="Trường Sơn"
                style={{ width: "36px", height: "36px", borderRadius: "50%" }}
              />
              <div>
                <div style={{ fontSize: "14px", fontWeight: 700 }}>Trường Sơn</div>
                <div style={{ fontSize: "12px", color: "#8e8e93" }}>sn30122006@icloud.com</div>
              </div>
            </div>
            <ChevronRight size={18} color="#8e8e93" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              handleQuickOAuthLogin({
                provider: "apple",
                email: "sn30122006@icloud.com",
                full_name: "Trường Sơn",
                avatar: "/arsenal_avatar.png"
              })
            }
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "#0071e3",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
              marginBottom: "10px"
            }}
          >
            {loading ? "Đang xác thực..." : "Tiếp tục với Mật mã / Face ID"}
          </button>

          <button
            type="button"
            onClick={() => setOauthProvider(null)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "transparent",
              color: "#8e8e93",
              fontWeight: 600,
              fontSize: "14px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Hủy
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MAIN SORATA LOGIN MODAL (When oauthProvider === null)                    */}
      {/* ========================================================================= */}
      {!oauthProvider && (
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
            animation: "scaleUp 0.18s ease-out"
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
                  {tab === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản Sorata"}
                </h3>
                <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Học tiếng Anh thông minh với AI & Lặp ngắt quãng
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

          <div style={{ padding: "20px 24px 24px" }}>
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

            {/* Social 1-Click OAuth Login buttons */}
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
                    <Database size={13} /> Tài khoản đã lưu ({recentDbUsers.length}):
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {recentDbUsers.slice(0, 3).map((u) => (
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
        </div>
      )}
    </div>
  );
}
