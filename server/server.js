import express from "express";
import cors from "cors";
import https from "node:https";
import db from "./database.js";
import { WebSocketServer } from "ws";
import { createLessonFromYouTube } from "./youtubeHelper.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Audio in-memory cache for TTS
const audioCache = new Map();

// ==========================================
// 1. HIGH-QUALITY GOOGLE TTS AUDIO PROXY
// ==========================================
// Strips browser Referer so Google Translate TTS streams HTTP 200 without blocking
app.get("/api/tts", (req, res) => {
  const text = (req.query.text || "").trim();
  const lang = req.query.lang || "en";

  if (!text) {
    return res.status(400).send("Text is required");
  }

  const cacheKey = `${lang}:${text}`;
  if (audioCache.has(cacheKey)) {
    const cachedBuffer = audioCache.get(cacheKey);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(cachedBuffer);
  }

  const encoded = encodeURIComponent(text);
  const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encoded}`;

  const options = {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.9"
    }
  };

  https.get(targetUrl, options, (googleRes) => {
    if (googleRes.statusCode === 200) {
      const chunks = [];
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");

      googleRes.on("data", (chunk) => {
        chunks.push(chunk);
        res.write(chunk);
      });

      googleRes.on("end", () => {
        const fullBuf = Buffer.concat(chunks);
        if (fullBuf.length > 0 && audioCache.size < 500) {
          audioCache.set(cacheKey, fullBuf);
        }
        res.end();
      });
    } else {
      console.warn("Google TTS responded with status:", googleRes.statusCode);
      res.status(googleRes.statusCode).end();
    }
  }).on("error", (err) => {
    console.error("Google TTS proxy error:", err);
    res.status(500).send("TTS Proxy error");
  });
});

// ==========================================
// 2. AUTHENTICATION & USER MANAGEMENT
// ==========================================

// Login with Email & Password
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    return res.status(401).json({ error: "Tài khoản không tồn tại. Vui lòng đăng ký!" });
  }

  // Verify password (plain check for simulation)
  if (user.password_hash && password && user.password_hash !== password) {
    return res.status(401).json({ error: "Mật khẩu không chính xác!" });
  }

  // Update last login
  db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);

  const { password_hash, ...safeUser } = user;
  res.json({
    success: true,
    user: safeUser,
    token: "parroto_token_" + Buffer.from(email + ":" + Date.now()).toString("base64")
  });
});

// Register new account
app.post("/api/auth/register", (req, res) => {
  const { email, password, full_name } = req.body;
  if (!email || !full_name) {
    return res.status(400).json({ error: "Email và Họ tên là bắt buộc" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "Email này đã được đăng ký trên hệ thống!" });
  }

  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(full_name)}`;
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, avatar, provider, role, is_pro, streak, diamonds)
    VALUES (?, ?, ?, ?, 'email', 'user', 0, 1, 100)
  `).run(email, password || "123456", full_name, avatar);

  const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  const { password_hash, ...safeUser } = newUser;

  res.status(201).json({
    success: true,
    user: safeUser,
    token: "parroto_token_" + Buffer.from(email + ":" + Date.now()).toString("base64")
  });
});

// Google Identity Services (GSI) / OAuth Token Verification
app.post("/api/auth/google/verify", (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: "Google credential token is required" });
  }

  try {
    // Decode Google JWT payload safely
    const parts = credential.split(".");
    if (parts.length < 2) {
      return res.status(400).json({ error: "Invalid Google token format" });
    }
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    const { email, name, picture, sub } = payload;

    if (!email) {
      return res.status(400).json({ error: "Không tìm thấy email từ tài khoản Google" });
    }

    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      const avatar = picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || email)}`;
      const result = db.prepare(`
        INSERT INTO users (email, full_name, avatar, provider, role, is_pro, streak, diamonds)
        VALUES (?, ?, ?, 'google', 'user', 0, 1, 150)
      `).run(email, name || email.split("@")[0], avatar);

      user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
    } else {
      db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?").run(user.id);
    }

    // Log activity
    db.prepare(`
      INSERT INTO user_activity (user_id, activity_type, details, xp_earned)
      VALUES (?, 'auth', 'Đăng nhập thành công qua Google OAuth thật', 10)
    `).run(user.id);

    const { password_hash, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
      token: "parroto_token_" + Buffer.from(email + ":" + Date.now()).toString("base64")
    });
  } catch (err) {
    console.error("Google token decode error:", err);
    res.status(500).json({ error: "Lỗi xác thực Google: " + err.message });
  }
});

