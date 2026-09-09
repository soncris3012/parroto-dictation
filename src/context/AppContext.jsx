import React, { createContext, useContext, useState, useEffect } from "react";
import { sounds } from "../utils/audioEffects";

const AppContext = createContext();

const DEFAULT_ADMIN_USER = {
  id: 1,
  email: "admin@parroto.app",
  full_name: "SonCris Administrator",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  provider: "email",
  role: "admin",
  is_pro: 1,
  streak: 28,
  diamonds: 2500,
  daily_minutes: 25
};

export function AppProvider({ children }) {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("parroto_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_ADMIN_USER;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Pro / Premium status (derived from currentUser or manual toggle)
  const [isPro, setIsPro] = useState(() => currentUser?.is_pro === 1);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);

  // Active Route navigation
  const [currentRoute, setCurrentRoute] = useState(() => {
    return localStorage.getItem("sorata_last_route") || "/vi/dashboard";
  });

  useEffect(() => {
    localStorage.setItem("sorata_last_route", currentRoute);
  }, [currentRoute]);

  // User Stats & Gamification
  const [streak, setStreak] = useState(() => currentUser?.streak || 28);
  const [diamonds, setDiamonds] = useState(() => currentUser?.diamonds || 2500);
  const [dailyMinutes, setDailyMinutes] = useState(22);
  const [dailyGoalMinutes] = useState(30);

  // Fetch live user status from SQLite WAL Database on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("parroto_user");
      if (saved) {
        const u = JSON.parse(saved);
        if (u?.id) {
          fetch(`/api/auth/me?user_id=${u.id}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
              if (data?.user) {
                setCurrentUser(data.user);
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {}
  }, []);

  // Sync user state with localStorage and isPro
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("parroto_user", JSON.stringify(currentUser));
      setIsPro(currentUser.is_pro === 1);
      setStreak(currentUser.streak || 1);
      setDiamonds(currentUser.diamonds || 100);
    } else {
      localStorage.removeItem("parroto_user");
      setIsPro(false);
    }
  }, [currentUser]);

  // Refresh user data directly from DB in real time
  const refreshUser = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch(`/api/auth/me?user_id=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) setCurrentUser(data.user);
      }
    } catch (e) {}
  };

  // Login handler with Email & Password
  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Đăng nhập thất bại");

    if (data.token) localStorage.setItem("parroto_token", data.token);
    setCurrentUser(data.user);
    sounds.playCorrect();
    return data.user;
  };

  // Register handler
  const register = async (email, password, full_name) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Đăng ký thất bại");

    if (data.token) localStorage.setItem("parroto_token", data.token);
    setCurrentUser(data.user);
    sounds.playLessonSuccess();
    return data.user;
  };

  // Google Identity Services (GSI) credential token verification
  const googleVerify = async (credential) => {
    const res = await fetch("/api/auth/google/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Xác thực Google thất bại");

    if (data.token) localStorage.setItem("parroto_token", data.token);
    setCurrentUser(data.user);
    sounds.playCorrect();
    return data.user;
  };

  // Real OAuth handler with genuine user data
  const oauthLogin = async ({ provider, email, full_name, avatar }) => {
    const res = await fetch("/api/auth/oauth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        email,
        full_name,
        avatar
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Đăng nhập OAuth thất bại");

    if (data.token) localStorage.setItem("parroto_token", data.token);
    setCurrentUser(data.user);
    sounds.playCorrect();
    return data.user;
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("parroto_user");
    localStorage.removeItem("parroto_token");
    sounds.playWrong();
  };

  // Update user profile or VIP in SQLite DB
  const updateUser = async (updates) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentUser.id, ...updates })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setCurrentUser(data.user);
      }
    } catch (e) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  // Activate PRO
  const activatePro = async () => {
    await updateUser({ is_pro: 1 });
    setIsPro(true);
    setIsPremiumModalOpen(false);
    sounds.playLessonSuccess();
  };

  // My Notes (Initial sample cache)
  const [savedNotes, setSavedNotes] = useState([]);

  // Fetch real notes from SQLite Database on mount or user change
  useEffect(() => {
    if (!currentUser) {
      setSavedNotes([]);
      return;
    }
    fetch(`/api/notes?user_id=${currentUser.id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedNotes(data);
        }
      })
      .catch(() => {});
  }, [currentUser?.id]);

  const addNote = async (note) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.id,
          title: note.word || note.title,
          content: note.meaning || note.content,
          tag: note.type || note.tag || "vocabulary",
          ipa: note.ipa || "",
          example: note.example || "",
          audio_text: note.word || note.title
        })
      });
      if (res.ok) {
        const created = await res.json();
        setSavedNotes((prev) => [created, ...prev]);
        sounds.playCorrect();
      }
    } catch (e) {
      // Local fallback
      const newEntry = {
        id: "note-" + Date.now(),
        title: note.word || note.title,
        content: note.meaning || note.content,
        tag: note.type || "vocabulary",
        ipa: note.ipa || "",
        example: note.example || "",
        created_at: new Date().toISOString()
      };
      setSavedNotes((prev) => [newEntry, ...prev]);
      sounds.playCorrect();
    }
  };

  const removeNote = async (id) => {
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
    } catch (e) {}
    setSavedNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Custom YouTube imported lessons
  const [customLessons, setCustomLessons] = useState([]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login,
        register,
        oauthLogin,
        googleVerify,
        refreshUser,
        logout,
        updateUser,
        isPro,
        setIsPro,
        activatePro,
        isPremiumModalOpen,
        setIsPremiumModalOpen,
        currentRoute,
        setCurrentRoute,
        streak,
        setStreak,
        diamonds,
        setDiamonds,
        dailyMinutes,
        dailyGoalMinutes,
        savedNotes,
        setSavedNotes,
        addNote,
        removeNote,
        customLessons,
        setCustomLessons
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
export default AppContext;
