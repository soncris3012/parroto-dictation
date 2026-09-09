import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Repeat, FastForward } from "lucide-react";

export default function VideoPlayer({
  videoId = "nfu3opYpD7E",
  activeSentence,
  isPlaying,
  setIsPlaying,
  playbackSpeed = 1,
  setPlaybackSpeed,
  autoLoop = true,
  setAutoLoop,
  onReplayTrigger,
  allSentences = [],
  activeIndex = 0,
  onSelectSentence,
  completedIndices = new Set()
}) {
  const playerRef = useRef(null);
  const playerIdRef = useRef("yt-player-" + Math.random().toString(36).substring(2, 9));
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const loopIntervalRef = useRef(null);
  const currentVideoIdRef = useRef(videoId);

  // Load YouTube Iframe API
  useEffect(() => {
    let isCancelled = false;

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady();
        if (!isCancelled) initPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      initPlayer();
    }

    return () => {
      isCancelled = true;
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, []);

  const initPlayer = () => {
    if (playerRef.current) return;
    try {
      playerRef.current = new window.YT.Player(playerIdRef.current, {
        height: "100%",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: () => {
            setIsReady(true);
            currentVideoIdRef.current = videoId;
            if (activeSentence) {
              seekToSentence(activeSentence, false);
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (
              event.data === window.YT.PlayerState.PAUSED ||
              event.data === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
            }
          }
        }
      });
    } catch (e) {
      console.warn("YouTube player init error:", e);
    }
  };

  // Reload new video if videoId changes!
  useEffect(() => {
    if (isReady && playerRef.current && videoId !== currentVideoIdRef.current) {
      currentVideoIdRef.current = videoId;
      const startSec = activeSentence ? activeSentence.start_ms / 1000 : 0;
      if (typeof playerRef.current.loadVideoById === "function") {
        playerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: startSec
        });
        setIsPlaying(true);
      } else if (typeof playerRef.current.cueVideoById === "function") {
        playerRef.current.cueVideoById({
          videoId: videoId,
          startSeconds: startSec
        });
      }
    }
  }, [videoId, isReady, activeSentence]);

  // Sync seek when activeSentence changes within current video
  useEffect(() => {
    if (isReady && activeSentence && videoId === currentVideoIdRef.current) {
      seekToSentence(activeSentence, isPlaying);
    }
  }, [activeSentence, isReady]);

  // Monitor playback boundary for sentence loop
  useEffect(() => {
    if (!isReady || !activeSentence) return;
    const startSec = activeSentence.start_ms / 1000;
    const endSec = activeSentence.end_ms / 1000;

    if (loopIntervalRef.current) clearInterval(loopIntervalRef.current);

    loopIntervalRef.current = setInterval(() => {
      if (!playerRef.current || typeof playerRef.current.getCurrentTime !== "function") return;
      try {
        const curr = playerRef.current.getCurrentTime();
        setCurrentTime(curr);

        if (curr >= endSec) {
          if (autoLoop) {
            playerRef.current.seekTo(startSec, true);
            playerRef.current.playVideo();
          } else {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
          }
        }
      } catch (err) {
        // ignore iframe access errors
      }
    }, 60);

    return () => clearInterval(loopIntervalRef.current);
  }, [isReady, activeSentence, autoLoop]);

  // Update speed
  useEffect(() => {
    if (isReady && playerRef.current && typeof playerRef.current.setPlaybackRate === "function") {
      playerRef.current.setPlaybackRate(playbackSpeed);
    }
  }, [playbackSpeed, isReady]);

  const seekToSentence = (sentence, shouldPlay = true) => {
    if (!playerRef.current || typeof playerRef.current.seekTo !== "function") return;
    const startSec = sentence.start_ms / 1000;
    playerRef.current.seekTo(startSec, true);
    if (shouldPlay) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      if (activeSentence) {
        const curr = playerRef.current.getCurrentTime();
        const startSec = activeSentence.start_ms / 1000;
        const endSec = activeSentence.end_ms / 1000;
        if (curr < startSec || curr >= endSec) {
          playerRef.current.seekTo(startSec, true);
        }
      }
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleReplay = () => {
    if (activeSentence && playerRef.current) {
      seekToSentence(activeSentence, true);
      if (onReplayTrigger) onReplayTrigger();
    }
  };

  const speeds = [0.5, 0.75, 0.9, 1.0, 1.25];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--card)",
        border: "2px solid var(--border)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
      }}
    >
      {/* Video Container (16:9) */}
      <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", backgroundColor: "#000" }}>
        <div
          id={playerIdRef.current}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%"
          }}
        />
      </div>

      {/* Media Controls Bar */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--card)",
          gap: "12px",
          flexWrap: "wrap"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handlePlayPause}
            className="btn-duo btn-primary"
            style={{ padding: "8px 14px", borderRadius: "10px", fontSize: "13px" }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span style={{ marginLeft: "6px" }}>{isPlaying ? "Tạm dừng" : "Phát"}</span>
          </button>

          <button
            onClick={handleReplay}
            className="btn-duo btn-outline"
            style={{ padding: "8px 12px", borderRadius: "10px", fontSize: "13px" }}
            title="Phím tắt: Space hoặc Tab"
          >
            <RotateCcw size={15} />
            <span style={{ marginLeft: "6px" }}>Nghe lại</span>
          </button>
        </div>

        {/* Speed & Loop toggles */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Loop toggle */}
          <button
            onClick={() => setAutoLoop(!autoLoop)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: autoLoop ? "var(--accent)" : "transparent",
              color: autoLoop ? "var(--accent-foreground)" : "var(--muted-foreground)",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer"
            }}
            title="Tự động lặp lại câu đang học"
          >
            <Repeat size={14} />
            <span>Lặp câu</span>
          </button>

          {/* Speed Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--secondary)",
              borderRadius: "8px",
              padding: "2px"
            }}
          >
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setPlaybackSpeed(s)}
                style={{
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: "pointer",
                  backgroundColor: playbackSpeed === s ? "var(--primary)" : "transparent",
                  color: playbackSpeed === s ? "#fff" : "var(--muted-foreground)"
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sentence Timeline Pills */}
      <div
        style={{
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          overflowX: "auto",
          backgroundColor: "var(--muted)"
        }}
      >
        {allSentences.map((s, idx) => {
          const isCurrent = idx === activeIndex;
          const isCompleted = completedIndices.has(idx);

          return (
            <button
              key={s._id || idx}
              onClick={() => onSelectSentence(idx)}
              style={{
                flexShrink: 0,
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                border: isCurrent ? "2px solid var(--primary)" : "1px solid var(--border)",
                backgroundColor: isCurrent
                  ? "var(--primary)"
                  : isCompleted
                  ? "var(--success)"
                  : "var(--card)",
                color: isCurrent || isCompleted ? "#ffffff" : "var(--muted-foreground)",
                fontWeight: 700,
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isCurrent ? "0 0 0 3px var(--accent)" : "none"
              }}
              title={`Câu ${idx + 1}: ${s.text.slice(0, 30)}...`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