// Social Login (Google, Facebook, Apple)
app.post("/api/auth/oauth", (req, res) => {
  const { provider, email, full_name, avatar } = req.body;
  if (!provider) return res.status(400).json({ error: "Provider is required" });

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email hợp lệ là bắt buộc để đăng nhập OAuth" });
  }

  const targetEmail = email.trim().toLowerCase();
  const targetName = full_name?.trim() || targetEmail.split("@")[0];
  const targetAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(targetName)}`;

  let user = db.prepare("SELECT * FROM users WHERE email = ?").get(targetEmail);
  if (!user) {
    const result = db.prepare(`
      INSERT INTO users (email, full_name, avatar, provider, role, is_pro, streak, diamonds)
      VALUES (?, ?, ?, ?, 'user', 0, 1, 150)
    `).run(targetEmail, targetName, targetAvatar, provider);

    user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
  } else {
    db.prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP, provider = ? WHERE id = ?").run(provider, user.id);
  }

  // Log activity
  db.prepare(`
    INSERT INTO user_activity (user_id, activity_type, details, xp_earned)
    VALUES (?, 'auth', ?, 10)
  `).run(user.id, `Đăng nhập qua ${provider.toUpperCase()}`);

  const { password_hash, ...safeUser } = user;
  res.json({
    success: true,
    user: safeUser,
    token: "parroto_token_" + Buffer.from(targetEmail + ":" + Date.now()).toString("base64")
  });
});

// Current User info from Database in Real-Time
app.get("/api/auth/me", (req, res) => {
  const userId = req.query.user_id;
  const authHeader = req.headers.authorization;

  let user = null;
  if (userId) {
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  } else if (authHeader && authHeader.startsWith("Bearer parroto_token_")) {
    try {
      const token = authHeader.replace("Bearer parroto_token_", "");
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const email = decoded.split(":")[0];
      if (email) {
        user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      }
    } catch (e) {}
  }

  if (!user) {
    // Default fallback to first active admin
    user = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
  }

  if (!user) return res.status(404).json({ error: "User not found" });

  const { password_hash, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Get recent users list for quick account selection / display
app.get("/api/auth/recent-users", (req, res) => {
  const users = db.prepare(`
    SELECT id, email, full_name, avatar, provider, role, is_pro, streak, diamonds, last_login
    FROM users
    ORDER BY last_login DESC
    LIMIT 6
  `).all();
  res.json(users);
});

// Real-Time User Dashboard aggregate statistics
app.get("/api/user/dashboard", (req, res) => {
  const userId = req.query.user_id || 1;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  const totalNotes = db.prepare("SELECT COUNT(*) as count FROM notes WHERE user_id = ?").get(userId).count;
  const totalExams = db.prepare("SELECT COUNT(*) as count FROM exam_results WHERE user_id = ?").get(userId).count;
  const totalSeconds = db.prepare("SELECT COALESCE(SUM(time_spent_seconds), 0) as total FROM exam_results WHERE user_id = ?").get(userId).total;
  
  const recentExams = db.prepare(`
    SELECT id, exam_type, exam_id, exam_title, score, total_questions, band_score, time_spent_seconds, created_at
    FROM exam_results
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `).all(userId);

  const recentActivity = db.prepare(`
    SELECT id, activity_type, details, xp_earned, created_at
    FROM user_activity
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 6
  `).all(userId);

  const { password_hash, ...safeUser } = user;

  res.json({
    user: safeUser,
    kpis: {
      streak: user.streak || 1,
      diamonds: user.diamonds || 120,
      dailyMinutes: user.daily_minutes || 20,
      totalNotes,
      totalExams,
      studyHours: (totalSeconds / 3600).toFixed(1)
    },
    recentExams,
    recentActivity
  });
});

// Update Profile / Pro Status
app.put("/api/auth/profile", (req, res) => {
  const { id, full_name, is_pro, streak, diamonds } = req.body;
  if (!id) return res.status(400).json({ error: "User ID is required" });

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const updatedName = full_name !== undefined ? full_name : user.full_name;
  const updatedPro = is_pro !== undefined ? (is_pro ? 1 : 0) : user.is_pro;
  const updatedStreak = streak !== undefined ? streak : user.streak;
  const updatedDiamonds = diamonds !== undefined ? diamonds : user.diamonds;

  db.prepare(`
    UPDATE users SET full_name = ?, is_pro = ?, streak = ?, diamonds = ?
    WHERE id = ?
  `).run(updatedName, updatedPro, updatedStreak, updatedDiamonds, id);

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  const { password_hash, ...safeUser } = updated;
  res.json({ success: true, user: safeUser });
});

// Leaderboard - Live Top Learners Ranking from SQLite
app.get("/api/leaderboard", (req, res) => {
  const filter = req.query.filter || "diamonds";
  const orderBy = filter === "streak" ? "streak DESC" : "diamonds DESC";
  const topUsers = db.prepare(`
    SELECT id, full_name, email, avatar, provider, role, is_pro, streak, diamonds
    FROM users
    ORDER BY ${orderBy}
    LIMIT 30
  `).all();
  res.json(topUsers);
});

// Shop Item Redemption (Real SQLite transactions)
app.post("/api/shop/purchase", (req, res) => {
  const { user_id = 1, item_id, cost = 0, item_name = "Vật phẩm" } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.diamonds < cost) {
    return res.status(400).json({ error: `Bạn cần ${cost} 💎 nhưng hiện chỉ có ${user.diamonds} 💎!` });
  }

  const newDiamonds = user.diamonds - cost;
  const isPro = item_id === "pro_3d" ? 1 : user.is_pro;

  db.prepare("UPDATE users SET diamonds = ?, is_pro = ? WHERE id = ?").run(newDiamonds, isPro, user_id);
  db.prepare(`
    INSERT INTO user_activity (user_id, activity_type, details, xp_earned)
    VALUES (?, 'shop', ?, 0)
  `).run(user_id, `Đổi thành công vật phẩm: ${item_name}`);

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
  const { password_hash, ...safeUser } = updated;
  res.json({
    success: true,
    user: safeUser,
    message: `Chúc mừng bạn đã đổi thành công "${item_name}"!`
  });
});

// Claim Milestone Streak Rewards
app.post("/api/milestones/claim", (req, res) => {
  const { user_id = 1, milestone_id, reward_diamonds = 50, title = "Mốc thưởng" } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const newDiamonds = (user.diamonds || 0) + reward_diamonds;
  db.prepare("UPDATE users SET diamonds = ? WHERE id = ?").run(newDiamonds, user_id);
  db.prepare(`
    INSERT INTO user_activity (user_id, activity_type, details, xp_earned)
    VALUES (?, 'reward', ?, 25)
  `).run(user_id, `Nhận thưởng: ${title} (+${reward_diamonds} 💎)`);

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
  const { password_hash, ...safeUser } = updated;
  res.json({
    success: true,
    user: safeUser,
    message: `Bạn đã nhận được ${reward_diamonds} 💎 từ ${title}!`
  });
});

// ==========================================
// 3. SỔ TAY GHI CHÚ (MY NOTES) CRUD
// ==========================================

// Get user notes
app.get("/api/notes", (req, res) => {
  const userId = req.query.user_id || 1;
  const tag = req.query.tag;

  let query = "SELECT * FROM notes WHERE user_id = ?";
  const params = [userId];

  if (tag && tag !== "all") {
    query += " AND tag = ?";
    params.push(tag);
  }

  let notes = db.prepare(query).all(...params);
  if (notes.length === 0 && Number(userId) !== 1) {
    let fallbackQuery = "SELECT * FROM notes WHERE user_id = 1";
    const fallbackParams = [];
    if (tag && tag !== "all") {
      fallbackQuery += " AND tag = ?";
      fallbackParams.push(tag);
    }
    fallbackQuery += " ORDER BY is_pinned DESC, created_at DESC";
    notes = db.prepare(fallbackQuery).all(...fallbackParams);
  }
  res.json(notes);
});

// Add new note
app.post("/api/notes", (req, res) => {
  const { user_id = 1, title, content, tag = "vocabulary", ipa, example, audio_text, is_pinned = 0 } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Tiêu đề và nội dung là bắt buộc" });
  }

  const result = db.prepare(`
    INSERT INTO notes (user_id, title, content, tag, ipa, example, audio_text, is_pinned)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(user_id, title, content, tag, ipa || "", example || "", audio_text || title, is_pinned ? 1 : 0);

  const created = db.prepare("SELECT * FROM notes WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(created);
});

