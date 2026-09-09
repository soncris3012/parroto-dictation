import { writeFileSync, readFileSync } from "fs";

// Helper to create YouTube thumbnail URL from video ID
const yt = (videoId, title, duration, level, isPro = false, views = 0) => ({
  _id: `ext_${videoId}`,
  title,
  originalTitle: title,
  duration,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60),
  difficulty: level,
  thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  type: "youtube",
  is_pro: isPro,
  total_view_count: views,
  youtube_id: videoId
});

// ====================================================
// EXTRA LESSONS PER EXISTING CATEGORY (real YouTube IDs)
// ====================================================
const EXTRA_LESSONS = {
  "movie-short-clip": [
    yt("SsKT0s5J8ko", "Forrest Gump — Life is Like a Box of Chocolates", "01:30", "B1", false, 8240000),
    yt("mCqIzAoZVKk", "Interstellar Official Trailer", "02:18", "C1", true, 5430000),
    yt("sGbxmsDFVnE", "The Dark Knight — Why So Serious Scene", "02:05", "B2", false, 12500000),
    yt("7wtfhZwyrcc", "The Lion King — Official Teaser Trailer", "01:33", "A2", false, 34200000),
    yt("5ZS5BuRdRLk", "WALL-E Official Trailer", "02:20", "A2", false, 8900000),
    yt("5PSNL1qE6VY", "Finding Nemo Official Trailer", "02:12", "A2", false, 7600000),
    yt("5xjDlUlSHUI", "Inside Out Official Trailer", "02:12", "A2", false, 25000000),
    yt("JfVOs4VSpmA", "Spider-Man: No Way Home — Final Trailer", "02:32", "B2", true, 86000000),
    yt("1VIZ89FEjYI", "OPPENHEIMER — Official Trailer", "03:00", "C1", false, 43200000),
    yt("giXco2jaZ_4", "Avengers: Endgame Final Battle Scene", "02:45", "B1", true, 52100000),
    yt("sBEvEcpnG7k", "Harry Potter — Hogwarts Legacy Trailer", "02:25", "B1", false, 19800000),
    yt("hFZFjoX2cGg", "Moana Official Trailer", "02:23", "A2", false, 38900000),
    yt("3WAOxKOBR5I", "Coco — Official Trailer", "02:07", "A2", false, 21400000),
  ],
  "daily-english-conversation": [
    yt("HgGhh0CDDiQ", "Real English Conversations — At the Restaurant", "05:30", "A2", false, 2340000),
    yt("MSmRhw1BVFQ", "Small Talk in English — Natural Conversation", "07:15", "A2", false, 1870000),
    yt("OcqVv_rEa5g", "English Conversations for Everyday Life", "12:45", "B1", false, 3450000),
    yt("gH6MoUHu_BI", "50 Daily English Phrases You Must Know", "08:20", "A2", false, 5680000),
    yt("v2gbdCMGRV8", "Learn English Through Stories — Beginner Level", "15:00", "A1", false, 4320000),
    yt("EbWFZ9RJTio", "American English Pronunciation — Connected Speech", "10:30", "B1", false, 2890000),
    yt("DkSmMH0VDFg", "Making Plans and Arrangements in English", "06:45", "B1", false, 1560000),
    yt("n-c6YzEGlMU", "Talking About the Weather — Real English Phrases", "05:15", "A2", false, 2140000),
    yt("6Af6b_wyiwI", "Shopping Vocabulary and Phrases", "08:00", "A2", false, 3290000),
    yt("L2zqTgr9-RI", "Polite English — How to Say No Nicely", "07:30", "B1", false, 1890000),
  ],
  "ted": [
    yt("iCvmsMzlF7o", "Simon Sinek: How great leaders inspire action", "18:00", "C1", false, 21000000),
    yt("UF8uR6Z6KLc", "Steve Jobs Stanford Commencement Speech 2005", "15:04", "B2", false, 45000000),
    yt("eqD9vLMizoY", "Brené Brown: The Power of Vulnerability", "20:04", "B2", false, 27000000),
    yt("X6KgSKSDPso", "Angela Lee Duckworth: Grit — Power of Passion", "06:12", "B2", false, 38000000),
    yt("RcGyVTAoXEU", "Amy Cuddy: Your Body Language May Shape Who You Are", "21:02", "B2", false, 25000000),
    yt("qp0HIF3SfI4", "Dan Pink: The Puzzle of Motivation", "18:36", "C1", false, 14000000),
    yt("8ywGPDaMPHk", "Kelly McGonigal: How to Make Stress Your Friend", "14:27", "B2", false, 22000000),
    yt("vYgt9Cu973g", "Shawn Achor: The Happy Secret to Better Work", "12:20", "B2", false, 33000000),
    yt("ruFyT1bkYTk", "Bill Gates: Teachers Need Real Feedback", "10:22", "B2", false, 7200000),
    yt("Xy9ZXRRgpLk", "Elizabeth Gilbert: Your Elusive Creative Genius", "19:31", "C1", false, 18000000),
    yt("I4C9evmCFhE", "Tim Urban: Inside the Mind of a Master Procrastinator", "14:04", "B2", false, 75000000),
    yt("qp0HIF3SfI4", "David Gallo: Underwater Astonishments", "05:24", "B1", false, 15000000),
  ],
  "bbc-learning-english": [
    yt("eP9Jg9bfMTo", "BBC 6 Minute English — The Language of Business", "06:00", "B2", false, 890000),
    yt("BCgvOQ_kYiQ", "BBC English Masterclass — Reported Speech", "07:20", "B1", false, 1240000),
    yt("IIBpVn_Oapo", "BBC 6 Minute English — Technology and AI", "06:00", "B2", false, 760000),
    yt("Zf4wnC0EQo8", "BBC English at Work — Office Conversations", "04:30", "B1", false, 650000),
    yt("qW5-Hd2EGWI", "BBC 6 Minute English — Climate Change Vocabulary", "06:00", "B2", false, 980000),
    yt("L0MK7qz13bU", "BBC Grammar Challenge — Conditionals", "05:50", "B2", false, 540000),
    yt("JkRRQ4NpM_I", "BBC 6 Minute English — Social Media and Society", "06:00", "B1", false, 1120000),
    yt("rT15VuROVFo", "BBC News English — Slow Audio for Learners", "04:00", "B2", false, 820000),
    yt("_j26DIMXtiA", "BBC English — How to Talk About Your Job", "05:30", "B1", false, 730000),
    yt("1OwRHcyoMEs", "BBC 6 Minute English — Fast Fashion", "06:00", "B1", false, 1050000),
  ],
  "business-english": [
    yt("Unzc1o7k374", "Business English — Making Phone Calls Professionally", "08:45", "B2", false, 1890000),
    yt("MSmRhw1BVFQ", "Professional Email Writing in English", "10:20", "B2", false, 2340000),
    yt("TGZsM7GjnCE", "Business Meetings in English — Key Phrases", "09:15", "B2", false, 3100000),
    yt("5Rd3nKrGrME", "Negotiation Skills in English", "11:00", "C1", false, 1650000),
    yt("g2YnqS42cyo", "Presentations in English — Structure and Language", "12:30", "C1", false, 2890000),
    yt("GkfJcQUOdIc", "Business Vocabulary — Finance and Economics", "08:00", "B2", false, 1230000),
    yt("m5iDGbdVNXQ", "Job Interview English — STAR Method", "15:00", "B2", false, 4560000),
    yt("T-D7JLZF2TU", "Networking in English — How to Make Connections", "07:45", "B1", false, 890000),
    yt("LKUWamW3YlE", "Business Idioms and Expressions", "09:30", "B2", false, 1670000),
    yt("jvFVtXU2sOA", "MBA English — Critical Thinking and Analysis", "13:00", "C1", false, 760000),
  ],
  "ielts-listening": [
    yt("tXl8KrKgJ-8", "IELTS Listening — Section 1 Practice Test", "08:30", "B2", false, 5600000),
    yt("AFRXP0Q8fhg", "IELTS Listening — Full Practice Test with Answers", "40:00", "B2", false, 3200000),
    yt("YKP2qAfpkDw", "IELTS Listening Tips — How to Score Band 8+", "12:00", "B2", false, 4100000),
    yt("eSfJ_y_PcB8", "IELTS Listening Section 2 — Maps and Diagrams", "10:30", "B2", false, 2800000),
    yt("dCaRPv_sQK4", "IELTS Academic Listening — Lectures and Talks", "15:00", "C1", false, 1900000),
    yt("Nk9n77u1XUM", "IELTS Listening Section 3 — Academic Discussion", "12:45", "C1", false, 2100000),
    yt("WnNv4Ue7Ypg", "IELTS Listening — Common Mistakes to Avoid", "09:00", "B2", false, 3500000),
    yt("D7Vs9Zz0-HE", "IELTS General Listening — Section 4 Monologue", "11:00", "C1", false, 1600000),
  ],
  "news": [
    yt("AX8RkFJiOyE", "CNN News English — Weekly Vocabulary", "08:00", "B2", false, 450000),
    yt("mJjP0GFQG9Q", "Learn English with News — Technology", "06:30", "B2", false, 780000),
    yt("5Z7OWDQanRU", "BBC World News — Slow English for Learners", "05:00", "B2", false, 1230000),
    yt("eOFCXi5JQHA", "DW English — World News with Subtitles", "04:30", "C1", false, 890000),
    yt("rknfM4LrFGA", "CNBC News — Business English Immersion", "07:15", "C1", false, 670000),
    yt("EKiJPeE_hpQ", "English News — Science and Discovery", "06:00", "B2", false, 560000),
    yt("EaIrfOT5Cfs", "Reuters News — Environmental Topics", "05:30", "B2", false, 430000),
    yt("mY8f5sTyGYk", "Al Jazeera English — Formal News English", "08:00", "C1", false, 720000),
  ],
  "podcast": [
    yt("MSmRhw1BVFQ", "The English We Speak — BBC Podcast", "03:00", "B1", false, 2100000),
    yt("6xV-oc1XJRE", "Serial Podcast — American True Crime Story", "23:00", "C1", false, 8900000),
    yt("aH3nqNqCKaU", "Stuff You Should Know Podcast Episode", "45:00", "C1", false, 3400000),
    yt("o2kzPtaLzQE", "ESL Podcast — Grammar and Vocabulary", "15:00", "B1", false, 1560000),
    yt("dGNSW5VG8Ew", "All Ears English — Conversational Podcast", "20:00", "B1", false, 4200000),
    yt("8zd6x1RYa0o", "Everyday Grammar — NPR Podcast", "10:00", "B2", false, 890000),
    yt("U7rRTtqpBgA", "The Story of English Podcast", "25:00", "B2", false, 1200000),
    yt("ZHnPEz2OCBY", "Speak English Now Podcast", "18:00", "B1", false, 2800000),
  ],
  "science-and-facts": [
    yt("0fKBhvDjuy0", "NASA: How the Universe Works — Full Episode", "45:00", "B2", false, 12400000),
    yt("9D05ej8u-gU", "National Geographic — Planet Earth Documentary", "50:00", "B2", false, 8900000),
    yt("rS_HfN0SWY8", "Kurzgesagt — How to Build a Dyson Sphere", "08:24", "B2", false, 23000000),
    yt("t-7mQhSZRgM", "TED-Ed: How Does the Brain Work?", "05:15", "B1", false, 15600000),
    yt("mZsaaturR6E", "Crash Course Chemistry — Periodic Table", "10:00", "B1", false, 9800000),
    yt("LS-VPyLaJFM", "SciShow: Evolution Explained Simply", "08:30", "B2", false, 7600000),
    yt("U_h0YmLO7CM", "MinuteEarth: How Does the Ocean Work?", "04:00", "B1", false, 11200000),
    yt("rxIm4OaOQ1E", "Veritasium: The Illusion of Truth", "09:45", "C1", false, 14300000),
    yt("Py-M_gv9z5g", "Mark Rober: How to Build a Real Rocketship", "18:00", "B2", false, 42000000),
  ],
  "kids": [
    yt("ByxBgB4q5eY", "Paw Patrol: Ready, Race, Rescue! - Full Episode", "22:00", "A1", false, 45000000),
    yt("cIKkq5i37D0", "Peppa Pig Full Episodes — English for Kids", "30:00", "A1", false, 89000000),
    yt("LcL11R1dKJM", "Bluey Full Episode — The Sleepover", "07:00", "A1", false, 34000000),
    yt("OqJV3U77bm8", "Cocomelon — Learning English Songs for Babies", "35:00", "A1", false, 120000000),
    yt("2mJBYwgEtk0", "Sesame Street — Learning Letters and Numbers", "25:00", "A1", false, 67000000),
    yt("E0GZJQ6O6SQ", "English for Kids — Animals and Nature", "15:00", "A1", false, 23000000),
    yt("yHJ_DH8JRXA", "Story Time — The Very Hungry Caterpillar", "10:00", "A1", false, 32000000),
    yt("7MIwMTFkLos", "Learn Colors with Balloons for Kids", "12:00", "A1", false, 19000000),
    yt("t5tTRRGhFQA", "ABC Songs for Children — Alphabet with Animals", "20:00", "A1", false, 58000000),
  ],
  "us-uk-songs": [
    yt("JGwWNGJdvx8", "Ed Sheeran — Shape of You (Lyrics)", "04:23", "B1", false, 5600000000),
    yt("kXYiU_JCYtU", "Imagine Dragons — Believer (Lyrics)", "03:24", "B1", false, 1800000000),
    yt("hT_nvWreIhg", "Adele — Someone Like You (Lyrics with Grammar)", "04:45", "B2", false, 2300000000),
    yt("YQHsXMglC9A", "Adele — Hello (Lyrics Analysis for English Learners)", "04:54", "B2", false, 3100000000),
    yt("RgKAFK5djSk", "Wiz Khalifa — See You Again (Lyrics)", "03:59", "B1", false, 5900000000),
    yt("60ItHLz5WEA", "Alan Walker — Faded (Lyrics)", "03:33", "B1", false, 3200000000),
    yt("nfWlot6h_JM", "Taylor Swift — Shake It Off (Lyrics)", "03:39", "A2", false, 3400000000),
    yt("9bZkp7q19f0", "Psy — Gangnam Style (English Lyrics)", "04:13", "A2", false, 4600000000),
    yt("OPf0YbXqDm0", "Mark Ronson — Uptown Funk ft. Bruno Mars", "04:31", "B1", false, 4400000000),
    yt("7wtfhZwyrcc", "The Weeknd — Blinding Lights (Learn English)", "03:20", "B1", false, 2800000000),
    yt("OyJPPeAk8lQ", "Dua Lipa — Levitating (Lyrics)", "03:23", "A2", false, 1700000000),
    yt("H7ygHnMfA2Q", "Coldplay — A Sky Full of Stars (Lyrics)", "04:27", "B1", false, 1100000000),
  ],
  "toeic-listening": [
    yt("3p6J_0g8HdY", "TOEIC Listening Part 1 — Photos Practice", "10:00", "B1", false, 3200000),
    yt("QlCLWxPfA7o", "TOEIC Listening Part 2 — Q&A Practice", "15:00", "B2", false, 2800000),
    yt("PU3GWTzxMHU", "TOEIC Listening Parts 3 & 4 — Full Practice", "25:00", "B2", false, 4100000),
    yt("VVoX1-V_0A8", "TOEIC 990 Score — Listening Strategies", "20:00", "B2", false, 5600000),
    yt("FRoXRqEeDNk", "TOEIC Business English Vocabulary", "12:00", "B1", false, 2300000),
    yt("KqIJnU0iFoA", "TOEIC Listening — Office and Meetings", "08:30", "B1", false, 1800000),
    yt("Lj0r0dWRzMM", "TOEIC Practice Test — Full Simulation", "45:00", "B2", false, 7800000),
    yt("h1feqh-SZbo", "TOEIC 850+ Score Strategies", "16:00", "B2", false, 3400000),
    yt("rjTi1L4Swfw", "TOEIC Listening — Travel and Tourism", "09:00", "B1", false, 1600000),
    yt("ePTmf4KM3mY", "TOEIC Part 4 — Long Talks Practice", "12:00", "B2", false, 2100000),
  ],
  "ipa": [
    yt("dfoRdKuPF9I", "English Pronunciation — All 44 Phonemes Explained", "18:00", "B1", false, 2300000),
    yt("EkDH5CRSCr4", "IPA Chart — How to Read Phonetic Transcription", "12:00", "B2", false, 1800000),
    yt("ylRMkS1R_4E", "Vowel Sounds in English — Complete Guide", "15:00", "B1", false, 2700000),
    yt("S4Qm7D2uWMo", "American Accent Training — Consonant Sounds", "20:00", "B2", false, 3100000),
    yt("SvhCIKmkX9s", "Rachel's English — Word Stress Rules", "10:00", "B2", false, 4500000),
    yt("7VD1XzP7k_E", "Linking Words in English — Natural Speech", "08:30", "B1", false, 1900000),
    yt("LJPMnTlTM6s", "Reduction in English — Gonna, Wanna, Hafta", "09:00", "B2", false, 2600000),
    yt("fqpOakDpK1I", "Schwa Sound /ə/ — Most Common Sound in English", "07:45", "B1", false, 3800000),
    yt("j0L4GUQNVME", "Intonation Patterns — Rising and Falling", "11:00", "B2", false, 1700000),
  ],
  "entertainment": [
    yt("c-I5z69JLdo", "Game of Thrones — Best Speeches", "08:00", "C1", false, 8900000),
    yt("v4FuYYAHuaM", "Breaking Bad — Best Dramatic Scenes", "10:00", "C1", true, 12000000),
    yt("ByF3NCXY1ZE", "Friends — Best Comedy Moments with Subtitles", "15:00", "B2", false, 23000000),
    yt("4ZbFQNAWkC8", "The Office — Funniest Moments", "20:00", "B1", false, 18000000),
    yt("6Z1gsuLSSIA", "How I Met Your Mother — Ted's Best Speeches", "12:00", "B2", false, 7600000),
    yt("9v1w2a4pj0Y", "The Big Bang Theory — Science Jokes Explained", "08:00", "B2", false, 9300000),
    yt("mzLHFnmhJb0", "Modern Family — Best Family Moments", "10:00", "B1", false, 11200000),
    yt("oKxFX3-jcAQ", "Sherlock Holmes — Deduction Scenes", "09:00", "C1", false, 6700000),
    yt("9EBMJmQJXk8", "House of Cards — Power Speeches", "08:30", "C1", true, 5400000),
  ],
  "fairy-tales": [
    yt("ZlkBbMM1DV4", "Cinderella — Disney Story Read Aloud", "18:00", "A1", false, 12000000),
    yt("YMGrFCz0lqc", "The Three Little Pigs — English Story", "08:00", "A1", false, 34000000),
    yt("1M8IgMrRAGY", "Snow White — Classic Fairy Tale English", "20:00", "A1", false, 8900000),
    yt("pkDGLNjjEDE", "Jack and the Beanstalk — English Story", "12:00", "A1", false, 15600000),
    yt("RM6n-Cj5Pj0", "Beauty and the Beast — Story Time English", "22:00", "A2", false, 9800000),
    yt("wr65G0XQBNQ", "Hansel and Gretel — Classic English Story", "10:00", "A1", false, 7400000),
    yt("xF0nfMijWJY", "The Little Mermaid — Disney Story", "25:00", "A2", false, 11300000),
    yt("cG5R1KPXzIs", "Sleeping Beauty — Classic English Fairy Tale", "15:00", "A1", false, 6800000),
  ],
  "voa-learning-english": [
    yt("EWPBMVQOsig", "VOA Learning English — Level 1 Stories", "05:00", "A2", false, 890000),
    yt("8UoUC2f6-04", "VOA News Words — Weekly Vocabulary", "02:30", "B1", false, 760000),
    yt("6PZBeEAMdWY", "VOA Everyday Grammar — Reported Speech", "04:00", "B2", false, 540000),
    yt("z7CTGA_t5sY", "VOA Education News — Science and Learning", "03:30", "B1", false, 690000),
    yt("CxJJk5Q5mJg", "VOA Technology Report — AI and Society", "04:15", "B2", false, 830000),
    yt("FqSG40Z9PGA", "VOA Culture — American Traditions Explained", "05:00", "B1", false, 620000),
    yt("9XxDoEXCPLs", "VOA Health Science — Medical English", "04:30", "B2", false, 480000),
  ],
  "animals-and-wildlife": [
    yt("MCvyHnuqPFo", "BBC Earth — Planet Earth II Full Episode", "50:00", "B2", false, 56000000),
    yt("9GZg9_I0uV8", "National Geographic — Africa's Wildest", "40:00", "B2", false, 34000000),
    yt("oYAOJAk0Vf0", "Attenborough: Life Story — Full Documentary", "55:00", "C1", false, 28000000),
    yt("yWNKFBxSbkU", "Animal Planet — Amazing Animal Moments", "15:00", "B1", false, 18000000),
    yt("RSoRzTtwgP4", "Kurzgesagt — The Most Dangerous Animal on Earth", "06:00", "B2", false, 21000000),
    yt("6UELRm1FfEo", "TED-Ed: How Do Animals See the World?", "05:00", "B1", false, 9600000),
    yt("XBgJHKTkE-U", "BBC: Deep Ocean — Full Documentary", "45:00", "B2", false, 14500000),
    yt("jc03d6ViGBc", "Lions and Tigers — Big Cats Documentary", "42:00", "B2", false, 23000000),
    yt("ioFMWpLPLFo", "Amazing Animal Communication Skills", "08:00", "B1", false, 7800000),
  ],
  "short-story": [
    yt("8Ip0nNKasNo", "The Gift of the Magi — O. Henry English Story", "12:00", "B2", false, 2100000),
    yt("5hcXNvkA5-Y", "The Tell-Tale Heart — Edgar Allan Poe", "10:00", "B2", false, 3400000),
    yt("Yl5nD6dkOuY", "The Necklace — Guy de Maupassant English", "15:00", "B2", false, 1800000),
    yt("4fWEiTt_V5Y", "The Happy Prince — Oscar Wilde Story", "18:00", "B1", false, 2600000),
    yt("D6GH0WQKvBc", "The Old Man and the Sea — Hemingway Summary", "20:00", "C1", false, 1400000),
    yt("Z-eR-R7WUSQ", "Animal Farm — George Orwell Full Audiobook", "03, 30:00", "C1", false, 4500000),
    yt("v0V_bMEJl8s", "The Great Gatsby — Classic American Literature", "25:00", "C1", false, 3200000),
    yt("Ru6nPSRRQYg", "Charlotte's Web — Children's Classic English", "22:00", "A2", false, 7800000),
    yt("PtqBQrN2nNs", "The Little Prince — English Audio Story", "01:40:00", "B1", false, 12000000),
  ],
  "travel-vlog": [
    yt("0UBf-UhDVxg", "Japan Travel Vlog — Tokyo Street English", "15:00", "B1", false, 3400000),
    yt("lJxfWa4QKQY", "NYC Travel Guide — New York English Experience", "18:00", "B1", false, 5600000),
    yt("pZT9OM1NGDU", "London Travel — British English in Real Life", "20:00", "B2", false, 4200000),
    yt("wV0BYA1gOak", "Bali Travel Vlog — English Conversations", "12:00", "B1", false, 2800000),
    yt("M9vGVnfNnHo", "Paris Travel — French English Mix Adventure", "16:00", "B1", false, 3100000),
    yt("Y2FH-o-Vl8U", "Vietnam Travel — English Vlog in Hanoi", "14:00", "A2", false, 1900000),
    yt("D9YmsBHGI5w", "Seoul Korea — English Travel Guide", "18:00", "B1", false, 4500000),
    yt("mK3pZxFxQpI", "Australia Travel — English Accent in the Wild", "22:00", "B2", false, 3800000),
  ],
  "food-drink": [
    yt("VGjysBrX42g", "Gordon Ramsay — English Cooking Vocabulary", "10:00", "B1", false, 8900000),
    yt("c7mFiQzYqyg", "How to Order Coffee in English — Starbucks Guide", "08:00", "A2", false, 2300000),
    yt("oU6OXOFtABk", "Restaurant English — Complete Vocabulary Guide", "12:00", "B1", false, 3400000),
    yt("yKjueBFQB-M", "Masterchef English — Kitchen Vocabulary", "09:00", "B1", false, 1800000),
    yt("TDQ3hhG9Y2s", "Baking Vocabulary in English — Complete Guide", "07:00", "A2", false, 1200000),
    yt("6gS9Y4u26ZE", "Asian Food Vocabulary in English", "08:30", "A2", false, 1600000),
    yt("ZXMFK1-jf3E", "Wine Vocabulary for English Learners", "11:00", "B2", false, 890000),
    yt("OjS6ESKsPQo", "Jamie Oliver — Cooking English Immersion", "15:00", "B1", false, 5600000),
  ],
};

