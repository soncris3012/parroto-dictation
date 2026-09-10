import { YoutubeTranscript } from "youtube-transcript";
import { getSubtitles } from "youtube-caption-extractor";
import { lessonsCatalog } from "../src/data/lessonsCatalog.js";

/**
 * Extract 11-character YouTube video ID from various URL formats
 */
export function extractVideoId(urlOrId) {
  if (!urlOrId || typeof urlOrId !== "string") return null;
  const str = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  const match = str.match(/(?:v=|\/vi\/|\/embed\/|\/watch\?v=|youtu\.be\/|\/shorts\/)([\w-]{11})/);
  return match ? match[1] : null;
}

/**
 * Fetch video metadata via YouTube oEmbed API
 */
export async function fetchVideoMetadata(videoId) {
  let title = "Bài học từ YouTube";
  let author = "YouTube Creator";
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.title) title = data.title;
      if (data.author_name) author = data.author_name;
      if (data.thumbnail_url) thumbnail = data.thumbnail_url;
    }
  } catch (e) {
    console.warn("[YouTube] oEmbed metadata warning:", e.message);
  }

  return { title, author, thumbnail };
}

/**
 * Translate text from English to Vietnamese using free Google Translate API
 */
export async function translateToVietnamese(text) {
  if (!text || !text.trim()) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text.trim())}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        return data[0].map((chunk) => chunk[0]).join("");
      }
    }
  } catch (e) {
    console.warn("[YouTube] Translation warning for text:", text.slice(0, 30), e.message);
  }
  return "";
}

/**
 * Group raw YouTube caption fragments into natural, grammatical sentences
 */
export function groupCaptionFragments(rawFragments) {
  const sentences = [];
  let currentText = "";
  let currentStart = 0;
  let currentDuration = 0;

  for (let i = 0; i < rawFragments.length; i++) {
    const item = rawFragments[i];
    let cleanText = (item.text || "")
      .replace(/\[.*?\]/g, "") // remove [Music], [Applause]
      .replace(/♪.*?♪/g, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n+/g, " ")
      .trim();

    if (!cleanText) continue;

    if (!currentText) {
      currentStart = Math.round(item.offset);
      currentDuration = Math.round(item.duration);
      currentText = cleanText;
    } else {
      currentText += " " + cleanText;
      currentDuration = Math.round((item.offset + item.duration) - currentStart);
    }

    const words = currentText.split(/\s+/);
    const hasSentenceEnd = /[.?!]$/.test(currentText);
    const isNaturalSentenceLength = words.length >= 8;

    // Conclude sentence if punctuated or long enough or at the end
    if (hasSentenceEnd || isNaturalSentenceLength || i === rawFragments.length - 1) {
      // Capitalize first letter
      const formatted = currentText.charAt(0).toUpperCase() + currentText.slice(1);
      sentences.push({
        _id: `s-${sentences.length + 1}-${Math.random().toString(36).substring(2, 7)}`,
        text: formatted,
        start_ms: Math.max(0, currentStart),
        end_ms: Math.max(currentStart + 1200, currentStart + currentDuration),
        translations: { vi: "" }
      });
      currentText = "";
    }
  }

  return sentences;
}

/**
 * Main function to extract and build a complete Sorata lesson from YouTube
 */