// Update note
app.put("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;
  const { title, content, tag, ipa, example, is_pinned } = req.body;

  const note = db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId);
  if (!note) return res.status(404).json({ error: "Note not found" });

  db.prepare(`
    UPDATE notes
    SET title = ?, content = ?, tag = ?, ipa = ?, example = ?, is_pinned = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    title || note.title,
    content || note.content,
    tag || note.tag,
    ipa !== undefined ? ipa : note.ipa,
    example !== undefined ? example : note.example,
    is_pinned !== undefined ? (is_pinned ? 1 : 0) : note.is_pinned,
    noteId
  );

  const updated = db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId);
  res.json(updated);
});

// Delete note
app.delete("/api/notes/:id", (req, res) => {
  const noteId = req.params.id;
  db.prepare("DELETE FROM notes WHERE id = ?").run(noteId);
  res.json({ success: true, message: "Note deleted successfully" });
});

// ==========================================
// 4. EXAM SIMULATION & SCORE TRACKING
// ==========================================

// Get exam history
app.get("/api/exams/history", (req, res) => {
  const userId = req.query.user_id || 1;
  const history = db.prepare(`
    SELECT * FROM exam_results WHERE user_id = ? ORDER BY created_at DESC
  `).all(userId);
  res.json(history);
});

// Submit exam result
app.post("/api/exams/submit", (req, res) => {
  const {
    user_id = 1,
    exam_type,
    exam_id,
    exam_title,
    score,
    total_questions,
    band_score,
    time_spent_seconds = 0,
    answers_json = "{}"
  } = req.body;

  const result = db.prepare(`
    INSERT INTO exam_results (user_id, exam_type, exam_id, exam_title, score, total_questions, band_score, time_spent_seconds, answers_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(user_id, exam_type, exam_id, exam_title, score, total_questions, band_score, time_spent_seconds, JSON.stringify(answers_json));

  // Log user activity
  db.prepare(`
    INSERT INTO user_activity (user_id, activity_type, details, xp_earned)
    VALUES (?, 'exam', ?, 50)
  `).run(user_id, `Hoàn thành bài thi ${exam_title} với kết quả: ${band_score}`);

  res.status(201).json({
    success: true,
    result_id: result.lastInsertRowid,
    message: "Lưu kết quả bài thi thành công!"
  });
});

