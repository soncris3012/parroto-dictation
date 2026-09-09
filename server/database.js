import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, "../database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "parroto.db");
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

// Initialize relational schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    full_name TEXT NOT NULL,
    avatar TEXT,
    provider TEXT DEFAULT 'email',
    role TEXT DEFAULT 'user', -- 'user' | 'admin'
    is_pro INTEGER DEFAULT 0, -- 0 | 1
    streak INTEGER DEFAULT 1,
    diamonds INTEGER DEFAULT 120,
    daily_minutes INTEGER DEFAULT 15,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tag TEXT DEFAULT 'vocabulary', -- 'vocabulary' | 'grammar' | 'idioms' | 'pronunciation' | 'general'
    ipa TEXT,
    example TEXT,
    audio_text TEXT,
    is_pinned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exam_type TEXT NOT NULL, -- 'toeic' | 'ielts'
    exam_id TEXT NOT NULL,
    exam_title TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    band_score TEXT, -- '850/990' or 'Band 7.5'
    time_spent_seconds INTEGER DEFAULT 0,
    answers_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL, -- 'dictation' | 'shadowing' | 'speaking' | 'exam' | 'vocabulary'
    details TEXT,
    xp_earned INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS system_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_type TEXT DEFAULT 'feedback',
    user_email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending' | 'resolved'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial Admin & sample learners if database is empty
const checkUsers = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (checkUsers.count === 0) {
  console.log("Seeding initial users and administrative accounts...");

  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, avatar, provider, role, is_pro, streak, diamonds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. Admin Master Account
  insertUser.run(
    "admin@parroto.app",
    "admin123", // In production you'd use bcrypt; simple hash/plain for quick simulation
    "SonCris Administrator",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "email",
    "admin",
    1,
    28,
    2500
  );

  // 2. Demo PRO Learner
  insertUser.run(
    "hocvien.pro@gmail.com",
    "123456",
    "Trần Minh Đức (Học viên VIP)",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "google",
    "user",
    1,
    14,
    890
  );

  // 3. Regular Learner
  insertUser.run(
    "nguyen.hoa@gmail.com",
    "123456",
    "Nguyễn Thị Mai Hoa",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "google",
    "user",
    0,
    5,
    340
  );

  // 4. Apple User
  insertUser.run(
    "le.hoang.apple@icloud.com",
    "123456",
    "Lê Huy Hoàng",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "apple",
    "user",
    1,
    9,
    620
  );

  // 5. Facebook User
  insertUser.run(
    "pham.anh.fb@facebook.com",
    "123456",
    "Phạm Ngọc Ánh",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "facebook",
    "user",
    0,
    3,
    180
  );

  // Seed sample notes
  const insertNote = db.prepare(`
    INSERT INTO notes (user_id, title, content, tag, ipa, example, audio_text, is_pinned)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertNote.run(
    1,
    "Strike a chord",
    "Thành ngữ: Tạo cảm xúc đồng cảm sâu sắc hoặc gợi nhớ kỷ niệm quen thuộc với ai đó.",
    "idioms",
    "/straɪk ə kɔːd/",
    "Her emotional speech struck a chord with the audience.",
    "Her emotional speech struck a chord with the audience.",
    1
  );

  insertNote.run(
    1,
    "Procrastinate",
    "Động từ: Trì hoãn công việc phải làm, chần chừ đến phút chót.",
    "vocabulary",
    "/prəʊˈkræs.tɪ.neɪt/",
    "I always procrastinate when I have to write essays.",
    "procrastinate",
    0
  );

  insertNote.run(
    1,
    "In terms of",
    "Cụm từ liên kết (Collocation/Grammar): Xét về mặt, liên quan đến khía cạnh nào đó.",
    "grammar",
    "/ɪn tɜːmz ɒv/",
    "In terms of salary, the new job offer is much more appealing.",
    "In terms of salary, the new job offer is much more appealing.",
    0
  );

  // Seed sample exam results
  const insertExam = db.prepare(`
    INSERT INTO exam_results (user_id, exam_type, exam_id, exam_title, score, total_questions, band_score, time_spent_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertExam.run(1, "toeic", "ets-2024-test-01", "ETS TOEIC 2024 Actual Test 01", 185, 200, "880/990", 5400);
  insertExam.run(1, "ielts", "cam-19-test-01", "Cambridge IELTS 19 Academic Test 01", 34, 40, "Band 8.0", 1800);
  insertExam.run(2, "toeic", "ets-2024-test-02", "ETS TOEIC 2024 Actual Test 02", 160, 200, "750/990", 5200);

  // Seed system reports
  const insertReport = db.prepare(`
    INSERT INTO system_reports (report_type, user_email, subject, message, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertReport.run("feedback", "hocvien.pro@gmail.com", "Thêm đề Cam 20", "Mong Parroto cập nhật thêm giải thích chi tiết Part 3 và Part 4 cho đề Cam 20 mới nhất!", "resolved");
  insertReport.run("feedback", "nguyen.hoa@gmail.com", "Góp ý giao diện", "Màu sắc Dark Navy rất đẹp, mong có thêm tính năng xuất ghi chú sang file PDF.", "pending");

  console.log("Database initialized & seeded successfully!");
}

export default db;
