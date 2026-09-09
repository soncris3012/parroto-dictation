import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import VideoPlayer from "./components/VideoPlayer";
import DictationSection from "./components/DictationSection";
import TranscriptTab from "./components/TranscriptTab";
import WordLookupPopover from "./components/WordLookupPopover";
import DictionarySearchModal from "./components/DictionarySearchModal";
import LessonCompleteModal from "./components/LessonCompleteModal";
import PremiumModal from "./components/PremiumModal";
import YouTubeImportModal from "./components/YouTubeImportModal";
import AuthModal from "./components/AuthModal";
import DashboardView from "./views/DashboardView";
import TopicsView from "./views/TopicsView";
import DictationCatalogView from "./views/DictationCatalogView";
import ShadowingView from "./views/ShadowingView";
import VocabularySRSView from "./views/VocabularySRSView";
import SpeakingPracticeView from "./views/SpeakingPracticeView";
import ToeicExamsView from "./views/ToeicExamsView";
import IeltsExamsView from "./views/IeltsExamsView";
import MyNotesView from "./views/MyNotesView";
import AdminDashboardView from "./views/AdminDashboardView";
import LeaderboardView from "./views/LeaderboardView";
import ShopView from "./views/ShopView";
import GamesView from "./views/GamesView";
import { lessonsCatalog } from "./data/lessonsCatalog";
import { Headphones, FileText, ArrowLeft } from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext";

