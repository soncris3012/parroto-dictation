import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, Circle, FileText, CheckCircle2 } from "lucide-react";
import { playGoogleSpeech } from "../utils/pronunciationAudio";
import { sounds } from "../utils/audioEffects";

export default function SpeakingExaminerRoom({ onFinish }) {
  const [ws, setWs] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [cueCard, setCueCard] = useState(null);
  const [countdown, setCountdown] = useState(0); // 60s countdown for part 2
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // 1. Initialize WebSocket
    const wsUrl = import.meta.env.VITE_WS_URL ? `${import.meta.env.VITE_WS_URL}/ws/speaking` : "ws://127.0.0.1:5001/ws/speaking";
    const socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      setConnected(true);
      socket.send(JSON.stringify({ type: "init" }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "examiner_event") {
          if (data.action === "greet" || data.action === "speak") {
            addMessage("Examiner", data.text);
            playGoogleSpeech(data.text, 0.95);
          } else if (data.action === "show_cue_card") {
            setCueCard(data.cueCard);
            setCountdown(60);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    setWs(socket);

    // 2. Initialize SpeechRecognition (Mock STT)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        addMessage("You", transcript);
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "candidate_speech_text", text: transcript }));
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      socket.close();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Countdown timer for Cue Card (Part 2)
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && cueCard) {
      // Time is up, auto start recording
      sounds.playClick();
      toggleRecording();
    }
  }, [countdown, cueCard]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text, id: Date.now() + Math.random() }]);
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Browser does not support Speech Recognition.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      sounds.playClick();
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div style={{ display: "flex", gap: "24px", height: "100%", minHeight: "600px" }}>
      
      {/* Left: Video & Examiner */}
      <div style={{ 
        flex: 1, 
        backgroundColor: "var(--card)", 
        border: "2px solid var(--border)", 
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Examiner Video Mock */}
        <div style={{ flex: 1, backgroundColor: "#1e293b", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
           {connected ? (
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=1e293b" alt="Examiner" style={{ width: "200px", height: "200px" }} />
           ) : (
             <div style={{ color: "var(--muted-foreground)" }}>Connecting to Examiner Room...</div>
           )}
           <div style={{ position: "absolute", bottom: "16px", left: "16px", backgroundColor: "rgba(0,0,0,0.6)", padding: "4px 12px", borderRadius: "8px", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
              <Video size={14} /> AI Examiner (Alex)
           </div>
           
           {/* Recording Indicator */}
           {isRecording && (
             <div style={{ position: "absolute", top: "16px", right: "16px", backgroundColor: "rgba(239, 68, 68, 0.9)", padding: "4px 12px", borderRadius: "8px", color: "#fff", display: "flex", alignItems: "center", gap: "6px", animation: "pulse 1.5s infinite" }}>
                <Circle size={10} fill="#fff" /> You are speaking
             </div>
           )}
        </div>

        {/* Controls */}
        <div style={{ padding: "20px", display: "flex", justifyContent: "center", gap: "16px", backgroundColor: "var(--card)", borderTop: "1px solid var(--border)" }}>
           <button
             onClick={toggleRecording}
             style={{
               width: "64px", height: "64px", borderRadius: "50%",
               backgroundColor: isRecording ? "#ef4444" : "var(--muted)",
               border: isRecording ? "none" : "2px solid var(--border)",
               color: isRecording ? "#fff" : "var(--foreground)",
               display: "flex", alignItems: "center", justifyContent: "center",
               cursor: "pointer", transition: "all 0.2s ease"
             }}
           >
             {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
           </button>
           
           <button
             onClick={() => onFinish && onFinish()}
             className="btn-ghost"
             style={{ alignSelf: "center", color: "#f59e0b" }}
           >
             Kết Thúc Sớm
           </button>
        </div>
      </div>

      {/* Right: Transcript & Cue Card */}
      <div style={{ 
        width: "380px", 
        display: "flex", 
        flexDirection: "column",
        gap: "16px"
      }}>
        {/* Cue Card Area */}
        {cueCard && (
          <div style={{ 
            backgroundColor: "#fef3c7", 
            border: "2px solid #f59e0b", 
            borderRadius: "16px", 
            padding: "20px",
            color: "#92400e"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
                <FileText size={18} /> Part 2: Cue Card
              </h3>
              {countdown > 0 && (
                <span style={{ fontWeight: 900, color: "#d97706", fontSize: "18px" }}>
                  00:{countdown.toString().padStart(2, "0")}
                </span>
              )}
            </div>
            <div style={{ fontSize: "14px", lineHeight: 1.6, whiteSpace: "pre-wrap", fontWeight: 600 }}>
              {cueCard}
            </div>
          </div>
        )}

        {/* Live Transcript / Subtitles */}
        <div style={{ 
          flex: 1, 
          backgroundColor: "var(--card)", 
          border: "2px solid var(--border)", 
          borderRadius: "16px",
          padding: "20px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <h3 style={{ fontSize: "14px", fontWeight: 800, color: "var(--foreground)", marginBottom: "8px" }}>Live Transcript</h3>
          {messages.map(msg => (
            <div key={msg.id} style={{ 
              alignSelf: msg.sender === "You" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "You" ? "rgba(139, 92, 246, 0.2)" : "var(--muted)",
              color: msg.sender === "You" ? "#a78bfa" : "var(--foreground)",
              padding: "10px 14px",
              borderRadius: "12px",
              maxWidth: "85%",
              fontSize: "14px",
              lineHeight: 1.5,
              border: msg.sender === "You" ? "1px solid #8b5cf6" : "1px solid var(--border)"
            }}>
              <div style={{ fontSize: "11px", fontWeight: 800, marginBottom: "4px", opacity: 0.7 }}>{msg.sender}</div>
              {msg.text}
            </div>
          ))}
          {messages.length === 0 && (
            <div style={{ color: "var(--muted-foreground)", fontSize: "13px", textAlign: "center", marginTop: "20px" }}>
              The conversation transcript will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
