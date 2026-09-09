import React, { useState, useEffect } from "react";
import { X, Check, Crown, Sparkles, Users, BookOpen } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function PremiumModal({ isOpen, onClose }) {
  const { isPro, activatePro } = useApp();
  const [selectedPlan, setSelectedPlan] = useState("lifetime");

  // Countdown timer: 15h:59m:20s
  const [timeLeft, setTimeLeft] = useState({
    hours: 15,
    minutes: 59,
    seconds: 20
  });

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = () => {
    const h = String(timeLeft.hours).padStart(2, "0");
    const m = String(timeLeft.minutes).padStart(2, "0");
    const s = String(timeLeft.seconds).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const plans = [
    {
      id: "1month",
      duration: "1 tháng",
      price: "79.000 đ",
      monthly: null,
      badge: null,
      discount: null,
      originalPrice: null
    },
    {
      id: "3months",
      duration: "3 tháng",
      price: "169.000 đ",
      originalPrice: "237.000 đ",
      discount: "-29%",
      monthly: "~ 56.333 đ/tháng",
      badge: null
    },
    {
      id: "1year",
      duration: "1 năm",
      price: "499.000 đ",
      originalPrice: "948.000 đ",
      discount: "-47%",
      monthly: "~ 41.583 đ/tháng",
      badge: "TỐT NHẤT"
    },
    {
      id: "lifetime",
      duration: "Trọn đời",
      price: "1.386.750 đ",
      originalPrice: "1.849.000 đ",
      discount: "-30%",
      extraDiscount: "-25%",
      label: "GIÁ ƯU ĐÃI",
      badge: "TỐT NHẤT"
    }
  ];

  const benefits = [
    "Truy cập không giới hạn hơn 1.000 bài học đa dạng",
    "Theo dõi tiến trình học tập",
    "Tạo tối đa 35 bài học từ YouTube mỗi tháng",
    "Mở khóa toàn bộ đề thi TOEIC",
    "Mở khóa toàn bộ từ vựng",
    "Lưu sổ tay từ vựng và ghi chú nhiều hơn",
    "Hỗ trợ ưu tiên từ đội ngũ phát triển",
    "Xóa quảng cáo"
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(5, 10, 24, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "880px",
          maxHeight: "92vh",
          overflowY: "auto",
          backgroundColor: "#0d172e",
          color: "#f8fafc",
          borderRadius: "24px",
          border: "2px solid #1f3154",
          padding: "28px 32px",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(245, 158, 11, 0.15)"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid #1f3154",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            cursor: "pointer",
            transition: "all 0.15s ease"
          }}
          className="hover:text-white hover:bg-white/10"
        >
          <X size={18} />
        </button>

        {/* Crown & Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "radial-gradient(circle, #fbbf24 0%, #d97706 80%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              boxShadow: "0 0 25px rgba(251, 191, 36, 0.6)",
              color: "#0f172a"
            }}
          >
            <Crown size={32} fill="#0f172a" stroke="#0f172a" />
          </div>

          <h2
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "30px",
              fontWeight: 800,
              color: "#fbbf24",
              letterSpacing: "-0.5px",
              marginBottom: "10px"
            }}
          >
            Sorata Premium
          </h2>

          {/* Social Badges */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              marginBottom: "12px",
              flexWrap: "wrap"
            }}
          >
            <span
              style={{
                backgroundColor: "rgba(30, 48, 80, 0.8)",
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#e2e8f0",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              👥 500.000+ học viên
            </span>
            <span
              style={{
                backgroundColor: "rgba(30, 48, 80, 0.8)",
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#e2e8f0",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              📚 50 triệu+ bài học được làm
            </span>
          </div>

          <p style={{ fontSize: "16px", fontWeight: 600, color: "#cbd5e1" }}>
            Mở khóa toàn bộ - học gấp 10x
          </p>
        </div>

        {/* Sale Countdown Banner */}
        <div
          style={{
            backgroundColor: "#d97706",
            backgroundImage: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
            color: "#ffffff",
            padding: "8px 18px",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontWeight: 700,
            fontSize: "14px",
            margin: "0 auto 24px auto",
            maxWidth: "520px",
            boxShadow: "0 4px 15px rgba(217, 119, 6, 0.3)"
          }}
        >
          <span>🎁 2/9 Special Sale • Giảm 25%</span>
          <span>|</span>
          <span>⏱ Kết thúc sau {formatTimer()}</span>
        </div>

        {/* Grid: Left Options & Right Benefits */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr",
            gap: "24px",
            alignItems: "start"
          }}
        >
          {/* Left: 4 Pricing Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {plans.map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <div key={p.id} style={{ position: "relative" }}>
                  {p.badge && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "16px",
                        backgroundColor: "#f59e0b",
                        color: "#0f172a",
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        zIndex: 2
                      }}
                    >
                      <Sparkles size={11} />
                      {p.badge}
                    </div>
                  )}

                  <div
                    onClick={() => setSelectedPlan(p.id)}
                    style={{
                      backgroundColor: isSelected ? "rgba(245, 158, 11, 0.08)" : "rgba(18, 28, 53, 0.7)",
                      border: isSelected ? "2px solid #f59e0b" : "2px solid #1f3154",
                      borderRadius: "16px",
                      padding: "16px 18px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "0 0 15px rgba(245, 158, 11, 0.2)" : "none"
                    }}
                  >
                    {/* Radio Button */}
                    <div
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        border: isSelected ? "2px solid #f59e0b" : "2px solid #64748b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        backgroundColor: isSelected ? "#f59e0b" : "transparent"
                      }}
                    >
                      {isSelected && <Check size={14} color="#0f172a" strokeWidth={3} />}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc" }}>
                          {p.duration}
                        </span>
                        {p.discount && (
                          <span
                            style={{
                              backgroundColor: "#15803d",
                              color: "#86efac",
                              fontSize: "11px",
                              fontWeight: 800,
                              padding: "1px 6px",
                              borderRadius: "6px"
                            }}
                          >
                            {p.discount}
                          </span>
                        )}
                        {p.extraDiscount && (
                          <span
                            style={{
                              backgroundColor: "#b45309",
                              color: "#fde68a",
                              fontSize: "11px",
                              fontWeight: 800,
                              padding: "1px 6px",
                              borderRadius: "6px"
                            }}
                          >
                            ✨ {p.extraDiscount}
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        {p.originalPrice && (
                          <span style={{ textDecoration: "line-through", color: "#64748b", fontSize: "14px" }}>
                            {p.originalPrice}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: p.id === "lifetime" ? "20px" : "18px",
                            fontWeight: 800,
                            color: p.id === "lifetime" ? "#f59e0b" : "#f8fafc"
                          }}
                        >
                          {p.price}
                        </span>
                        {p.label && (
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "#f59e0b" }}>
                            {p.label}
                          </span>
                        )}
                      </div>

                      {p.monthly && (
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                          {p.monthly}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Benefits List */}
          <div
            style={{
              backgroundColor: "rgba(18, 28, 53, 0.5)",
              border: "1px solid #1f3154",
              borderRadius: "20px",
              padding: "20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <Sparkles size={20} color="#f59e0b" />
              <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#f59e0b" }}>
                Quyền lợi Premium
              </h4>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {benefits.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#f59e0b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "1px"
                    }}
                  >
                    <Check size={13} color="#0f172a" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4 }}>
                    {b}
                  </span>
                </div>
              ))}
            </div>

            {/* Activate Pro Button */}
            <div style={{ marginTop: "24px" }}>
              <button
                onClick={activatePro}
                className="btn-duo btn-gold"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "16px",
                  borderRadius: "14px",
                  boxShadow: "0 4px 20px rgba(245, 158, 11, 0.4)"
                }}
              >
                {isPro ? "✓ Bạn Đang Là Thành Viên Pro" : "Mở Khóa Toàn Bộ Ngay (Kích Hoạt Pro)"}
              </button>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#64748b",
                  marginTop: "8px",
                  fontWeight: 500
                }}
              >
                Bảo lãnh hoàn tiền 100% trong 7 ngày nếu không hài lòng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
