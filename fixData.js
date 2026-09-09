const fs = require('fs');

const dataPath = './src/data/categoriesData.js';
let content = fs.readFileSync(dataPath, 'utf8');

// Use regex to extract the array, it's safer
const match = content.match(/export const categoriesData = (\[[\s\S]*\]);/);
if (!match) {
  console.log("Could not find categoriesData array");
  process.exit(1);
}

let categoriesData;
try {
  // we will just eval it since it's a module export
  categoriesData = eval(match[1]);
} catch (e) {
  console.log("Eval failed", e);
  process.exit(1);
}

// Mr Beast and Vlog Videos to append
const newVideos = [
  {
    _id: "yt-mrbeast-1",
    title: "I Built a Secret Room in My House!",
    originalTitle: "I Built a Secret Room in My House!",
    duration: "14:20",
    slug: "mr-beast-secret-room",
    difficulty: "B1",
    thumbnail: "https://img.youtube.com/vi/W_zE3P9tZ-k/maxresdefault.jpg",
    videoId: "W_zE3P9tZ-k",
    type: "youtube",
    is_pro: false,
    total_view_count: 54000000
  },
  {
    _id: "yt-mrbeast-2",
    title: "100 Days Building A Modern Underground Hut With A Grass Roof And A Swimming Pool",
    originalTitle: "100 Days Building A Modern Underground Hut",
    duration: "16:40",
    slug: "underground-hut",
    difficulty: "B2",
    thumbnail: "https://img.youtube.com/vi/xV1-Yp6Wf5g/maxresdefault.jpg",
    videoId: "xV1-Yp6Wf5g",
    type: "youtube",
    is_pro: false,
    total_view_count: 32000000
  },
  {
    _id: "yt-vlog-1",
    title: "A Day in the Life of a Software Engineer in New York City",
    originalTitle: "A Day in the Life of a Software Engineer",
    duration: "11:15",
    slug: "day-in-the-life-nyc",
    difficulty: "B2",
    thumbnail: "https://img.youtube.com/vi/p4qMESKO_0E/maxresdefault.jpg",
    videoId: "p4qMESKO_0E",
    type: "youtube",
    is_pro: false,
    total_view_count: 2400000
  },
  {
    _id: "yt-vlog-2",
    title: "How I learned English in 6 months",
    originalTitle: "How I learned English in 6 months",
    duration: "08:45",
    slug: "learned-english-6-months",
    difficulty: "B1",
    thumbnail: "https://img.youtube.com/vi/1_B2g_N_WLE/maxresdefault.jpg",
    videoId: "1_B2g_N_WLE",
    type: "youtube",
    is_pro: false,
    total_view_count: 1500000
  },
  {
    _id: "yt-ted-1",
    title: "Inside the mind of a master procrastinator | Tim Urban",
    originalTitle: "Inside the mind of a master procrastinator",
    duration: "14:03",
    slug: "tim-urban-procrastinator",
    difficulty: "C1",
    thumbnail: "https://img.youtube.com/vi/arj7oStGLkU/maxresdefault.jpg",
    videoId: "arj7oStGLkU",
    type: "youtube",
    is_pro: false,
    total_view_count: 67000000
  }
];

// Let's fix broken thumbnails by replacing assets.parroto.app with youtube images
// if we don't have videoId, we assign one at random or try to extract it from url
const fixVideo = (vid) => {
  if (!vid.videoId) {
    if (vid.url) {
      const m = vid.url.match(/(?:v=|\/vi\/|\/embed\/|\/watch\?v=|youtu\.be\/)([\w-]{11})/);
      if (m) vid.videoId = m[1];
    }
  }
  
  if (!vid.videoId) {
     // fallback random interesting youtube videos instead of the same bees video
     const fallbacks = ["jNQXAC9IVRw", "FkEE4P8yGTo", "bCglaY6eE5I", "8OQyGq-TzK4", "D5Y11hwjMNs"];
     vid.videoId = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // Always use high quality youtube thumbnail
  vid.thumbnail = `https://img.youtube.com/vi/${vid.videoId}/maxresdefault.jpg`;
  return vid;
};

// Apply to all
categoriesData.forEach(cat => {
  if (cat.lessons) {
    cat.lessons = cat.lessons.map(fixVideo);
  }
});

// Append our new category for MrBeast and Vlogs
categoriesData.unshift({
  _id: "cat-trending-vlogs",
  name: "Trending Vlogs & MrBeast",
  slug: "trending-vlogs",
  tag: "entertainment",
  total_lessons: newVideos.length,
  page_title: "Trending Vlogs & MrBeast",
  page_description: "Learn English with trending YouTubers",
  lessons: newVideos
});

// Rewrite the file
const newContent = `export const categoriesData = ${JSON.stringify(categoriesData, null, 2)};\n`;
fs.writeFileSync(dataPath, newContent);
console.log("Successfully updated categoriesData.js");
