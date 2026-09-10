import { YoutubeTranscript } from 'youtube-transcript';

async function extractYouTubeLesson(urlOrId) {
  let videoId = urlOrId.trim();
  const match = videoId.match(/(?:v=|\/vi\/|\/embed\/|\/watch\?v=|youtu\.be\/|\/shorts\/)([\w-]{11})/);
  if (match) videoId = match[1];

  console.log('Extracting videoId:', videoId);

  // 1. Fetch oEmbed metadata
  let title = "YouTube Video Lesson";
  let author = "YouTube Creator";
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  try {
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (oembedRes.ok) {
      const data = await oembedRes.json();
      title = data.title || title;
      author = data.author_name || author;
      thumbnail = data.thumbnail_url || thumbnail;
    }
  } catch (e) {
    console.warn('oEmbed fetch error:', e.message);
  }

  // 2. Fetch transcript
  let rawTranscripts = [];
  try {
    rawTranscripts = await YoutubeTranscript.fetchTranscript(videoId);
  } catch (e) {
    console.warn('Transcript fetch error:', e.message);
  }

  console.log(`Fetched ${rawTranscripts.length} raw caption fragments.`);

  // 3. Process fragments into clean sentences
  const sentences = [];
  let currentText = "";
  let currentStart = 0;
  let currentDuration = 0;

  for (let i = 0; i < rawTranscripts.length; i++) {
    const item = rawTranscripts[i];
    let cleanText = item.text
      .replace(/\[.*?\]/g, "") // remove [Music], [Applause]
      .replace(/♪.*?♪/g, "")
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

    // Check sentence ending or word count > 8
    const words = currentText.split(/\s+/);
    const hasPunctuation = /[.?!]$/.test(currentText);
    const isLongEnough = words.length >= 7;

    if (hasPunctuation || isLongEnough || i === rawTranscripts.length - 1) {
      // Capitalize first letter
      const formatted = currentText.charAt(0).toUpperCase() + currentText.slice(1);
      sentences.push({
        _id: `s-${sentences.length + 1}-${Date.now().toString(36)}`,
        text: formatted,
        start_ms: currentStart,
        end_ms: currentStart + currentDuration,
        translations: { vi: "" }
      });
      currentText = "";
    }
  }

  console.log(`Grouped into ${sentences.length} clean sentences.`);

  // 4. Translate first 5 sentences to Vietnamese as demonstration
  for (let i = 0; i < Math.min(sentences.length, 5); i++) {
    try {
      const transUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + encodeURIComponent(sentences[i].text);
      const res = await fetch(transUrl);
      const data = await res.json();
      sentences[i].translations.vi = data[0].map(s => s[0]).join('');
    } catch (e) {}
  }

  // Calculate duration string
  const totalSeconds = sentences.length > 0 ? Math.round(sentences[sentences.length - 1].end_ms / 1000) : 180;
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const durationStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const lesson = {
    _id: "yt-" + Date.now(),
    slug: "yt-" + videoId + "-" + Date.now().toString(36),
    title: title,
    author: author,
    thumbnail: thumbnail,
    duration: durationStr,
    difficulty: "B2 - Intermediate",
    videoId: videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    topic_id: { name: `YouTube: ${author}` },
    sentence_ids: sentences,
    isCustom: true
  };

  console.log('Resulting Lesson:');
  console.log({
    title: lesson.title,
    author: lesson.author,
    duration: lesson.duration,
    sentenceCount: lesson.sentence_ids.length,
    sampleSentences: lesson.sentence_ids.slice(0, 3)
  });

  return lesson;
}

extractYouTubeLesson("https://www.youtube.com/watch?v=nfu3opYpD7E");
