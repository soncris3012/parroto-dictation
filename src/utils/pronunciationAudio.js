// High-Quality Standard Google English Pronunciation Service
// Uses Google Translate Standard High-Definition English Audio API (client=tw-ob)
// Supports individual vocabulary words, idioms, and long sentences with automatic seamless chaining

let currentAudio = null;
let currentPlayId = 0;

function splitIntoChunks(text, maxLength = 160) {
  if (text.length <= maxLength) return [text];

  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = "";

  for (const word of words) {
    if ((currentChunk + " " + word).trim().length <= maxLength) {
      currentChunk = (currentChunk + " " + word).trim();
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = word;
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

export function playGoogleSpeech(text, rate = 1.0) {
  if (!text || typeof text !== "string") return;

  const cleanText = text.trim();
  if (!cleanText) return;

  // Stop any ongoing playback
  currentPlayId++;
  const playId = currentPlayId;

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  const chunks = splitIntoChunks(cleanText, 160);

  function playChunk(index) {
    if (playId !== currentPlayId) return;
    if (index >= chunks.length) return;

    const chunk = chunks[index];
    const encoded = encodeURIComponent(chunk);
    // Use backend proxy to strip browser Referer and stream pristine Google American English
    const googleTtsUrl = `/api/tts?text=${encoded}&lang=en`;

    try {
      const audio = new Audio(googleTtsUrl);
      audio.playbackRate = rate;
      currentAudio = audio;

      audio.onended = () => {
        if (playId === currentPlayId) {
          playChunk(index + 1);
        }
      };

      audio.onerror = (err) => {
        console.warn("Google TTS audio stream error, falling back to Web Speech:", err);
        if (playId === currentPlayId) {
          fallbackWebSpeech(cleanText, rate);
        }
      };

      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          console.warn("Autoplay or network restriction, falling back to Web Speech:", err);
          if (playId === currentPlayId) {
            fallbackWebSpeech(cleanText, rate);
          }
        });
      }
    } catch (e) {
      fallbackWebSpeech(cleanText, rate);
    }
  }

  playChunk(0);
}

function fallbackWebSpeech(text, rate = 1.0) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;

    // Pick highest quality US English voice available
    const voices = window.speechSynthesis.getVoices();
    const usVoice =
      voices.find(
        (v) =>
          (v.lang === "en-US" || v.lang === "en_US") &&
          (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
      ) ||
      voices.find((v) => v.lang.startsWith("en-US") || v.lang.startsWith("en_US")) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (usVoice) utterance.voice = usVoice;
    window.speechSynthesis.speak(utterance);
  }
}

export default playGoogleSpeech;
