import React, { useState } from "react";
import {
  ShoppingBag,
  Sparkles,
  Shield,
  Crown,
  Flame,
  Zap,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { sounds } from "../utils/audioEffects";

export default function ShopView() {
  const { currentUser, diamonds, setDiamonds, refreshUser, isPro, setIsPro } = useApp();
  const [purchasingId, setPurchasingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const shopItems = [
    {
      id: "streak_freeze",
      name: "Băng Bảo Vệ Chuỗi Học",
      subtitle: "Streak Freeze",
      description: "Tự động bảo lưu chuỗi ngày streak của bạn nếu bạn bận rộn và không thể hoàn thành bài học trong ngày.",
      cost: 200,
      icon: Shield,
      badge: "Phổ biến nhất",
      color: "#38bdf8",
      bgColor: "rgba(56, 189, 248, 0.15)"
    },
    {
      id: "pro_3d",
      name: "Thẻ Học Thử Sorata PRO 3 Ngày",
      subtitle: "3-Day Full Pro Pass",
      description: "Mở khoá toàn bộ đề thi IELTS/TOEIC, phát âm giọng AI cao cấp, không giới hạn bài nghe và tra cứu từ vựng.",
      cost: 800,
      icon: Crown,
      badge: "Siêu giá trị",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.15)"
    },
    {
      id: "double_xp",
      name: "Bình Tăng Tốc X2 Điểm Kinh Nghiệm (24h)",
      subtitle: "2x XP Booster",
      description: "Nhân đôi toàn bộ XP và kim cương tích luỹ được sau mỗi câu nghe chép chính tả và đề thi trong 24 giờ tới.",
      cost: 350,
      icon: Zap,
      badge: "Tăng cấp nhanh",
      color: "#a855f7",
      bgColor: "rgba(168, 85, 247, 0.15)"
    },
    {
      id: "avatar_frame",
      name: "Khung Avatar Vàng Hoàng Gia",
      subtitle: "Royal Golden Badge Frame",
      description: "Trang trí avatar của bạn với viền hoàng kim phát sáng lấp lánh xuất hiện nổi bật trên Bảng Xếp Hạng.",
      cost: 500,
      icon: Sparkles,
      badge: "Độc quyền",
      color: "#eab308",
      bgColor: "rgba(234, 179, 8, 0.15)"
    },
    {
      id: "flame_master",
      name: "Huy Hiệu Ngọn Lửa Bất Diệt",
      subtitle: "Streak Master Flame",
      description: "Kích hoạt hiệu ứng ngọn lửa cháy rực rỡ bên cạnh tên học viên và nhận thêm 1 lượt thi thử TOEIC miễn phí.",
      cost: 450,
      icon: Flame,
      badge: "Danh hiệu",
      color: "#ea580c",
      bgColor: "rgba(234, 88, 12, 0.15)"
    }
  ];

  const handlePurchase = async (item) => {
    if (!currentUser) {
      showToast("Vui lòng đăng nhập để đổi quà từ shop!", "error");
      return;
    }

    if (diamonds < item.cost) {
      sounds.playWrong();
      showToast(`Bạn cần ${item.cost} 💎 nhưng hiện chỉ có ${diamonds} 💎! Hãy tích lũy thêm bằng cách làm bài thi hoặc ôn từ vựng.`, "error");
      return;
    }

    setPurchasingId(item.id);
    try {
      const res = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          item_id: item.id,
          cost: item.cost,
          item_name: item.name
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Giao dịch thất bại");

      sounds.playLessonSuccess();
      showToast(data.message || `Đã đổi thành công ${item.name}!`, "success");
      setDiamonds(data.user.diamonds);
      if (item.id === "pro_3d") setIsPro(true);
      refreshUser();
    } catch (err) {
      sounds.playWrong();
      showToast(err.message || "Lỗi giao dịch", "error");
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "960px", margin: "0 auto", width: "100%" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 1000,
            padding: "14px 20px",
            borderRadius: "14px",
            backgroundColor: toastType === "success" ? "#065f46" : "#7f1d1d",
            color: "#fff",
            border: `2px solid ${toastType === "success" ? "#34d399" : "#f87171"}`,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: 700,
            animation: "slideIn 0.2s ease"
          }}
        >
          {toastType === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage}</span>
        </div>
      )}

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
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "rgba(56, 189, 248, 0.2)",
              border: "2px solid #38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <ShoppingBag size={30} color="#38bdf8" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#f8fafc" }}>
                Cửa Hàng Đổi Quà Sorata
              </h2>
              <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "rgba(34, 197, 94, 0.2)", color: "#22c55e", padding: "2px 8px", borderRadius: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Database size={12} /> SQLite Live
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "#94a3b8" }}>
              Dùng kim cương tích lũy được từ bài học để đổi vật phẩm hỗ trợ chuỗi streak và trải nghiệm PRO
            </p>
          </div>
        </div>

        {/* User Balance Chip */}
        <div
          style={{
            backgroundColor: "rgba(56, 189, 248, 0.15)",
            border: "2px solid #38bdf8",
            borderRadius: "16px",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <span style={{ fontSize: "24px" }}>💎</span>
          <div>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
              Số dư hiện tại
            </span>
            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#38bdf8" }}>
              {diamonds} Kim Cương
            </h3>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
        {shopItems.map((item) => {
          const Icon = item.icon;
          const canAfford = diamonds >= item.cost;
          const isPurchasing = purchasingId === item.id;

          return (
            <div
              key={item.id}
              style={{
                backgroundColor: "var(--card)",
                border: "2px solid var(--border)",
                borderRadius: "20px",
                padding: "22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
                position: "relative",
                transition: "all 0.15s ease"
              }}
              className="hover:border-primary/50 hover:shadow-lg"
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      backgroundColor: item.bgColor,
                      border: `1px solid ${item.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Icon size={24} color={item.color} />
                  </div>

                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      backgroundColor: item.bgColor,
                      color: item.color,
                      padding: "3px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--foreground)", marginBottom: "2px" }}>
                  {item.name}
                </h3>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 600, display: "block", marginBottom: "10px" }}>
                  {item.subtitle}
                </span>
                <p style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.5 }}>
                  {item.description}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                <span style={{ fontSize: "16px", fontWeight: 900, color: item.color }}>
                  {item.cost} 💎
                </span>

                <button
                  onClick={() => handlePurchase(item)}
                  disabled={isPurchasing}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: canAfford ? item.color : "var(--muted)",
                    color: canAfford ? "#0f172a" : "var(--muted-foreground)",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: canAfford ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>{isPurchasing ? "Đang xử lý..." : canAfford ? "Đổi Quà Ngay" : "Chưa đủ 💎"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