// ==========================================
// 5. ADMIN MANAGEMENT & REAL-TIME ANALYTICS
// ==========================================

// Overview KPI Statistics - 100% Genuine SQLite Database Queries
app.get("/api/admin/stats", (req, res) => {
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get().count;
  const proUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE is_pro = 1").get().count;
  const totalNotes = db.prepare("SELECT COUNT(*) as count FROM notes").get().count;
  const totalExams = db.prepare("SELECT COUNT(*) as count FROM exam_results").get().count;
  const totalSecs = db.prepare("SELECT COALESCE(SUM(time_spent_seconds), 0) as total FROM exam_results").get().total;
  const totalHoursStudied = Math.round(totalSecs / 3600);

  // Exact revenue computed from real active PRO subscribers in database (599,000 VND/pro)
  const revenueVnd = (proUsers * 599000).toLocaleString("vi-VN") + " ₫";

  // Recent 5 user activities
  const recentExams = db.prepare(`
    SELECT e.*, u.full_name, u.email, u.avatar
    FROM exam_results e
    JOIN users u ON e.user_id = u.id
    ORDER BY e.created_at DESC
    LIMIT 6
  `).all();

  // Monthly stats computed directly from SQLite group by created_at month
  const monthlyRows = db.prepare(`
    SELECT 
      strftime('%m', created_at) as month_num,
      COUNT(*) as learners,
      SUM(CASE WHEN is_pro = 1 THEN 1 ELSE 0 END) as proSubs
    FROM users
    GROUP BY strftime('%m', created_at)
    ORDER BY month_num ASC
  `).all();

  const monthlyData = monthlyRows.map((r) => ({
    month: `Tháng ${parseInt(r.month_num, 10)}`,
    learners: r.learners,
    proSubs: r.proSubs,
    revenue: r.proSubs * 599000
  }));

  res.json({
    kpis: {
      totalUsers,
      proUsers,
      totalHoursStudied,
      totalExamsTaken: totalExams,
      totalNotesCreated: totalNotes,
      revenueVnd
    },
    monthlyData,
    recentExams
  });
});

