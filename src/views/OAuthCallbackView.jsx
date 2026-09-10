import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

export default function OAuthCallbackView() {
  const { setCurrentUser, setCurrentRoute, sounds } = useApp();
  const [status, setStatus] = useState("processing"); // 'processing' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [providerName, setProviderName] = useState("Google / Facebook");

  useEffect(() => {
    const processOAuthCode = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");
        const errorDesc = urlParams.get("error_description");
        const stateRaw = urlParams.get("state");

        if (error) {
          setStatus("error");
          setErrorMessage(errorDesc || error || "Quá trình ủy quyền OAuth bị hủy hoặc từ chối.");
          return;
        }

        if (!code) {
          setStatus("error");
          setErrorMessage("Không tìm thấy Authorization Code trong đường dẫn chuyển hướng.");
          return;
        }

        // Detect provider from state
        let provider = "google";
        if (stateRaw) {
          try {
            if (stateRaw.startsWith("{")) {
              const parsed = JSON.parse(stateRaw);
              if (parsed.provider) provider = parsed.provider;
            } else if (stateRaw.toLowerCase().includes("facebook")) {
              provider = "facebook";
            }
          } catch (e) {}
        }
        setProviderName(provider === "google" ? "Google" : "Facebook");

        const redirectUri = `${window.location.origin}/auth/callback`;

        // Step 4: Backend exchange code for token and user profile
        const res = await fetch("/api/auth/oauth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            code,
            redirect_uri: redirectUri
          })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Máy chủ không thể xác thực mã Authorization Code.");
        }

        // Authentication Success!
        if (data.token) {
          localStorage.setItem("parroto_token", data.token);
        }
        localStorage.setItem("parroto_user", JSON.stringify(data.user));
        setCurrentUser(data.user);

        setStatus("success");
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        if (sounds?.playCorrect) sounds.playCorrect();

        // Redirect to dashboard after brief celebration
        setTimeout(() => {
          // Clean URL params
          window.history.replaceState({}, document.title, window.location.pathname);
          setCurrentRoute("/vi/dashboard");
        }, 1800);

      } catch (err) {
        console.error("OAuth Callback Execution Error:", err);
        setStatus("error");
        setErrorMessage(err.message || "Đã xảy ra lỗi trong quá trình trao đổi mã xác thực.");
      }
    };

    processOAuthCode();
  }, []);

  return (
    <div
      style={{
        minHeight: "75vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px"
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          backgroundColor: "#0d1527",
          border: "2px solid #1e3154",
          borderRadius: "24px",
          padding: "36px 28px",
          textAlign: "center",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.15)",
          animation: "scaleUp 0.2s ease-out"
        }}
      >
        {status === "processing" && (
          <div>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px"
              }}
            >
              <RefreshCw
                size={32}
                color="#38bdf8"
                style={{ animation: "spin 1.2s linear infinite" }}
              />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>
              Đang xác thực OAuth 2.0 với {providerName}...
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.5 }}>
              Đang gửi Authorization Code lên Backend để đổi Access Token và cấp phiên đăng nhập an toàn.
            </p>
          </div>
        )}

        {status === "success" && (
          <div>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px"
              }}
            >
              <CheckCircle2 size={36} color="#22c55e" />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#22c55e", marginBottom: "8px" }}>
              Đăng nhập OAuth 2.0 thành công!
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "20px" }}>
              Chào mừng bạn đến với Sorata. Đang chuyển hướng về Bảng điều khiển...
            </p>
            <button
              onClick={() => {
                window.history.replaceState({}, document.title, window.location.pathname);
                setCurrentRoute("/vi/dashboard");
              }}
              className="btn-duo btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "14px"
              }}
            >
              Vào Bảng Điều Khiển <ArrowRight size={16} />
            </button>
          </div>
        )}

        {status === "error" && (
          <div>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px"
              }}
            >
              <AlertCircle size={36} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#ef4444", marginBottom: "8px" }}>
              Xác thực OAuth 2.0 không thành công
            </h2>
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                borderRadius: "12px",
                padding: "12px",
                color: "#fca5a5",
                fontSize: "13px",
                marginBottom: "20px",
                textAlign: "left"
              }}
            >
              {errorMessage}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => {
                  window.history.replaceState({}, document.title, window.location.pathname);
                  setCurrentRoute("/vi/dashboard");
                }}
                className="btn-duo btn-primary"
                style={{
                  padding: "10px 18px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "14px"
                }}
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