export async function createLessonFromYouTube(urlOrId, customTranscriptText = null) {
  const videoId = extractVideoId(urlOrId);
  if (!videoId) {
    throw new Error("Không thể nhận diện YouTube Video ID hợp lệ từ đường dẫn.");
  }

  // 1. Fetch metadata
  const meta = await fetchVideoMetadata(videoId);

  let sentences = [];

  // 2. First check if this video is already in our curated catalog of 414+ lessons
  const catalogMatch = lessonsCatalog.find((l) => l.videoId === videoId);
  if (catalogMatch && catalogMatch.sentence_ids && catalogMatch.sentence_ids.length > 0) {
    sentences = catalogMatch.sentence_ids;
    if (!meta.title || meta.title === "Bài học từ YouTube") {
      meta.title = catalogMatch.title;
    }
  }

  // 3. Fetch subtitles if no manual transcript provided and not found in catalog
  if (sentences.length === 0 && (!customTranscriptText || !customTranscriptText.trim())) {
    let rawFragments = [];

    // Attempt 1: youtube-caption-extractor
    try {
      const subs = await getSubtitles({ videoID: videoId, lang: "en" });
      if (subs && subs.length > 0) {
        rawFragments = subs.map((s) => ({
          text: s.text,
          offset: Math.round(parseFloat(s.start || 0) * 1000),
          duration: Math.round(parseFloat(s.dur || 3) * 1000)
        }));
      }
    } catch (e1) {
      console.warn("[YouTube] youtube-caption-extractor warning:", e1.message);
    }

    // Attempt 2: YoutubeTranscript English
    if (!rawFragments || rawFragments.length === 0) {
      try {
        rawFragments = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" }).catch(() => null);
      } catch (e2) {}
    }

    // Attempt 3: YoutubeTranscript default
    if (!rawFragments || rawFragments.length === 0) {
      try {
        rawFragments = await YoutubeTranscript.fetchTranscript(videoId).catch(() => null);
      } catch (e3) {}
    }

    if (rawFragments && rawFragments.length > 0) {
      sentences = groupCaptionFragments(rawFragments);
    }
  }

  // 3. Fallback: Parse custom transcript text if provided or if automated fetch returned nothing
  if (sentences.length === 0 && customTranscriptText && customTranscriptText.trim()) {
    const rawLines = customTranscriptText
      .split(/(?<=[.?!])\s+|\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 3);

    let runningOffset = 0;
    sentences = rawLines.map((line, idx) => {
      const durationMs = Math.max(3000, Math.min(10000, line.split(/\s+/).length * 450));
      const s = {
        _id: `s-${idx + 1}-${Math.random().toString(36).substring(2, 7)}`,
        text: line.charAt(0).toUpperCase() + line.slice(1),
        start_ms: runningOffset,
        end_ms: runningOffset + durationMs,
        translations: { vi: "" }
      };
      runningOffset += durationMs + 500;
      return s;
    });
  }

  // If still no sentences found, throw informative error for frontend to handle
  if (sentences.length === 0) {
    return {
      success: false,
      needManualTranscript: true,
      metadata: meta,
      videoId,
      message: "Video này không có phụ đề tiếng Anh tự động trên YouTube. Vui lòng dán văn bản / lời thoại để AI tự động chia câu và đồng bộ mốc thời gian!"
    };
  }

  // 4. Translate sentences to Vietnamese in batches (up to first 30 sentences for high speed)
  const translateBatchSize = Math.min(sentences.length, 30);
  await Promise.all(
    sentences.slice(0, translateBatchSize).map(async (s) => {
      const vi = await translateToVietnamese(s.text);
      if (vi) s.translations.vi = vi;
    })
  );

  // 5. Calculate total video duration formatted as mm:ss
  const maxEndMs = sentences.reduce((max, s) => Math.max(max, s.end_ms), 0);
  const totalSeconds = Math.round(maxEndMs / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const durationStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const lesson = {
    _id: "yt-" + Date.now(),
    slug: "yt-" + videoId + "-" + Date.now().toString(36),
    title: meta.title,
    author: meta.author,
    thumbnail: meta.thumbnail,
    duration: durationStr,
    difficulty: sentences.length > 20 ? "B2 - Intermediate" : "B1 - Pre-Intermediate",
    videoId: videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    topic_id: {
      _id: "custom-yt-topic",
      name: `YouTube: ${meta.author || "Tự chọn"}`,
      slug: "youtube-custom"
    },
    total_view_count: 1,
    sentence_ids: sentences,
    isCustom: true,
    created_at: new Date().toISOString()
  };

  return {
    success: true,
    lesson
  };
}