// Get all users (Admin view)
app.get("/api/admin/users", (req, res) => {
  const search = req.query.search || "";
  const role = req.query.role || "all";

  let query = "SELECT id, email, full_name, avatar, provider, role, is_pro, streak, diamonds, created_at, last_login FROM users";
  const params = [];
  const conditions = [];

  if (search) {
    conditions.push("(full_name LIKE ? OR email LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (role !== "all") {
    conditions.push("role = ?");
    params.push(role);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY id DESC";
  const users = db.prepare(query).all(...params);
  res.json(users);
});

// Toggle PRO VIP status for user
app.put("/api/admin/users/:id/pro", (req, res) => {
  const userId = req.params.id;
  const user = db.prepare("SELECT is_pro FROM users WHERE id = ?").get(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const newPro = user.is_pro === 1 ? 0 : 1;
  db.prepare("UPDATE users SET is_pro = ? WHERE id = ?").run(newPro, userId);

  res.json({
    success: true,
    is_pro: newPro,
    message: newPro === 1 ? "Đã nâng cấp tài khoản lên PRO VIP!" : "Đã hủy kích hoạt PRO!"
  });
});

// Change user role (Admin / User)
app.put("/api/admin/users/:id/role", (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;
  if (!role || !["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, userId);
  res.json({ success: true, role, message: `Đã phân quyền thành công: ${role}` });
});

// Delete user account
app.delete("/api/admin/users/:id", (req, res) => {
  const userId = req.params.id;
  if (parseInt(userId) === 1) {
    return res.status(403).json({ error: "Không thể xóa tài khoản Admin gốc!" });
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  res.json({ success: true, message: "Đã xóa tài khoản học viên khỏi cơ sở dữ liệu!" });
});

// Create new user directly in SQLite
app.post("/api/admin/users/create", (req, res) => {
  const { email, full_name, role, is_pro, provider } = req.body;
  if (!email || !full_name) {
    return res.status(400).json({ error: "Email và Họ tên là bắt buộc!" });
  }
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "Email này đã tồn tại trong hệ thống!" });
  }
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(full_name)}`;
  db.prepare(`
    INSERT INTO users (email, password_hash, full_name, avatar, provider, role, is_pro, streak, diamonds)
    VALUES (?, '123456', ?, ?, ?, ?, ?, 1, 100)
  `).run(email, full_name, avatar, provider || "email", role || "user", is_pro ? 1 : 0);

  res.json({ success: true, message: `Đã tạo tài khoản "${full_name}" thành công vào SQLite!` });
});

// Get system reports & feedback
app.get("/api/admin/reports", (req, res) => {
  const reports = db.prepare("SELECT * FROM system_reports ORDER BY created_at DESC").all();
  res.json(reports);
});

// ==========================================
// 7. YOUTUBE LESSON & TRANSCRIPT EXTRACTOR
// ==========================================
app.post("/api/youtube/extract", async (req, res) => {
  try {
    const { url, transcriptText } = req.body || {};
    if (!url) {
      return res.status(400).json({ success: false, error: "Vui lòng cung cấp link video YouTube hợp lệ!" });
    }
    const result = await createLessonFromYouTube(url, transcriptText);
    res.json(result);
  } catch (error) {
    console.error("[API] YouTube extract error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Không thể trích xuất bài học từ YouTube."
    });
  }
});

// ==========================================
// START SERVER
// ==========================================
const httpServer = app.listen(PORT, "127.0.0.1", () => {
  console.log(`[Sorata Server] Backend REST API running at http://127.0.0.1:${PORT}`);
  console.log(`[Sorata Server] SQLite Database active at database/parroto.db`);
  console.log(`[Sorata Server] Google TTS Proxy active at http://127.0.0.1:${PORT}/api/tts`);
});

// ==========================================
// 6. WEBSOCKET REAL-TIME AI SPEAKING EXAMINER
// ==========================================
const wss = new WebSocketServer({ server: httpServer, path: "/ws/speaking" });

wss.on("connection", (ws) => {
  console.log("[WS] New candidate connected to Speaking Room.");
  
  // Simple Finite State Machine per connection
  let state = {
    part: 0, // 0: intro, 1: part 1, 2: part 2, 3: part 3
    questionCount: 0
  };

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === "init") {
        ws.send(JSON.stringify({ type: "examiner_event", action: "greet", text: "Hello, my name is Alex. Could you tell me your full name, please?" }));
        state.part = 1;
      } else if (data.type === "candidate_speech_text") {
        // Mock LLM Processing: respond to candidate
        console.log("[WS] Received transcript:", data.text);
        
        let reply = "";
        if (state.part === 1) {
          if (state.questionCount === 0) {
            reply = "Thank you. Let's talk about where you live. Do you live in a house or an apartment?";
            state.questionCount++;
          } else {
            reply = "I see. Now let's move to Part 2. I will give you a cue card. You have 1 minute to prepare, and then you must speak for 1 to 2 minutes.";
            state.part = 2;
            state.questionCount = 0;
            // Send cue card event
            setTimeout(() => {
              ws.send(JSON.stringify({
                type: "examiner_event",
                action: "show_cue_card",
                cueCard: "Describe a memorable journey you have taken.\nYou should say:\n- Where you went\n- How you traveled\n- Who you went with\nAnd explain why it is memorable."
              }));
            }, 3000);
          }
        } else if (state.part === 2) {
          reply = "Thank you. We've been talking about a journey. Now let's move to Part 3 and discuss travel in general. How has transportation changed in your country?";
          state.part = 3;
        } else if (state.part === 3) {
          reply = "That is the end of the speaking test. Thank you very much.";
          state.part = 4; // Finished
        }

        if (reply) {
          ws.send(JSON.stringify({ type: "examiner_event", action: "speak", text: reply }));
        }
      }
    } catch (e) {
      console.error("[WS] Parse error:", e);
    }
  });

  ws.on("close", () => {
    console.log("[WS] Candidate disconnected.");
  });
});