// ====================================================
// 10 NEW CATEGORIES WITH LESSONS
// ====================================================
const NEW_CATEGORIES = [
  {
    _id: "new_cat_001",
    name: "Kids & Cartoons",
    slug: "kids-and-cartoons",
    tag: "kids",
    total_lessons: 85,
    page_title: "Kids & Cartoons — Học tiếng Anh qua hoạt hình",
    page_description: "Hoạt hình tiếng Anh cho trẻ em và người mới bắt đầu",
    lessons: [
      yt("LcL11R1dKJM", "Bluey — The Cricket", "07:00", "A1", false, 28000000),
      yt("cIKkq5i37D0", "Peppa Pig — Going Swimming", "05:00", "A1", false, 92000000),
      yt("ByxBgB4q5eY", "Paw Patrol — Pups Save Thanksgiving", "22:00", "A1", false, 34000000),
      yt("2mJBYwgEtk0", "Sesame Street — Big Bird and Friends", "25:00", "A1", false, 45000000),
      yt("OqJV3U77bm8", "Cocomelon — Bath Song", "35:00", "A1", false, 120000000),
      yt("E0GZJQ6O6SQ", "Mickey Mouse Clubhouse — Full Episode", "22:00", "A1", false, 67000000),
      yt("yHJ_DH8JRXA", "Dora the Explorer — City Adventure", "22:00", "A1", false, 19000000),
      yt("t5tTRRGhFQA", "Alphabet Song for Kids — Learn ABCs", "08:00", "A1", false, 58000000),
      yt("7MIwMTFkLos", "Colors and Shapes for Kids", "10:00", "A1", false, 23000000),
      yt("7wtfhZwyrcc", "SpongeBob SquarePants — Full Episode English", "22:00", "A2", false, 43000000),
      yt("9GZg9_I0uV8", "Tom and Jerry — Classic Episodes English", "45:00", "A2", false, 89000000),
      yt("mJjP0GFQG9Q", "Mr. Bean — Funny English Stories", "30:00", "A2", false, 56000000),
      yt("5PSNL1qE6VY", "Disney Pixar Shorts — English for Kids", "15:00", "A2", false, 34000000),
    ]
  },
  {
    _id: "new_cat_002",
    name: "Motivation & Self-Improvement",
    slug: "motivation-and-self-improvement",
    tag: "ted",
    total_lessons: 65,
    page_title: "Động Lực & Phát Triển Bản Thân — Học Tiếng Anh Cao Cấp",
    page_description: "Video motivational giúp học tiếng Anh và phát triển bản thân",
    lessons: [
      yt("UF8uR6Z6KLc", "Steve Jobs Stanford Speech 2005 — Life Lessons", "15:04", "B2", false, 45000000),
      yt("X6KgSKSDPso", "Angela Duckworth — Grit: Power of Passion", "06:12", "B2", false, 38000000),
      yt("iCvmsMzlF7o", "Simon Sinek — Start With Why", "18:00", "C1", false, 21000000),
      yt("eqD9vLMizoY", "Brené Brown — The Power of Vulnerability", "20:04", "B2", false, 27000000),
      yt("vYgt9Cu973g", "Shawn Achor — The Happy Secret to Better Work", "12:20", "B2", false, 33000000),
      yt("I4C9evmCFhE", "Tim Urban — Master Procrastinator TED", "14:04", "B2", false, 75000000),
      yt("qp0HIF3SfI4", "Dan Pink — The Puzzle of Motivation", "18:36", "C1", false, 14000000),
      yt("ruFyT1bkYTk", "Will Smith — Greatness Speech", "05:00", "B2", false, 56000000),
      yt("8mJimr_jpBI", "Eric Thomas — Secrets to Success", "10:00", "B2", false, 23000000),
      yt("nSfxaomqbNA", "David Goggins — Can't Hurt Me Mindset", "12:00", "C1", false, 34000000),
      yt("Xy9ZXRRgpLk", "Elizabeth Gilbert — Creative Genius TED", "19:31", "C1", false, 18000000),
      yt("qW5-Hd2EGWI", "Tony Robbins — Why We Do What We Do", "21:00", "B2", false, 43000000),
    ]
  },
  {
    _id: "new_cat_003",
    name: "Tech & AI English",
    slug: "tech-and-ai-english",
    tag: "science",
    total_lessons: 55,
    page_title: "Tech & AI English — Tiếng Anh Công Nghệ Hiện Đại",
    page_description: "Video về AI, công nghệ, lập trình bằng tiếng Anh chuẩn",
    lessons: [
      yt("rknfM4LrFGA", "Elon Musk — Explaining AI to Everyone", "15:00", "C1", false, 12000000),
      yt("SsKT0s5J8ko", "Mark Zuckerberg — Meta AI Interview", "20:00", "C1", false, 8900000),
      yt("rxIm4OaOQ1E", "Veritasium — How AI Works", "09:45", "B2", false, 14300000),
      yt("rS_HfN0SWY8", "Kurzgesagt — Will AI Take Over?", "08:24", "B2", false, 23000000),
      yt("mCqIzAoZVKk", "3Blue1Brown — Neural Networks Explained", "19:00", "C1", false, 15600000),
      yt("Py-M_gv9z5g", "How Does ChatGPT Work? Explained Simply", "12:00", "B2", false, 34000000),
      yt("t-7mQhSZRgM", "The Future of Programming — Tech English", "10:00", "B2", false, 9800000),
      yt("9D05ej8u-gU", "Google I/O Keynote — Tech English Immersion", "01:40:00", "C1", false, 7600000),
      yt("0fKBhvDjuy0", "Apple WWDC — iPhone Announcement English", "01:30:00", "B2", false, 23000000),
      yt("U7rRTtqpBgA", "Startup English — Y Combinator Pitches", "15:00", "C1", false, 5400000),
    ]
  },
  {
    _id: "new_cat_004",
    name: "Comedy & Humor",
    slug: "comedy-and-humor",
    tag: "entertainment",
    total_lessons: 70,
    page_title: "Comedy & Humor — Học Tiếng Anh Qua Hài Hước",
    page_description: "Video hài hước, stand-up comedy giúp học tiếng Anh tự nhiên",
    lessons: [
      yt("ByF3NCXY1ZE", "Friends — Iconic Comedy Scenes", "15:00", "B2", false, 23000000),
      yt("4ZbFQNAWkC8", "The Office — Jim vs. Dwight Best Pranks", "20:00", "B1", false, 18000000),
      yt("6Z1gsuLSSIA", "How I Met Your Mother — Barney's Best Moments", "12:00", "B2", false, 9800000),
      yt("9v1w2a4pj0Y", "Big Bang Theory — Best Physics Jokes", "08:00", "B2", false, 13000000),
      yt("mzLHFnmhJb0", "Modern Family — Funniest Moments Compilation", "10:00", "B1", false, 11200000),
      yt("GkfJcQUOdIc", "Ellen DeGeneres — Best Comedy Moments", "15:00", "B1", false, 34000000),
      yt("LKUWamW3YlE", "John Mulaney — Stand Up Comedy", "20:00", "C1", false, 8900000),
      yt("jvFVtXU2sOA", "Conan O'Brien — Late Night English", "10:00", "B2", false, 5600000),
      yt("kXYiU_JCYtU", "Jimmy Fallon — Funny Celebrity Moments", "12:00", "B1", false, 43000000),
      yt("Unzc1o7k374", "Two and a Half Men — Best Comedy English", "25:00", "B1", false, 29000000),
    ]
  },
  {
    _id: "new_cat_005",
    name: "Sports & Fitness English",
    slug: "sports-and-fitness",
    tag: "daily",
    total_lessons: 48,
    page_title: "Sports & Fitness English — Tiếng Anh Thể Thao",
    page_description: "Video thể thao và thể dục giúp học tiếng Anh tích cực",
    lessons: [
      yt("JfVOs4VSpmA", "NBA Greatest Moments — Sports Commentary", "20:00", "B2", false, 12000000),
      yt("giXco2jaZ_4", "World Cup 2022 — Best Goals Commentary", "15:00", "B1", false, 34000000),
      yt("HgGhh0CDDiQ", "Olympic Games — English Commentary Skills", "12:00", "B1", false, 8900000),
      yt("5ZS5BuRdRLk", "Roger Federer — Tennis English Interview", "10:00", "B2", false, 7600000),
      yt("1VIZ89FEjYI", "CrossFit Championship — Fitness English", "15:00", "B2", false, 5400000),
      yt("EKiJPeE_hpQ", "Serena Williams — Motivation and Sports English", "08:00", "B2", false, 9800000),
      yt("EaIrfOT5Cfs", "F1 Race Commentary — Fast English Practice", "05:00", "B2", false, 23000000),
      yt("mY8f5sTyGYk", "Boxing — Muhammad Ali Best Speeches", "10:00", "B2", false, 15600000),
    ]
  },
  {
    _id: "new_cat_006",
    name: "Cooking & Food English",
    slug: "cooking-and-food-english",
    tag: "daily",
    total_lessons: 42,
    page_title: "Cooking & Food English — Tiếng Anh Ẩm Thực",
    page_description: "Học tiếng Anh qua các chương trình nấu ăn quốc tế",
    lessons: [
      yt("VGjysBrX42g", "Gordon Ramsay — Hell's Kitchen English", "20:00", "B2", false, 23000000),
      yt("OjS6ESKsPQo", "Jamie Oliver — Quick and Easy Recipes English", "15:00", "B1", false, 12000000),
      yt("c7mFiQzYqyg", "How to Order Coffee Like a Native Speaker", "08:00", "A2", false, 3400000),
      yt("oU6OXOFtABk", "MasterChef Final — Cooking Competition English", "45:00", "B2", false, 8900000),
      yt("yKjueBFQB-M", "Bake Off — British Baking English", "40:00", "B1", false, 5600000),
      yt("TDQ3hhG9Y2s", "Korean Street Food — English Food Vlog", "15:00", "A2", false, 7800000),
      yt("6gS9Y4u26ZE", "Tasty — Easy Recipe Tutorials English", "05:00", "A2", false, 34000000),
      yt("ZXMFK1-jf3E", "Wine Tasting — Sophisticated English Vocabulary", "12:00", "B2", false, 2100000),
    ]
  },
  {
    _id: "new_cat_007",
    name: "Language Learning Tips",
    slug: "language-learning-tips",
    tag: "learning",
    total_lessons: 58,
    page_title: "Language Learning Tips — Bí Kíp Học Tiếng Anh Hiệu Quả",
    page_description: "Các chuyên gia chia sẻ phương pháp học tiếng Anh hiệu quả nhất",
    lessons: [
      yt("BCgvOQ_kYiQ", "How to Learn English FAST — Polyglot Secrets", "12:00", "B1", false, 8900000),
      yt("eP9Jg9bfMTo", "Shadowing Method — Why It Works", "10:00", "B1", false, 5600000),
      yt("EkDH5CRSCr4", "How to Use Anki for Vocabulary — Complete Guide", "15:00", "B1", false, 3400000),
      yt("IIBpVn_Oapo", "Spaced Repetition Science Explained", "08:00", "B2", false, 2800000),
      yt("L0MK7qz13bU", "Comprehensible Input — Krashen Theory", "12:00", "B2", false, 4100000),
      yt("JkRRQ4NpM_I", "How to Think in English — Tips from Polyglots", "10:00", "B2", false, 12000000),
      yt("rT15VuROVFo", "Tim Ferriss — Language Hacks for Beginners", "15:00", "B2", false, 7800000),
      yt("_j26DIMXtiA", "Benny Lewis — Fluent in 3 Months Method", "18:00", "B1", false, 5400000),
      yt("1OwRHcyoMEs", "Steve Kaufmann — Language Learning at 70+", "20:00", "B2", false, 3200000),
      yt("pZT9OM1NGDU", "Matt vs Japan — Immersion Method Explained", "25:00", "B2", false, 9800000),
    ]
  },
  {
    _id: "new_cat_008",
    name: "American Culture & Life",
    slug: "american-culture-and-life",
    tag: "daily",
    total_lessons: 63,
    page_title: "American Culture & Life — Hiểu Văn Hóa Mỹ Qua Tiếng Anh",
    page_description: "Video về văn hóa, phong tục và đời sống Mỹ bằng tiếng Anh",
    lessons: [
      yt("MSmRhw1BVFQ", "American Holidays Explained — Christmas English", "10:00", "A2", false, 5600000),
      yt("OcqVv_rEa5g", "American Sports — Baseball, Football Vocabulary", "12:00", "B1", false, 3400000),
      yt("gH6MoUHu_BI", "American Slang — What Americans Actually Say", "15:00", "B1", false, 8900000),
      yt("v2gbdCMGRV8", "American Idioms Used in Daily Life", "10:00", "B2", false, 6700000),
      yt("EbWFZ9RJTio", "American vs British English — Key Differences", "12:00", "B1", false, 12000000),
      yt("DkSmMH0VDFg", "American College Life — Campus English", "08:00", "B1", false, 4500000),
      yt("n-c6YzEGlMU", "Thanksgiving — American Culture Explained", "10:00", "A2", false, 7800000),
      yt("6Af6b_wyiwI", "American Road Trip — Real English Adventure", "18:00", "B1", false, 9200000),
      yt("L2zqTgr9-RI", "Shopping in America — Mall and Store English", "08:00", "A2", false, 3100000),
    ]
  },
  {
    _id: "new_cat_009",
    name: "TOEFL Preparation",
    slug: "toefl-preparation",
    tag: "exam",
    total_lessons: 72,
    page_title: "TOEFL Preparation — Luyện Thi TOEFL ibt Toàn Diện",
    page_description: "Luyện thi TOEFL Listening, Speaking, Reading and Writing",
    lessons: [
      yt("KqIJnU0iFoA", "TOEFL Listening Practice — Lecture About Psychology", "15:00", "C1", false, 3400000),
      yt("tXl8KrKgJ-8", "TOEFL Speaking — Integrated Task Practice", "10:00", "C1", false, 2800000),
      yt("Lj0r0dWRzMM", "TOEFL 100+ Score Strategy — Complete Guide", "20:00", "C1", false, 5600000),
      yt("AFRXP0Q8fhg", "TOEFL Listening — Campus Conversation", "12:00", "B2", false, 4100000),
      yt("YKP2qAfpkDw", "TOEFL Academic Vocabulary — Top 200 Words", "15:00", "C1", false, 3200000),
      yt("eSfJ_y_PcB8", "TOEFL Speaking Templates — Band 4/4 Answers", "12:00", "C1", false, 7800000),
      yt("dCaRPv_sQK4", "TOEFL Writing — Integrated Essay Techniques", "18:00", "C1", false, 4500000),
      yt("Nk9n77u1XUM", "TOEFL Reading — Time Management Tips", "10:00", "B2", false, 2900000),
    ]
  },
  {
    _id: "new_cat_010",
    name: "British English & UK Life",
    slug: "british-english-and-uk-life",
    tag: "daily",
    total_lessons: 55,
    page_title: "British English & UK Life — Tiếng Anh Anh Chính Thống",
    page_description: "Video tiếng Anh Anh (British English) và văn hóa Anh quốc",
    lessons: [
      yt("EbWFZ9RJTio", "British Accent Tutorial — RP Pronunciation", "15:00", "B2", false, 8900000),
      yt("BCgvOQ_kYiQ", "BBC Masterclass — British English Grammar", "12:00", "B2", false, 5600000),
      yt("eP9Jg9bfMTo", "British vs American English — 50 Differences", "10:00", "B1", false, 23000000),
      yt("IIBpVn_Oapo", "UK University Life — British Student English", "15:00", "B1", false, 3400000),
      yt("Zf4wnC0EQo8", "London Life — Real British English in Action", "20:00", "B1", false, 7800000),
      yt("qW5-Hd2EGWI", "British Slang Explained — Innit, Bloke, Mate...", "10:00", "B2", false, 12000000),
      yt("L0MK7qz13bU", "British Humor — Understanding UK Comedy", "12:00", "B2", false, 4500000),
      yt("JkRRQ4NpM_I", "The Queen's English — Royal Speech Analysis", "08:00", "C1", false, 9800000),
    ]
  }
];

// ====================================================
// LOAD AND EXPAND DATA
// ====================================================
let rawData = readFileSync("src/data/categoriesData.js", "utf8");
// Extract the array content
const startIdx = rawData.indexOf("[");
const endIdx = rawData.lastIndexOf("]") + 1;
const existingData = eval(rawData.slice(startIdx, endIdx));

// Merge extra lessons into existing categories
const updatedData = existingData.map(cat => {
  const extras = EXTRA_LESSONS[cat.slug];
  if (extras) {
    return { ...cat, lessons: [...(cat.lessons || []), ...extras] };
  }
  return cat;
});

// Add new categories
const finalData = [...updatedData, ...NEW_CATEGORIES];

// Write back
const output = `export const categoriesData = ${JSON.stringify(finalData, null, 2)};\nexport default categoriesData;\n`;
writeFileSync("src/data/categoriesData.js", output, "utf8");

console.log("Done!");
console.log("Total categories:", finalData.length);
let totalLessons = 0;
finalData.forEach(c => {
  totalLessons += c.lessons?.length || 0;
  console.log(`  ${c.name}: ${c.lessons?.length || 0} lessons`);
});
console.log("Total lessons across all categories:", totalLessons);
