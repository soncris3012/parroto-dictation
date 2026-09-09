import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Crown,
  DollarSign,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  FileText,
  AlertCircle,
  Trash2,
  Award,
  RefreshCw,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Database
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AdminDashboardView() {
  const { currentUser } = useApp();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  // Pagination for user list
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Add User Form Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [newIsPro, setNewIsPro] = useState(false);
  const [newProvider, setNewProvider] = useState("email");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch(`/api/admin/users?search=${encodeURIComponent(search)}&role=${roleFilter}`),
        fetch("/api/admin/reports")
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) {
        const uList = await usersRes.json();
        setUsers(uList);
        setPage(1); // reset to page 1 on new search/filter
      }
      if (reportsRes.ok) setReports(await reportsRes.json());
    } catch (e) {
      console.warn("Failed to fetch admin data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, roleFilter]);

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 3500);
  };

  const handleTogglePro = async (user) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/pro`, { method: "PUT" });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Đã cập nhật trạng thái PRO");
        fetchData();
      }
    } catch (e) {
      showToast("Lỗi khi cập nhật trạng thái PRO!");
    }
  };

  const handleChangeRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Đã đổi phân quyền!");
        fetchData();
      }
    } catch (e) {
      showToast("Lỗi khi cập nhật quyền!");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.full_name}" (${user.email}) khỏi cơ sở dữ liệu SQLite?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Đã xóa học viên!");
        fetchData();
      } else {
        showToast(data.error || "Không thể xóa!");
      }
    } catch (e) {
      showToast("Lỗi khi xóa tài khoản!");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newEmail || !newName) {
      showToast("Vui lòng điền đầy đủ Email và Họ tên!");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          full_name: newName,
          role: newRole,
          is_pro: newIsPro,
          provider: newProvider
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Đã tạo học viên thành công!");
        setIsAddUserOpen(false);
        setNewEmail("");
        setNewName("");
        fetchData();
      } else {
        showToast(data.error || "Tạo học viên thất bại!");
      }
    } catch (err) {
      showToast("Lỗi kết nối máy chủ SQLite!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination slice
  const totalPages = Math.ceil(users.length / pageSize) || 1;
  const currentUsers = users.slice((page - 1) * pageSize, page * pageSize);

  const kpis = stats?.kpis || {};
  const totalUsersCount = kpis.totalUsers ?? users.length;
  const proUsersCount = kpis.proUsers ?? 0;
  const conversionRate = totalUsersCount > 0 ? ((proUsersCount / totalUsersCount) * 100).toFixed(1) : "0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1200px", margin: "0 auto", width: "100%", paddingBottom: "40px" }}>
      {/* Toast Notification */}
      {actionMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#0d1527",
            border: "2px solid #38bdf8",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 700,
            fontSize: "14px"
          }}
        >
          <Sparkles size={18} color="#38bdf8" />
          {actionMessage}
        </div>
      )}

      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #182647 0%, #0d1629 100%)",
          border: "2px solid #233863",
          borderRadius: "20px",
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                fontSize: "11px",
                fontWeight: 800,
                padding: "3px 8px",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Shield size={13} /> ADMIN CONTROL PANEL
            </span>
            <span
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                color: "#4ade80",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Database size={12} /> SQLite Database Trực Tiếp (parroto.db)
            </span>
          </div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#f8fafc" }}>
            Bảng Điều Khiển Quản Trị Hệ Thống (Dữ Liệu Thật 100%)
          </h2>
          <p style={{ fontSize: "13px", color: "#94a3b8" }}>
            Mọi số liệu, học viên, kết quả thi và doanh thu được đồng bộ trực tiếp từng giây từ cơ sở dữ liệu SQLite thật.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="btn-duo btn-success"
            style={{ padding: "10px 16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
          >
            <UserPlus size={15} /> + Thêm Học Viên Mới
          </button>
          <button
            onClick={fetchData}
            className="btn-duo btn-outline"
            style={{ padding: "10px 16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
          >
            <RefreshCw size={15} /> Làm mới
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (100% Genuine Database Values) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px"
        }}
      >
        {/* Total Users */}
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "16px",
            padding: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--muted-foreground)" }}>
              Tổng Số Học Viên
            </span>
            <div style={{ backgroundColor: "rgba(56, 189, 248, 0.15)", padding: "8px", borderRadius: "10px" }}>
              <Users size={20} color="#38bdf8" />
            </div>
          </div>
          <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--foreground)" }}>
            {totalUsersCount.toLocaleString()} học viên
          </p>
          <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 600 }}>
            Truy vấn thật từ bảng `users`
          </span>
        </div>

        {/* Pro Users */}
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "16px",
            padding: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--muted-foreground)" }}>
              Học Viên PRO VIP
            </span>
            <div style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", padding: "8px", borderRadius: "10px" }}>
              <Crown size={20} color="#f59e0b" />
            </div>
          </div>
          <p style={{ fontSize: "28px", fontWeight: 800, color: "#f59e0b" }}>
            {proUsersCount.toLocaleString()} thành viên
          </p>
          <span style={{ fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 600 }}>
            Tỉ lệ chuyển đổi: {conversionRate}%
          </span>
        </div>

        {/* Total Hours */}
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "16px",
            padding: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--muted-foreground)" }}>
              Tổng Giờ Luyện Thi
            </span>
            <div style={{ backgroundColor: "rgba(168, 85, 247, 0.15)", padding: "8px", borderRadius: "10px" }}>
              <Clock size={20} color="#c084fc" />
            </div>
          </div>
          <p style={{ fontSize: "28px", fontWeight: 800, color: "var(--foreground)" }}>
            {(kpis.totalHoursStudied || 0).toLocaleString()} giờ
          </p>
          <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 600 }}>
            Tổng từ {kpis.totalExamsTaken || 0} lượt thi thực tế
          </span>
        </div>

        {/* Revenue */}
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "16px",
            padding: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--muted-foreground)" }}>
              Doanh Thu Thực Tế (Database)
            </span>
            <div style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", padding: "8px", borderRadius: "10px" }}>
              <DollarSign size={20} color="#4ade80" />
            </div>
          </div>
          <p style={{ fontSize: "24px", fontWeight: 800, color: "#4ade80" }}>
            {kpis.revenueVnd || "0 ₫"}
          </p>
          <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: 700 }}>
            {proUsersCount} học viên PRO x 599.000 ₫
          </span>
        </div>
      </div>

      {/* Visual Activity & Growth Chart from SQLite */}
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "2px solid var(--border)",
          borderRadius: "18px",
          padding: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--foreground)" }}>
              Tăng Trưởng Học Viên Theo Tháng (Group by SQLite Month)
            </h3>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
              Thống kê lượng tài khoản được tạo và số gói PRO được đăng ký theo từng tháng
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "12px", fontWeight: 700 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "12px", backgroundColor: "var(--primary)", borderRadius: "3px" }} />
              <span style={{ color: "var(--foreground)" }}>Tổng học viên mới</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "12px", height: "12px", backgroundColor: "#f59e0b", borderRadius: "3px" }} />
              <span style={{ color: "var(--foreground)" }}>Học viên kích hoạt PRO</span>
            </div>
          </div>
        </div>

        {/* Dynamic Bar Chart from Database */}
        {stats?.monthlyData && stats.monthlyData.length > 0 ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "24px", height: "180px", paddingTop: "24px", borderBottom: "1px solid var(--border)" }}>
            {(() => {
              const maxLearners = Math.max(...stats.monthlyData.map((d) => d.learners), 1);
              return stats.monthlyData.map((bar, i) => {
                const totalH = Math.max(28, Math.round((bar.learners / maxLearners) * 120));
                const proH = Math.max(10, Math.round((bar.proSubs / maxLearners) * 120));
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--foreground)" }}>
                      {bar.learners} hv ({bar.proSubs} PRO)
                    </span>
                    <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", width: "100%", justifyContent: "center" }}>
                      <div
                        style={{
                          width: "32px",
                          height: `${totalH}px`,
                          backgroundColor: "var(--primary)",
                          borderRadius: "6px 6px 0 0",
                          transition: "height 0.3s ease"
                        }}
                        title={`Tháng: ${bar.month} | Tổng: ${bar.learners} học viên`}
                      />
                      <div
                        style={{
                          width: "22px",
                          height: `${proH}px`,
                          backgroundColor: "#f59e0b",
                          borderRadius: "6px 6px 0 0",
                          transition: "height 0.3s ease"
                        }}
                        title={`Tháng: ${bar.month} | PRO: ${bar.proSubs} tài khoản (${bar.revenue.toLocaleString()} ₫)`}
                      />
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--muted-foreground)", fontWeight: 600, marginTop: "6px" }}>
                      {bar.month}
                    </span>
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "var(--muted-foreground)", padding: "20px" }}>Chưa có dữ liệu thống kê tháng</p>
        )}
      </div>

      {/* User Management Section */}
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "2px solid var(--border)",
          borderRadius: "18px",
          padding: "24px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px", marginBottom: "18px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--foreground)" }}>
              Quản Lý Tài Khoản Học Viên (Database: users • Tổng: {users.length})
            </h3>
            <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
              Tra cứu, phân quyền Admin và nâng cấp gói PRO trực tiếp vào bảng SQLite
            </p>
          </div>

          {/* Search & Filter */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "6px 12px",
                width: "240px"
              }}
            >
              <Search size={15} color="var(--muted-foreground)" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên hoặc email..."
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--foreground)",
                  fontSize: "13px",
                  width: "100%"
                }}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "10px",
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontSize: "13px",
                outline: "none"
              }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Chỉ Admin</option>
              <option value="user">Chỉ Học viên</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--muted-foreground)" }}>
                <th style={{ padding: "12px 14px" }}>Học viên</th>
                <th style={{ padding: "12px 14px" }}>Email</th>
                <th style={{ padding: "12px 14px" }}>Kênh Đăng Nhập</th>
                <th style={{ padding: "12px 14px" }}>Vai Trò</th>
                <th style={{ padding: "12px 14px" }}>Gói Dịch Vụ</th>
                <th style={{ padding: "12px 14px" }}>Chuỗi Streak</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((u) => (
                <tr
                  key={u.id}
                  style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s ease" }}
                  className="hover:bg-muted/40"
                >
                  {/* Name + Avatar */}
                  <td style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                      src={u.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=" + u.id}
                      alt={u.full_name}
                      style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <p style={{ fontWeight: 700, color: "var(--foreground)" }}>{u.full_name}</p>
                      <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>ID #{u.id} • {u.created_at?.slice(0, 10)}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "12px 14px", color: "var(--foreground)" }}>
                    {u.email}
                  </td>

                  {/* Provider */}
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        textTransform: "uppercase",
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: "var(--secondary)",
                        color: "var(--muted-foreground)"
                      }}
                    >
                      {u.provider}
                    </span>
                  </td>

                  {/* Role */}
                  <td style={{ padding: "12px 14px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        backgroundColor: u.role === "admin" ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)",
                        color: u.role === "admin" ? "#f87171" : "#60a5fa"
                      }}
                    >
                      {u.role === "admin" ? "ADMIN" : "HỌC VIÊN"}
                    </span>
                  </td>

                  {/* Pro VIP status */}
                  <td style={{ padding: "12px 14px" }}>
                    {u.is_pro === 1 ? (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "2px 8px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(245, 158, 11, 0.15)",
                          color: "#f59e0b",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <Crown size={12} /> PRO VIP
                      </span>
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                        Miễn phí (Free)
                      </span>
                    )}
                  </td>

                  {/* Streak */}
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "#ea580c" }}>
                    🔥 {u.streak || 0} ngày
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      {/* Toggle Pro */}
                      <button
                        onClick={() => handleTogglePro(u)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          border: "1px solid #f59e0b",
                          backgroundColor: u.is_pro === 1 ? "#f59e0b" : "transparent",
                          color: u.is_pro === 1 ? "#000" : "#f59e0b",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                        title={u.is_pro === 1 ? "Hạ về gói miễn phí" : "Kích hoạt PRO VIP"}
                      >
                        {u.is_pro === 1 ? "Bỏ PRO" : "+ Cấp PRO"}
                      </button>

                      {/* Change role */}
                      <button
                        onClick={() => handleChangeRole(u)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--secondary)",
                          color: "var(--foreground)",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                        title="Đổi phân quyền"
                      >
                        {u.role === "admin" ? "Về User" : "Lên Admin"}
                      </button>

                      {/* Delete */}
                      {u.id !== 1 && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "rgba(239, 68, 68, 0.15)",
                            color: "#ef4444",
                            cursor: "pointer"
                          }}
                          title="Xóa học viên khỏi SQLite"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border)", fontSize: "13px", color: "var(--muted-foreground)" }}>
          <span>
            Đang xem {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, users.length)} trên tổng số <strong>{users.length}</strong> học viên từ SQLite
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-ghost"
              style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}
            >
              <ChevronLeft size={14} /> Trước
            </button>

            <span style={{ fontWeight: 700, color: "var(--foreground)", padding: "0 6px" }}>
              Trang {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn-ghost"
              style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.5 : 1 }}
            >
              Sau <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* System Reports & User Feedback */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: "18px"
        }}
      >
        {/* Recent Exams Log */}
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "18px",
            padding: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Award size={18} color="var(--primary)" />
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--foreground)" }}>
              Bài Thi Hoàn Thành Gần Đây (exam_results)
            </h4>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {(stats?.recentExams || []).map((ex) => (
              <div
                key={ex.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  backgroundColor: "var(--background)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)"
                }}
              >
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)" }}>
                    {ex.exam_title}
                  </p>
                  <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
                    {ex.full_name || ex.email} • {ex.created_at?.slice(0, 10)}
                  </span>
                </div>
                <span
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.15)",
                    color: "#4ade80",
                    fontWeight: 800,
                    fontSize: "12px",
                    padding: "3px 8px",
                    borderRadius: "6px"
                  }}
                >
                  {ex.band_score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User Reports & Feedback */}
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "18px",
            padding: "20px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <AlertCircle size={18} color="#f59e0b" />
            <h4 style={{ fontSize: "16px", fontWeight: 800, color: "var(--foreground)" }}>
              Báo Cáo & Phản Hồi Từ Người Dùng (system_reports)
            </h4>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {reports.map((rep) => (
              <div
                key={rep.id}
                style={{
                  padding: "12px",
                  backgroundColor: "var(--background)",
                  borderRadius: "12px",
                  border: "1px solid var(--border)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--foreground)" }}>
                    {rep.subject}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backgroundColor: rep.status === "resolved" ? "rgba(34, 197, 94, 0.15)" : "rgba(234, 179, 8, 0.15)",
                      color: rep.status === "resolved" ? "#4ade80" : "#facc15"
                    }}
                  >
                    {rep.status === "resolved" ? "ĐÃ XỬ LÝ" : "CHỜ DUYỆT"}
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.4 }}>
                  {rep.message}
                </p>
                <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                  Gửi bởi: {rep.user_email || "Ẩn danh"} • {rep.created_at?.slice(0, 10)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Thêm Học Viên Mới Vào SQLite */}
      {isAddUserOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px"
          }}
          onClick={() => setIsAddUserOpen(false)}
        >
          <div
            style={{
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--foreground)" }}>
                Thêm Học Viên Mới Vào SQLite
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", fontSize: "18px" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "4px" }}>
                  Họ và tên học viên *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "4px" }}>
                  Địa chỉ Email *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nguyenvanan@gmail.com"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    backgroundColor: "var(--background)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "4px" }}>
                    Vai trò
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "13px",
                      outline: "none"
                    }}
                  >
                    <option value="user">Học viên (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "4px" }}>
                    Kênh đăng nhập
                  </label>
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "10px",
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontSize: "13px",
                      outline: "none"
                    }}
                  >
                    <option value="email">Email</option>
                    <option value="google">Google</option>
                    <option value="apple">Apple</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "6px 0" }}>
                <input
                  type="checkbox"
                  id="newIsProCheck"
                  checked={newIsPro}
                  onChange={(e) => setNewIsPro(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="newIsProCheck" style={{ fontSize: "13px", fontWeight: 700, color: "#f59e0b", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Crown size={14} /> Cấp ngay đặc quyền PRO VIP (+599.000₫ vào doanh thu)
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="btn-ghost"
                  style={{ flex: 1, padding: "10px" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-duo btn-success"
                  style={{ flex: 1, padding: "10px", fontWeight: 800 }}
                >
                  {isSubmitting ? "Đang lưu..." : "Lưu Vào SQLite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