function MainContent() {
  const [theme, setTheme] = useState("dark");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeLessonTab, setActiveLessonTab] = useState("dictation");

  const {
    currentRoute,
    setCurrentRoute,
    isPremiumModalOpen,
    setIsPremiumModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    addNote,
    customLessons,
    setCustomLessons
  } = useApp();

  const [isYtModalOpen, setIsYtModalOpen] = useState(false);
  const [isDictModalOpen, setIsDictModalOpen] = useState(false);
  const [popoverState, setPopoverState] = useState(null);

  // Active Lesson State - defaults to first lesson ("How To Wake Up Better")
  const [activeLesson, setActiveLesson] = useState(lessonsCatalog[0]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoLoop, setAutoLoop] = useState(true);
  const [dictationMode, setDictationMode] = useState("medium");

  const [blankAnswers, setBlankAnswers] = useState({});
  const [correctWords, setCorrectWords] = useState({});
  const [hasBeenGraded, setHasBeenGraded] = useState(false);
  const [completedIndices, setCompletedIndices] = useState(new Set());
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const sentences = activeLesson?.sentence_ids || [];
  const currentSentence = sentences[activeIndex] || null;

  // Open any lesson dynamically!
  const handleOpenLesson = (lessonItem) => {
    if (!lessonItem) return;

    // Check if lesson is in lessonsCatalog
    const match = lessonsCatalog.find(
      (l) => l.slug === lessonItem.slug || l._id === lessonItem._id
    );

    if (match) {
      setActiveLesson(match);
    } else {
      // Extract video ID from thumbnail or url
      let videoId = "nfu3opYpD7E";
      const m = (lessonItem.thumbnail || lessonItem.url || "").match(/(?:v=|\/vi\/|\/embed\/|\/watch\?v=|youtu\.be\/)([\w-]{11})/);
      if (m) videoId = m[1];
      else if (lessonItem.videoId) videoId = lessonItem.videoId;

      const dynamicLesson = {
        _id: lessonItem._id || "lesson-" + Date.now(),
        slug: lessonItem.slug || "custom-lesson",
        title: lessonItem.title || "Bài học luyện nghe",
        duration: lessonItem.duration || "02:00",
        difficulty: lessonItem.difficulty || "B1",
        videoId: videoId,
        topic_id: { name: lessonItem.topic || "Luyện nghe chọn lọc" },
        sentence_ids: lessonItem.sentence_ids && lessonItem.sentence_ids.length > 0
          ? lessonItem.sentence_ids
          : [
              {
                _id: "s-1",
                text: "Welcome to this listening exercise on Sorata.",
                translations: { vi: "Chào mừng bạn đến với bài luyện nghe trên Sorata." },
                ipa: "/ˈwɛl.kəm tuː ðɪs ˈlɪs.ən.ɪŋ ˈɛk.sə.saɪz ɒn ˈpæ.rə.təʊ/",
                start_ms: 0,
                end_ms: 3800
              },
              {
                _id: "s-2",
                text: "Listen carefully to every word and sentence spoken.",
                translations: { vi: "Lắng nghe cẩn thận từng từ và câu thoại được nói." },
                ipa: "/ˈlɪs.ən ˈkeə.fəl.i tuː ˈɛv.ri wɜːd ænd ˈsɛn.təns ˈspəʊ.kən/",
                start_ms: 4000,
                end_ms: 8200
              },
              {
                _id: "s-3",
                text: "Try to write down what you hear as accurately as possible.",
                translations: { vi: "Hãy cố gắng viết lại những gì bạn nghe được chính xác nhất có thể." },
                ipa: "/traɪ tuː raɪt daʊn wɒt juː hɪər æz ˈæk.jə.rət.li æz ˈpɒs.ə.bᵊl/",
                start_ms: 8500,
                end_ms: 13200
              }
            ]
      };
      setActiveLesson(dynamicLesson);
    }

    setActiveIndex(0);
    setBlankAnswers({});
    setCorrectWords({});
    setHasBeenGraded(false);
    setCompletedIndices(new Set());
    setIsPlaying(true);
    setCurrentRoute("/vi/lessons/dictation/" + (lessonItem.slug || "lesson"));
  };

  const isSentenceCompleted = React.useMemo(() => {
    if (!currentSentence?.text) return false;
    const words = currentSentence.text.trim().split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const clean = words[i].replace(/[^\w]/g, "");
      if (clean.length === 0) continue;
      const isWordCorrect =
        correctWords[i] === true ||
        (blankAnswers[i] && blankAnswers[i].trim().toLowerCase() === clean.toLowerCase());
      if (!isWordCorrect) return false;
    }
    return true;
  }, [currentSentence, correctWords, blankAnswers]);

  useEffect(() => {
    if (isSentenceCompleted && !completedIndices.has(activeIndex)) {
      setCompletedIndices((prev) => {
        const next = new Set(prev);
        next.add(activeIndex);
        if (next.size === sentences.length && sentences.length > 0) {
          setIsCompleteModalOpen(true);
        }
        return next;
      });
    }
  }, [isSentenceCompleted, activeIndex, completedIndices, sentences.length]);

  const goToSentence = (index) => {
    if (index < 0 || index >= sentences.length) return;
    setActiveIndex(index);
    setBlankAnswers({});
    setCorrectWords({});
    setHasBeenGraded(false);
    setPopoverState(null);
  };

  const handleNext = () => {
    if (activeIndex + 1 < sentences.length) {
      goToSentence(activeIndex + 1);
    } else {
      setIsCompleteModalOpen(true);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      goToSentence(activeIndex - 1);
    }
  };

  const handleSaveWordToNotes = (info) => {
    addNote({
      word: info.word,
      ipa: info.ipa,
      type: info.type,
      meaning: info.meaning,
      example: info.example,
      lesson: activeLesson?.title || "Bài học"
    });
  };

  const handleImportYouTubeSuccess = (newLesson) => {
    setCustomLessons((prev) => [newLesson, ...prev]);
    handleOpenLesson(newLesson);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Top Header */}
      <Header
        theme={theme}
        setTheme={setTheme}
        onOpenDictionary={() => setIsDictModalOpen(true)}
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Guard: nếu chưa đăng nhập thì show màn hình landing đẹp */}
      {!currentUser && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", backgroundColor: "var(--background)", gap: "24px",
          padding: "40px 20px"
        }}>
          <div style={{ textAlign: "center", maxWidth: "480px" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🦜</div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--foreground)", marginBottom: "8px" }}>
              Chào mừng đến Sorata!
            </h1>
            <p style={{ color: "var(--muted-foreground)", fontSize: "16px", marginBottom: "32px", lineHeight: 1.6 }}>
              Nền tảng luyện tiếng Anh thông minh với AI. Đăng nhập để bắt đầu hành trình chinh phục IELTS & TOEIC của bạn.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                padding: "14px 40px", borderRadius: "12px", border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff", fontSize: "16px", fontWeight: 700,
                boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
              }}
            >
              Đăng Nhập / Đăng Ký
            </button>
          </div>
          <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
      )}

      {/* Main Body - chỉ render khi đã đăng nhập */}
      {currentUser && <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Left Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

        {/* Dynamic Route Content */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            overflowY: "auto",
            padding: "20px 24px",
            backgroundColor: "var(--background)"
          }}
        >
          {currentRoute === "/vi/dashboard" && (
            <DashboardView onOpenLesson={(lesson) => handleOpenLesson(lesson || activeLesson)} />
          )}

          {currentRoute === "/vi/topics" && (
            <TopicsView
              onSelectTopic={(cat) => {
                if (cat.lessons && cat.lessons[0]) {
                  handleOpenLesson(cat.lessons[0]);
                } else {
                  setCurrentRoute("/vi/dictation");
                }
              }}
            />
          )}

          {currentRoute === "/vi/dictation" && (
            <DictationCatalogView
              onOpenLesson={handleOpenLesson}
              onOpenYouTubeModal={() => setIsYtModalOpen(true)}
            />
          )}

          {currentRoute === "/vi/shadowing" && <ShadowingView />}

          {currentRoute === "/vi/vocabulary" && <VocabularySRSView />}

          {currentRoute === "/vi/practice-english-speaking" && <SpeakingPracticeView />}

          {currentRoute === "/vi/exams/toeic" && <ToeicExamsView />}

          {currentRoute === "/vi/exams/ielts" && <IeltsExamsView />}

          {currentRoute === "/vi/my-notes" && <MyNotesView />}

          {currentRoute === "/vi/leaderboard" && <LeaderboardView />}

          {currentRoute === "/vi/shop" && <ShopView />}

          {currentRoute === "/vi/games" && <GamesView />}

          {currentRoute === "/vi/admin" && <AdminDashboardView />}

          {currentRoute.startsWith("/vi/lessons/dictation") && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              {/* Back to catalog button */}
              <div style={{ marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <button
                  onClick={() => setCurrentRoute("/vi/dictation")}
                  className="btn-ghost"
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  <ArrowLeft size={16} /> Quay lại danh mục bài nghe
                </button>

                <div
                  style={{
                    display: "flex",
                    backgroundColor: "var(--secondary)",
                    borderRadius: "10px",
                    padding: "3px",
                    gap: "4px"
                  }}
                >
                  <button
                    onClick={() => setActiveLessonTab("dictation")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor: activeLessonTab === "dictation" ? "var(--card)" : "transparent",
                      color: activeLessonTab === "dictation" ? "var(--primary)" : "var(--muted-foreground)"
                    }}
                  >
                    <Headphones size={14} /> Luyện nghe
                  </button>
                  <button
                    onClick={() => setActiveLessonTab("transcript")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      backgroundColor: activeLessonTab === "transcript" ? "var(--card)" : "transparent",
                      color: activeLessonTab === "transcript" ? "var(--primary)" : "var(--muted-foreground)"
                    }}
                  >
                    <FileText size={14} /> Lời thoại ({sentences.length})
                  </button>
                </div>
              </div>

              {/* Lesson Title Banner */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      backgroundColor: "var(--accent)",
                      color: "var(--primary)",
                      padding: "2px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    {activeLesson.topic_id?.name || activeLesson.topic || "Sorata Dictation"}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                    {activeLesson.duration} • {sentences.length} câu thoại
                  </span>
                </div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--foreground)" }}>
                  {activeLesson.title}
                </h2>
              </div>

              {/* Lesson Split Layout */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
                  gap: "20px",
                  flex: 1,
                  minHeight: "520px"
                }}
              >
                <VideoPlayer
                  key={activeLesson.videoId || activeLesson._id}
                  videoId={activeLesson.videoId || "nfu3opYpD7E"}
                  activeSentence={currentSentence}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  playbackSpeed={playbackSpeed}
                  setPlaybackSpeed={setPlaybackSpeed}
                  autoLoop={autoLoop}
                  setAutoLoop={setAutoLoop}
                  onReplayTrigger={() => setIsPlaying(true)}
                  allSentences={sentences}
                  activeIndex={activeIndex}
                  onSelectSentence={goToSentence}
                  completedIndices={completedIndices}
                />

                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  {activeLessonTab === "dictation" ? (
                    <DictationSection
                      sentence={currentSentence}
                      sentenceIndex={activeIndex}
                      totalSentences={sentences.length}
                      dictationMode={dictationMode}
                      setDictationMode={setDictationMode}
                      blankAnswers={blankAnswers}
                      setBlankAnswers={setBlankAnswers}
                      correctWords={correctWords}
                      setCorrectWords={setCorrectWords}
                      hasBeenGraded={hasBeenGraded}
                      setHasBeenGraded={setHasBeenGraded}
                      isCompleted={isSentenceCompleted}
                      onReplay={() => setIsPlaying(true)}
                      onNext={handleNext}
                      onPrev={handlePrev}
                      onWordClick={(word, pos) => setPopoverState({ word, position: pos })}
                    />
                  ) : (
                    <TranscriptTab
                      sentences={sentences}
                      activeIndex={activeIndex}
                      onSelectSentence={(idx) => {
                        goToSentence(idx);
                        setActiveLessonTab("dictation");
                      }}
                      completedIndices={completedIndices}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>}

      {/* Modals chỉ render khi đã đăng nhập */}
      {currentUser && <>
        {/* Floating Word Lookup Popover */}
        {popoverState && (
          <WordLookupPopover
            word={popoverState.word}
            position={popoverState.position}
            onClose={() => setPopoverState(null)}
            onSaveWord={handleSaveWordToNotes}
          />
        )}

        {/* Dictionary Search Modal */}
        <DictionarySearchModal
          isOpen={isDictModalOpen}
          onClose={() => setIsDictModalOpen(false)}
        />

        {/* Sorata Premium Pro Modal */}
        <PremiumModal
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
        />

        {/* Account Login / Register Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Pro YouTube Importer Modal */}
        <YouTubeImportModal
          isOpen={isYtModalOpen}
          onClose={() => setIsYtModalOpen(false)}
          onImportSuccess={handleImportYouTubeSuccess}
        />

        {/* Lesson Complete Celebration Modal */}
        <LessonCompleteModal
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          onRestart={() => {
            setIsCompleteModalOpen(false);
            setCompletedIndices(new Set());
            goToSentence(0);
          }}
          totalSentences={sentences.length}
        />
      </>}
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#080e1e",
            color: "#f8fafc",
            textAlign: "center",
            padding: "20px"
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "10px", color: "#38bdf8" }}>
            Hệ thống đang làm mới giao diện
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "20px", maxWidth: "480px" }}>
            Một số tài nguyên vừa được cập nhật theo cơ sở dữ liệu SQLite mới. Vui lòng bấm nút bên dưới để tiếp tục học.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="btn-duo btn-primary"
            style={{ padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: 700 }}
          >
            Tải Lại Ứng Dụng
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
