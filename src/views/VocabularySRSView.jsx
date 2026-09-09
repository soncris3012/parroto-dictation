import React, { useState, useEffect } from "react";
import {
  Brain,
  Volume2,
  RotateCw,
  CheckCircle2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Search,
  BookOpen,
  List,
  Headphones,
  Zap,
  Flame,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  CheckCheck
} from "lucide-react";
import { vocabularyDecksData } from "../data/vocabularyDecksData";
import { sounds } from "../utils/audioEffects";
import { playGoogleSpeech } from "../utils/pronunciationAudio";
import { useApp } from "../context/AppContext";

// Maps common English words to emoji + background color for rich visual flashcard
const WORD_VISUALS = {
  // ── Animals ─────────────────────────────────────────────────────
  turtle: { emoji: "🐢", bg: "#1a4a2e", label: "Con rùa" },
  dog: { emoji: "🐕", bg: "#3a2a10", label: "Con chó" },
  cat: { emoji: "🐈", bg: "#2a1a3a", label: "Con mèo" },
  bird: { emoji: "🐦", bg: "#1a2a4a", label: "Con chim" },
  fish: { emoji: "🐟", bg: "#0a2a4a", label: "Con cá" },
  horse: { emoji: "🐎", bg: "#3a2010", label: "Con ngựa" },
  lion: { emoji: "🦁", bg: "#4a3010", label: "Sư tử" },
  bear: { emoji: "🐻", bg: "#3a2a18", label: "Con gấu" },
  fox: { emoji: "🦊", bg: "#4a2810", label: "Con cáo" },
  rabbit: { emoji: "🐰", bg: "#2a1a3a", label: "Thỏ" },
  monkey: { emoji: "🐒", bg: "#3a2a10", label: "Con khỉ" },
  elephant: { emoji: "🐘", bg: "#2a2a3a", label: "Voi" },
  tiger: { emoji: "🐯", bg: "#4a2a10", label: "Hổ" },
  wolf: { emoji: "🐺", bg: "#2a2a2a", label: "Chó sói" },
  snake: { emoji: "🐍", bg: "#0a2a0a", label: "Rắn" },
  whale: { emoji: "🐋", bg: "#0a1a3a", label: "Cá voi" },
  shark: { emoji: "🦈", bg: "#0a2a3a", label: "Cá mập" },
  dolphin: { emoji: "🐬", bg: "#0a2a4a", label: "Cá heo" },
  penguin: { emoji: "🐧", bg: "#1a1a2a", label: "Chim cánh cụt" },
  owl: { emoji: "🦉", bg: "#2a1a0a", label: "Cú mèo" },
  eagle: { emoji: "🦅", bg: "#3a2a0a", label: "Đại bàng" },
  butterfly: { emoji: "🦋", bg: "#2a0a2a", label: "Bướm" },
  bee: { emoji: "🐝", bg: "#3a3a0a", label: "Con ong" },
  frog: { emoji: "🐸", bg: "#0a3a0a", label: "Con ếch" },
  crocodile: { emoji: "🐊", bg: "#0a2a0a", label: "Cá sấu" },
  giraffe: { emoji: "🦒", bg: "#3a2a0a", label: "Hươu cao cổ" },
  zebra: { emoji: "🦓", bg: "#1a1a1a", label: "Ngựa vằn" },
  gorilla: { emoji: "🦍", bg: "#1a1a0a", label: "Khỉ đột" },
  parrot: { emoji: "🦜", bg: "#0a2a1a", label: "Vẹt" },
  deer: { emoji: "🦌", bg: "#3a2a10", label: "Con nai" },
  // ── Nature & Weather ─────────────────────────────────────────────
  tree: { emoji: "🌳", bg: "#1a3a1a", label: "Cây cối" },
  flower: { emoji: "🌸", bg: "#3a1a2a", label: "Hoa" },
  sun: { emoji: "☀️", bg: "#4a3a0a", label: "Mặt trời" },
  moon: { emoji: "🌙", bg: "#1a1a3a", label: "Mặt trăng" },
  star: { emoji: "⭐", bg: "#2a2a10", label: "Ngôi sao" },
  rain: { emoji: "🌧️", bg: "#1a2a3a", label: "Mưa" },
  snow: { emoji: "❄️", bg: "#1a2a3a", label: "Tuyết" },
  fire: { emoji: "🔥", bg: "#3a1a0a", label: "Lửa" },
  water: { emoji: "💧", bg: "#0a2a4a", label: "Nước" },
  ocean: { emoji: "🌊", bg: "#0a1a3a", label: "Đại dương" },
  mountain: { emoji: "⛰️", bg: "#2a2a1a", label: "Núi" },
  forest: { emoji: "🌲", bg: "#0a2a0a", label: "Rừng" },
  cloud: { emoji: "☁️", bg: "#2a2a3a", label: "Đám mây" },
  earth: { emoji: "🌍", bg: "#0a2a1a", label: "Trái đất" },
  wind: { emoji: "💨", bg: "#1a2a3a", label: "Gió" },
  storm: { emoji: "⛈️", bg: "#1a1a2a", label: "Bão" },
  thunder: { emoji: "🌩️", bg: "#0a0a2a", label: "Sấm sét" },
  rainbow: { emoji: "🌈", bg: "#1a1a2a", label: "Cầu vồng" },
  desert: { emoji: "🏜️", bg: "#3a2a0a", label: "Sa mạc" },
  island: { emoji: "🏝️", bg: "#0a2a1a", label: "Đảo" },
  volcano: { emoji: "🌋", bg: "#3a0a0a", label: "Núi lửa" },
  river: { emoji: "🏞️", bg: "#0a2a2a", label: "Sông" },
  lake: { emoji: "💦", bg: "#0a2a3a", label: "Hồ" },
  leaf: { emoji: "🍃", bg: "#0a2a0a", label: "Chiếc lá" },
  grass: { emoji: "🌿", bg: "#0a2a0a", label: "Cỏ" },
  rose: { emoji: "🌹", bg: "#3a0a0a", label: "Hoa hồng" },
  // ── Food & Drinks ────────────────────────────────────────────────
  apple: { emoji: "🍎", bg: "#3a0a0a", label: "Táo" },
  bread: { emoji: "🍞", bg: "#3a2a10", label: "Bánh mì" },
  coffee: { emoji: "☕", bg: "#2a1a0a", label: "Cà phê" },
  rice: { emoji: "🍚", bg: "#2a2a1a", label: "Cơm" },
  cake: { emoji: "🎂", bg: "#2a0a2a", label: "Bánh" },
  milk: { emoji: "🥛", bg: "#1a1a2a", label: "Sữa" },
  egg: { emoji: "🥚", bg: "#2a2a0a", label: "Trứng" },
  chicken: { emoji: "🍗", bg: "#3a2a0a", label: "Gà" },
  fruit: { emoji: "🍓", bg: "#3a0a1a", label: "Hoa quả" },
  vegetable: { emoji: "🥦", bg: "#0a2a0a", label: "Rau củ" },
  pizza: { emoji: "🍕", bg: "#3a1a0a", label: "Pizza" },
  burger: { emoji: "🍔", bg: "#3a2a0a", label: "Hamburger" },
  sushi: { emoji: "🍣", bg: "#1a2a2a", label: "Sushi" },
  noodle: { emoji: "🍜", bg: "#2a1a0a", label: "Mì" },
  soup: { emoji: "🍲", bg: "#3a1a0a", label: "Súp" },
  salad: { emoji: "🥗", bg: "#0a2a0a", label: "Salad" },
  meat: { emoji: "🥩", bg: "#3a0a0a", label: "Thịt" },
  cheese: { emoji: "🧀", bg: "#3a2a0a", label: "Pho mát" },
  chocolate: { emoji: "🍫", bg: "#2a1a0a", label: "Sô cô la" },
  ice: { emoji: "🧊", bg: "#0a2a3a", label: "Đá" },
  wine: { emoji: "🍷", bg: "#3a0a0a", label: "Rượu vang" },
  beer: { emoji: "🍺", bg: "#3a2a0a", label: "Bia" },
  juice: { emoji: "🍹", bg: "#3a1a0a", label: "Nước trái cây" },
  tea: { emoji: "🍵", bg: "#1a2a1a", label: "Trà" },
  orange: { emoji: "🍊", bg: "#3a1a0a", label: "Cam" },
  banana: { emoji: "🍌", bg: "#3a2a0a", label: "Chuối" },
  strawberry: { emoji: "🍓", bg: "#3a0a0a", label: "Dâu tây" },
  watermelon: { emoji: "🍉", bg: "#2a1a1a", label: "Dưa hấu" },
  grape: { emoji: "🍇", bg: "#2a0a2a", label: "Nho" },
  // ── Objects & Technology ─────────────────────────────────────────
  book: { emoji: "📚", bg: "#1a1a3a", label: "Sách" },
  phone: { emoji: "📱", bg: "#1a1a2a", label: "Điện thoại" },
  computer: { emoji: "💻", bg: "#1a2a3a", label: "Máy tính" },
  car: { emoji: "🚗", bg: "#1a2a3a", label: "Xe hơi" },
  house: { emoji: "🏠", bg: "#2a1a0a", label: "Nhà" },
  game: { emoji: "🎮", bg: "#0a0a2a", label: "Trò chơi" },
  ball: { emoji: "⚽", bg: "#1a1a1a", label: "Bóng đá" },
  camera: { emoji: "📸", bg: "#1a1a2a", label: "Máy ảnh" },
  letter: { emoji: "✉️", bg: "#0a2a2a", label: "Thư" },
  map: { emoji: "🗺️", bg: "#1a2a2a", label: "Bản đồ" },
  television: { emoji: "📺", bg: "#0a0a2a", label: "Tivi" },
  radio: { emoji: "📻", bg: "#1a1a2a", label: "Đài phát thanh" },
  newspaper: { emoji: "📰", bg: "#1a1a1a", label: "Báo" },
  scissors: { emoji: "✂️", bg: "#1a2a2a", label: "Kéo" },
  pencil: { emoji: "✏️", bg: "#2a2a0a", label: "Bút chì" },
  pen: { emoji: "🖊️", bg: "#0a1a2a", label: "Bút mực" },
  bag: { emoji: "👜", bg: "#2a1a1a", label: "Túi xách" },
  umbrella: { emoji: "☂️", bg: "#0a0a2a", label: "Ô dù" },
  chair: { emoji: "🪑", bg: "#2a1a0a", label: "Ghế" },
  lamp: { emoji: "💡", bg: "#2a2a0a", label: "Đèn" },
  mirror: { emoji: "🪞", bg: "#2a2a2a", label: "Gương" },
  robot: { emoji: "🤖", bg: "#0a1a2a", label: "Robot" },
  satellite: { emoji: "🛰️", bg: "#0a0a2a", label: "Vệ tinh" },
  microscope: { emoji: "🔬", bg: "#0a1a2a", label: "Kính hiển vi" },
  telescope: { emoji: "🔭", bg: "#0a0a2a", label: "Kính thiên văn" },
  // ── People, Jobs & Society ───────────────────────────────────────
  love: { emoji: "❤️", bg: "#3a0a0a", label: "Tình yêu" },
  happy: { emoji: "😊", bg: "#3a2a0a", label: "Hạnh phúc" },
  sad: { emoji: "😢", bg: "#0a1a3a", label: "Buồn" },
  family: { emoji: "👨‍👩‍👧‍👦", bg: "#2a1a1a", label: "Gia đình" },
  friend: { emoji: "🤝", bg: "#0a2a2a", label: "Bạn bè" },
  baby: { emoji: "👶", bg: "#2a0a1a", label: "Em bé" },
  doctor: { emoji: "👨‍⚕️", bg: "#0a2a2a", label: "Bác sĩ" },
  teacher: { emoji: "👨‍🏫", bg: "#0a1a2a", label: "Giáo viên" },
  police: { emoji: "👮", bg: "#0a0a2a", label: "Cảnh sát" },
  soldier: { emoji: "💂", bg: "#1a2a0a", label: "Binh sĩ" },
  chef: { emoji: "👨‍🍳", bg: "#2a1a0a", label: "Đầu bếp" },
  nurse: { emoji: "👩‍⚕️", bg: "#0a2a2a", label: "Y tá" },
  pilot: { emoji: "👨‍✈️", bg: "#0a0a2a", label: "Phi công" },
  farmer: { emoji: "👨‍🌾", bg: "#1a2a0a", label: "Nông dân" },
  scientist: { emoji: "👨‍🔬", bg: "#0a1a2a", label: "Nhà khoa học" },
  engineer: { emoji: "👨‍💻", bg: "#0a0a2a", label: "Kỹ sư" },
  artist: { emoji: "👨‍🎨", bg: "#2a0a2a", label: "Nghệ sĩ" },
  student: { emoji: "🧑‍🎓", bg: "#0a1a2a", label: "Sinh viên" },
  manager: { emoji: "👔", bg: "#0a0a2a", label: "Quản lý" },
  king: { emoji: "👑", bg: "#2a2a0a", label: "Vua" },
  queen: { emoji: "👸", bg: "#2a0a2a", label: "Nữ hoàng" },
  hero: { emoji: "🦸", bg: "#0a0a2a", label: "Anh hùng" },
  // ── Emotions & States ────────────────────────────────────────────
  angry: { emoji: "😠", bg: "#2a0a0a", label: "Tức giận" },
  scared: { emoji: "😨", bg: "#1a0a2a", label: "Sợ hãi" },
  excited: { emoji: "🤩", bg: "#2a1a0a", label: "Phấn khích" },
  tired: { emoji: "😪", bg: "#1a1a2a", label: "Mệt mỏi" },
  surprised: { emoji: "😲", bg: "#0a1a2a", label: "Ngạc nhiên" },
  confused: { emoji: "😕", bg: "#1a1a2a", label: "Bối rối" },
  nervous: { emoji: "😰", bg: "#0a1a1a", label: "Lo lắng" },
  proud: { emoji: "😤", bg: "#1a1a0a", label: "Tự hào" },
  grateful: { emoji: "🙏", bg: "#1a1a0a", label: "Biết ơn" },
  jealous: { emoji: "😒", bg: "#0a1a0a", label: "Ghen tị" },
  lonely: { emoji: "😞", bg: "#0a0a1a", label: "Cô đơn" },
  bored: { emoji: "😑", bg: "#1a1a1a", label: "Chán nản" },
  // ── Actions & Movements ──────────────────────────────────────────
  time: { emoji: "⏰", bg: "#1a1a3a", label: "Thời gian" },
  day: { emoji: "🌅", bg: "#2a2a0a", label: "Ban ngày" },
  night: { emoji: "🌃", bg: "#0a0a2a", label: "Đêm" },
  morning: { emoji: "🌄", bg: "#2a1a0a", label: "Buổi sáng" },
  work: { emoji: "💼", bg: "#1a1a2a", label: "Công việc" },
  run: { emoji: "🏃", bg: "#0a2a1a", label: "Chạy" },
  walk: { emoji: "🚶", bg: "#1a2a1a", label: "Đi bộ" },
  sleep: { emoji: "😴", bg: "#0a0a2a", label: "Ngủ" },
  eat: { emoji: "🍽️", bg: "#2a1a0a", label: "Ăn" },
  read: { emoji: "📖", bg: "#1a1a2a", label: "Đọc" },
  write: { emoji: "✍️", bg: "#1a2a1a", label: "Viết" },
  speak: { emoji: "💬", bg: "#0a2a2a", label: "Nói" },
  listen: { emoji: "👂", bg: "#2a1a1a", label: "Lắng nghe" },
  think: { emoji: "🤔", bg: "#1a1a3a", label: "Suy nghĩ" },
  swim: { emoji: "🏊", bg: "#0a1a3a", label: "Bơi lội" },
  jump: { emoji: "🦘", bg: "#0a2a1a", label: "Nhảy" },
  dance: { emoji: "💃", bg: "#2a0a2a", label: "Nhảy múa" },
  sing: { emoji: "🎤", bg: "#2a0a2a", label: "Ca hát" },
  play: { emoji: "🎭", bg: "#2a0a1a", label: "Chơi" },
  cook: { emoji: "🧑‍🍳", bg: "#2a1a0a", label: "Nấu ăn" },
  build: { emoji: "🏗️", bg: "#2a1a0a", label: "Xây dựng" },
  fly: { emoji: "✈️", bg: "#0a0a2a", label: "Bay" },
  drive: { emoji: "🚘", bg: "#1a0a2a", label: "Lái xe" },
  climb: { emoji: "🧗", bg: "#2a1a0a", label: "Leo trèo" },
  fight: { emoji: "🥊", bg: "#2a0a0a", label: "Chiến đấu" },
  win: { emoji: "🏆", bg: "#2a2a0a", label: "Chiến thắng" },
  lose: { emoji: "😭", bg: "#0a0a2a", label: "Thua cuộc" },
  help: { emoji: "🤲", bg: "#0a2a1a", label: "Giúp đỡ" },
  teach: { emoji: "📝", bg: "#0a1a2a", label: "Dạy học" },
  learn: { emoji: "🎓", bg: "#0a1a3a", label: "Học tập" },
  // ── Places & Travel ──────────────────────────────────────────────
  city: { emoji: "🏙️", bg: "#0a1a2a", label: "Thành phố" },
  hospital: { emoji: "🏥", bg: "#0a2a2a", label: "Bệnh viện" },
  airport: { emoji: "✈️", bg: "#0a0a2a", label: "Sân bay" },
  park: { emoji: "🌿", bg: "#0a2a0a", label: "Công viên" },
  beach: { emoji: "🏖️", bg: "#0a2a2a", label: "Bãi biển" },
  hotel: { emoji: "🏨", bg: "#1a0a2a", label: "Khách sạn" },
  restaurant: { emoji: "🍽️", bg: "#2a0a0a", label: "Nhà hàng" },
  market: { emoji: "🏪", bg: "#1a1a0a", label: "Chợ" },
  bank: { emoji: "🏦", bg: "#0a1a2a", label: "Ngân hàng" },
  library: { emoji: "📚", bg: "#1a0a1a", label: "Thư viện" },
  museum: { emoji: "🏛️", bg: "#1a1a2a", label: "Bảo tàng" },
  church: { emoji: "⛪", bg: "#1a1a2a", label: "Nhà thờ" },
  temple: { emoji: "🛕", bg: "#2a1a0a", label: "Đền chùa" },
  stadium: { emoji: "🏟️", bg: "#0a1a0a", label: "Sân vận động" },
  factory: { emoji: "🏭", bg: "#1a1a1a", label: "Nhà máy" },
  farm: { emoji: "🚜", bg: "#1a2a0a", label: "Nông trại" },
  office: { emoji: "🏢", bg: "#0a0a1a", label: "Văn phòng" },
  village: { emoji: "🏡", bg: "#1a2a0a", label: "Làng quê" },
  castle: { emoji: "🏰", bg: "#1a1a1a", label: "Lâu đài" },
  tower: { emoji: "🗼", bg: "#1a0a1a", label: "Tháp" },
  // ── Transport ────────────────────────────────────────────────────
  bus: { emoji: "🚌", bg: "#1a1a0a", label: "Xe buýt" },
  train: { emoji: "🚂", bg: "#1a0a1a", label: "Tàu hỏa" },
  plane: { emoji: "✈️", bg: "#0a0a2a", label: "Máy bay" },
  boat: { emoji: "⛵", bg: "#0a1a2a", label: "Thuyền" },
  ship: { emoji: "🚢", bg: "#0a0a2a", label: "Tàu thủy" },
  bicycle: { emoji: "🚲", bg: "#0a1a1a", label: "Xe đạp" },
  motorcycle: { emoji: "🏍️", bg: "#1a0a0a", label: "Xe máy" },
  truck: { emoji: "🚛", bg: "#1a1a0a", label: "Xe tải" },
  taxi: { emoji: "🚕", bg: "#2a2a0a", label: "Taxi" },
  submarine: { emoji: "🤿", bg: "#0a0a2a", label: "Tàu ngầm" },
  helicopter: { emoji: "🚁", bg: "#0a1a2a", label: "Máy bay trực thăng" },
  rocket: { emoji: "🚀", bg: "#0a0a2a", label: "Tên lửa" },
  // ── Clothing & Accessories ───────────────────────────────────────
  shirt: { emoji: "👕", bg: "#0a1a2a", label: "Áo phông" },
  dress: { emoji: "👗", bg: "#2a0a1a", label: "Váy" },
  shoes: { emoji: "👟", bg: "#1a1a1a", label: "Giày" },
  hat: { emoji: "🎩", bg: "#0a0a1a", label: "Mũ" },
  glasses: { emoji: "👓", bg: "#0a0a2a", label: "Kính mắt" },
  ring: { emoji: "💍", bg: "#2a2a0a", label: "Nhẫn" },
  crown: { emoji: "👑", bg: "#2a2a0a", label: "Vương miện" },
  boots: { emoji: "👢", bg: "#1a0a0a", label: "Bốt" },
  jacket: { emoji: "🧥", bg: "#1a1a1a", label: "Áo khoác" },
  gloves: { emoji: "🧤", bg: "#1a1a1a", label: "Găng tay" },
  scarf: { emoji: "🧣", bg: "#2a0a0a", label: "Khăn quàng" },
  watch: { emoji: "⌚", bg: "#1a1a1a", label: "Đồng hồ đeo tay" },
  // ── Sports & Activities ──────────────────────────────────────────
  soccer: { emoji: "⚽", bg: "#0a2a0a", label: "Bóng đá" },
  basketball: { emoji: "🏀", bg: "#2a1a0a", label: "Bóng rổ" },
  tennis: { emoji: "🎾", bg: "#2a2a0a", label: "Quần vợt" },
  baseball: { emoji: "⚾", bg: "#1a1a1a", label: "Bóng chày" },
  volleyball: { emoji: "🏐", bg: "#0a1a1a", label: "Bóng chuyền" },
  swimming: { emoji: "🏊", bg: "#0a1a3a", label: "Bơi lội" },
  cycling: { emoji: "🚴", bg: "#0a1a1a", label: "Đua xe đạp" },
  boxing: { emoji: "🥊", bg: "#2a0a0a", label: "Quyền anh" },
  yoga: { emoji: "🧘", bg: "#1a0a1a", label: "Yoga" },
  skiing: { emoji: "⛷️", bg: "#0a1a2a", label: "Trượt tuyết" },
  golf: { emoji: "⛳", bg: "#0a2a0a", label: "Golf" },
  archery: { emoji: "🏹", bg: "#1a1a0a", label: "Bắn cung" },
  trophy: { emoji: "🏆", bg: "#2a2a0a", label: "Cúp vô địch" },
  medal: { emoji: "🥇", bg: "#2a2a0a", label: "Huy chương" },
  // ── Music & Arts ─────────────────────────────────────────────────
  guitar: { emoji: "🎸", bg: "#2a1a0a", label: "Đàn guitar" },
  piano: { emoji: "🎹", bg: "#0a0a0a", label: "Đàn piano" },
  violin: { emoji: "🎻", bg: "#2a1a0a", label: "Đàn violin" },
  drums: { emoji: "🥁", bg: "#2a0a0a", label: "Trống" },
  microphone: { emoji: "🎤", bg: "#1a0a1a", label: "Micro" },
  headphones: { emoji: "🎧", bg: "#0a0a2a", label: "Tai nghe" },
  speaker: { emoji: "🔊", bg: "#0a0a1a", label: "Loa" },
  painting: { emoji: "🎨", bg: "#1a0a1a", label: "Hội họa" },
  theater: { emoji: "🎭", bg: "#2a0a1a", label: "Nhà hát" },
  cinema: { emoji: "🎬", bg: "#0a0a1a", label: "Rạp chiếu phim" },
  concert: { emoji: "🎼", bg: "#2a0a2a", label: "Buổi hòa nhạc" },
  // ── Body Parts ───────────────────────────────────────────────────
  eye: { emoji: "👁️", bg: "#1a1a2a", label: "Mắt" },
  hand: { emoji: "🤚", bg: "#2a1a0a", label: "Bàn tay" },
  foot: { emoji: "🦶", bg: "#2a1a0a", label: "Bàn chân" },
  heart: { emoji: "❤️", bg: "#3a0a0a", label: "Trái tim" },
  brain: { emoji: "🧠", bg: "#2a0a1a", label: "Não bộ" },
  mouth: { emoji: "👄", bg: "#2a0a0a", label: "Miệng" },
  ear: { emoji: "👂", bg: "#2a1a0a", label: "Tai" },
  nose: { emoji: "👃", bg: "#2a1a0a", label: "Mũi" },
  tooth: { emoji: "🦷", bg: "#1a1a1a", label: "Răng" },
  hair: { emoji: "💇", bg: "#1a0a0a", label: "Tóc" },
  bone: { emoji: "🦴", bg: "#1a1a1a", label: "Xương" },
  // ── Abstract & Academic ──────────────────────────────────────────
  idea: { emoji: "💡", bg: "#2a2a0a", label: "Ý tưởng" },
  knowledge: { emoji: "🧠", bg: "#2a0a2a", label: "Kiến thức" },
  power: { emoji: "⚡", bg: "#2a2a0a", label: "Sức mạnh" },
  success: { emoji: "🏆", bg: "#2a1a0a", label: "Thành công" },
  change: { emoji: "🔄", bg: "#0a2a2a", label: "Thay đổi" },
  grow: { emoji: "📈", bg: "#0a2a0a", label: "Tăng trưởng" },
  future: { emoji: "🚀", bg: "#0a0a3a", label: "Tương lai" },
  world: { emoji: "🌐", bg: "#0a2a2a", label: "Thế giới" },
  peace: { emoji: "☮️", bg: "#0a2a1a", label: "Hòa bình" },
  hope: { emoji: "🌟", bg: "#2a2a0a", label: "Hy vọng" },
  freedom: { emoji: "🕊️", bg: "#0a1a2a", label: "Tự do" },
  justice: { emoji: "⚖️", bg: "#1a1a1a", label: "Công lý" },
  truth: { emoji: "🔍", bg: "#0a1a2a", label: "Sự thật" },
  beauty: { emoji: "✨", bg: "#2a0a2a", label: "Vẻ đẹp" },
  dream: { emoji: "🌙", bg: "#0a0a2a", label: "Giấc mơ" },
  courage: { emoji: "🦁", bg: "#3a1a0a", label: "Lòng dũng cảm" },
  wisdom: { emoji: "🦉", bg: "#2a1a0a", label: "Sự khôn ngoan" },
  faith: { emoji: "✨", bg: "#1a1a2a", label: "Niềm tin" },
  culture: { emoji: "🌏", bg: "#0a1a2a", label: "Văn hóa" },
  language: { emoji: "🗣️", bg: "#0a2a2a", label: "Ngôn ngữ" },
  science: { emoji: "🔬", bg: "#0a1a2a", label: "Khoa học" },
  technology: { emoji: "💻", bg: "#0a0a2a", label: "Công nghệ" },
  art: { emoji: "🎨", bg: "#2a0a2a", label: "Nghệ thuật" },
  history: { emoji: "📜", bg: "#2a1a0a", label: "Lịch sử" },
  mathematics: { emoji: "📐", bg: "#0a1a2a", label: "Toán học" },
  // ── Environment & Health ─────────────────────────────────────────
  pollution: { emoji: "🌫️", bg: "#1a1a0a", label: "Ô nhiễm" },
  recycling: { emoji: "♻️", bg: "#0a2a0a", label: "Tái chế" },
  energy: { emoji: "⚡", bg: "#2a2a0a", label: "Năng lượng" },
  climate: { emoji: "🌡️", bg: "#2a1a0a", label: "Khí hậu" },
  medicine: { emoji: "💊", bg: "#0a2a2a", label: "Thuốc" },
  vaccine: { emoji: "💉", bg: "#0a1a2a", label: "Vắc xin" },
  exercise: { emoji: "🏋️", bg: "#0a1a0a", label: "Tập luyện" },
  meditation: { emoji: "🧘", bg: "#1a0a1a", label: "Thiền định" },
  // ── Money & Business ─────────────────────────────────────────────
  investment: { emoji: "📈", bg: "#0a2a0a", label: "Đầu tư" },
  profit: { emoji: "💹", bg: "#0a2a0a", label: "Lợi nhuận" },
  salary: { emoji: "💰", bg: "#1a2a0a", label: "Lương" },
  contract: { emoji: "📄", bg: "#1a1a2a", label: "Hợp đồng" },
  startup: { emoji: "🚀", bg: "#0a0a2a", label: "Công ty khởi nghiệp" },
  inflation: { emoji: "📈", bg: "#2a1a0a", label: "Lạm phát" },
};

// Returns visual for a word (emoji illustration like Sorata app)
function getWordVisual(word) {
  const w = (word || "").toLowerCase().trim();
  return WORD_VISUALS[w] || null;
}

// Get contextual emoji based on word type / level if no exact match
function getTypeEmoji(type, level) {
  const typeMap = { noun: "📦", verb: "⚙️", adjective: "🎨", adverb: "🏃", idiom: "💬", "phrasal verb": "🔗" };
  return typeMap[type?.toLowerCase()] || "📝";
}

export default function VocabularySRSView() {
  const { currentUser, addNote } = useApp();
  const [selectedDeckIdx, setSelectedDeckIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("flashcard"); // 'flashcard' | 'quiz' | 'spelling' | 'list'
  const [searchTerm, setSearchTerm] = useState("");

  // Flashcard Mode State
  const [cardIndex, setCardIndex] = useState(() => Math.floor(Math.random() * (vocabularyDecksData[0]?.words?.length || 1)));
  const [isFlipped, setIsFlipped] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [deckProgress, setDeckProgress] = useState({}); // { [word]: 'easy' | 'good' | 'hard' }
  const [savedNotes, setSavedNotes] = useState({});
  const [toastMessage, setToastMessage] = useState("");

  // Quiz Mode State
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStreak, setQuizStreak] = useState(0);

  // Spelling Mode State
  const [spellingIdx, setSpellingIdx] = useState(0);
  const [spellingInput, setSpellingInput] = useState("");
  const [spellingResult, setSpellingResult] = useState(null); // 'correct' | 'wrong' | null
  const [spellingScore, setSpellingScore] = useState(0);

  // Word List Filter & Pagination
  const [listSearch, setListSearch] = useState("");
  const [listTypeFilter, setListTypeFilter] = useState("all");
  const [listPage, setListPage] = useState(1);
  const LIST_PAGE_SIZE = 36;

  const currentDeck = vocabularyDecksData[selectedDeckIdx] || vocabularyDecksData[0];
  const words = currentDeck.words || [];
  const current = words[cardIndex] || words[0];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const speak = (w) => {
    if (!w) return;
    playGoogleSpeech(w, 0.95);
  };

  // Auto-play audio when navigating to a new card if enabled
  useEffect(() => {
    if (activeTab === "flashcard" && autoPlayAudio && current?.word) {
      speak(current.word);
    }
    setIsFlipped(false);
  }, [cardIndex, selectedDeckIdx, activeTab]);

  // Reset indices when switching deck
  const handleSelectDeck = (idx) => {
    setSelectedDeckIdx(idx);
    const deckLength = vocabularyDecksData[idx]?.words?.length || 1;
    const randomStartIndex = Math.floor(Math.random() * deckLength);
    setCardIndex(randomStartIndex);
    setIsFlipped(false);
    setQuizIdx(0);
    setQuizScore(0);
    setSelectedQuizOption(null);
    setIsQuizAnswered(false);
    setQuizFinished(false);
    setQuizStreak(0);
    setSpellingIdx(0);
    setSpellingInput("");
    setSpellingResult(null);
    setSpellingScore(0);
    setListPage(1);
  };

  // SRS Flashcard Grading
  const handleGrade = (difficulty) => {
    if (difficulty === "easy" || difficulty === "good") {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }

    setDeckProgress((prev) => ({
      ...prev,
      [`${currentDeck.slug}_${current.word}`]: difficulty
    }));

    setIsFlipped(false);
    if (cardIndex + 1 < words.length) {
      setCardIndex(cardIndex + 1);
    } else {
      setCardIndex(0);
      showToast(`🎉 Chúc mừng! Bạn đã hoàn thành 1 vòng ôn tập ${words.length} từ vựng.`);
    }
  };

  // 1-Click Bookmark to SQLite My Notes
  const handleBookmarkWord = async (wordObj) => {
    const key = `${currentDeck.slug}_${wordObj.word}`;
    if (savedNotes[key]) {
      showToast(`Từ "${wordObj.word}" đã được lưu trong Sổ tay!`);
      return;
    }

    try {
      if (addNote) {
        await addNote({
          title: wordObj.word,
          content: wordObj.meaning,
          tag: "vocabulary",
          ipa: wordObj.ipa,
          example: `${wordObj.example} (${wordObj.example_vi || ""})`,
          audio_text: wordObj.word
        });
      }
      setSavedNotes((prev) => ({ ...prev, [key]: true }));
      showToast(`Đã lưu "${wordObj.word}" vào Sổ tay ghi chú SQLite!`);
    } catch (err) {
      showToast("Lỗi khi lưu vào sổ tay!");
    }
  };

  // Generate Quiz Options (1 correct + 3 random distractors)
  const currentQuizWord = words[quizIdx] || words[0];
  const quizOptions = React.useMemo(() => {
    if (!currentQuizWord) return [];
    const correctMeaning = currentQuizWord.meaning;
    const otherWords = words.filter((w) => w.word !== currentQuizWord.word);
    // Shuffle and pick 3 distractors
    const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [
      { text: correctMeaning, isCorrect: true },
      ...shuffledOthers.map((w) => ({ text: w.meaning, isCorrect: false }))
    ].sort(() => 0.5 - Math.random());
    return options;
  }, [quizIdx, selectedDeckIdx]);

  const handleSelectQuizOption = (opt) => {
    if (isQuizAnswered) return;
    setSelectedQuizOption(opt);
    setIsQuizAnswered(true);

    if (opt.isCorrect) {
      sounds.playCorrect();
      setQuizScore((prev) => prev + 1);
      setQuizStreak((prev) => prev + 1);
    } else {
      sounds.playWrong();
      setQuizStreak(0);
    }
  };

  const handleNextQuiz = () => {
    if (quizIdx + 1 < words.length) {
      setQuizIdx(quizIdx + 1);
      setSelectedQuizOption(null);
      setIsQuizAnswered(false);
    } else {
      setQuizFinished(true);
      sounds.playLessonSuccess();
    }
  };

  const restartQuiz = () => {
    setQuizIdx(0);
    setQuizScore(0);
    setSelectedQuizOption(null);
    setIsQuizAnswered(false);
    setQuizFinished(false);
    setQuizStreak(0);
  };

  // Spelling / Dictation Check
  const currentSpellingWord = words[spellingIdx] || words[0];
  const handleCheckSpelling = (e) => {
    e.preventDefault();
    if (!spellingInput.trim()) return;

    const userWord = spellingInput.trim().toLowerCase();
    const targetWord = currentSpellingWord.word.trim().toLowerCase();

    if (userWord === targetWord) {
      setSpellingResult("correct");
      sounds.playCorrect();
      setSpellingScore((prev) => prev + 1);
    } else {
      setSpellingResult("wrong");
      sounds.playWrong();
    }
  };

  const handleNextSpelling = () => {
    setSpellingInput("");
    setSpellingResult(null);
    if (spellingIdx + 1 < words.length) {
      setSpellingIdx(spellingIdx + 1);
      speak(words[spellingIdx + 1].word);
    } else {
      setSpellingIdx(0);
      showToast(`Hoàn thành phần luyện gõ từ! Bạn đạt ${spellingScore}/${words.length} từ đúng.`);
    }
  };

  // Decks filter
  const filteredDecks = vocabularyDecksData.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Deck Progress stats
  const masteredCount = words.filter((w) => deckProgress[`${currentDeck.slug}_${w.word}`] === "easy").length;
  const progressPercent = Math.round((masteredCount / (words.length || 1)) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "1050px", margin: "0 auto", width: "100%", paddingBottom: "40px" }}>
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#0d1527",
            border: "2px solid #a855f7",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 700,
            fontSize: "14px"
          }}
        >
          <Sparkles size={18} color="#a855f7" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#a855f7", padding: "4px 14px", borderRadius: "9999px", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
          <Brain size={16} />
          <span>21 Bộ Từ Vựng Chuẩn Quốc Tế • Spaced Repetition System (SRS)</span>
        </div>
        <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--foreground)", marginBottom: "6px" }}>
          Học Từ Vựng & Flashcard Thông Minh Sorata
        </h2>
        <p style={{ fontSize: "14px", color: "var(--muted-foreground)" }}>
          Kết hợp thuật toán lặp ngắt quãng SuperMemo SM-2, trắc nghiệm phản xạ, gõ từ chính tả và tra cứu chuyên sâu.
        </p>
      </div>

      {/* Deck Selector Strip */}
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "2px solid var(--border)",
          borderRadius: "18px",
          padding: "18px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--foreground)" }}>
            Chọn 1 trong 21 bộ từ vựng mục tiêu:
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "6px 12px",
              width: "220px"
            }}
          >
            <Search size={14} color="var(--muted-foreground)" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm bộ từ vựng..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--foreground)",
                fontSize: "12px",
                width: "100%"
              }}
            />
          </div>
        </div>

        {/* Horizontal scrollable deck buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "6px"
          }}
        >
          {filteredDecks.map((d) => {
            const actualIdx = vocabularyDecksData.indexOf(d);
            const isSelected = actualIdx === selectedDeckIdx;
            return (
              <button
                key={d.slug}
                onClick={() => handleSelectDeck(actualIdx)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: isSelected ? "2px solid #a855f7" : "1px solid var(--border)",
                  backgroundColor: isSelected ? "rgba(168, 85, 247, 0.2)" : "var(--muted)",
                  color: isSelected ? "#c084fc" : "var(--foreground)",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: 0,
                  transition: "all 0.15s ease"
                }}
              >
                <span>{d.name}</span>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: isSelected ? "#a855f7" : "var(--background)",
                    color: isSelected ? "#fff" : "var(--muted-foreground)"
                  }}
                >
                  {d.words?.length || 0} từ
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Deck Overview Bar & Mode Tabs */}
      <div
        style={{
          backgroundColor: "var(--card)",
          border: "2px solid var(--border)",
          borderRadius: "18px",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 800,
                backgroundColor: "rgba(168, 85, 247, 0.2)",
                color: "#c084fc",
                padding: "2px 8px",
                borderRadius: "6px"
              }}
            >
              CẤP ĐỘ: {currentDeck.level}
            </span>
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--foreground)" }}>
              {currentDeck.name}
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--muted-foreground)" }}>
            <span>Số lượng: <strong style={{ color: "var(--foreground)" }}>{words.length}</strong> từ vựng</span>
            <span>• Đã thành thạo: <strong style={{ color: "var(--success)" }}>{masteredCount}</strong> ({progressPercent}%)</span>
          </div>
        </div>

        {/* 4 Mode Switcher Tabs */}
        <div style={{ display: "flex", gap: "6px", backgroundColor: "var(--muted)", padding: "4px", borderRadius: "12px" }}>
          <button
            onClick={() => setActiveTab("flashcard")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "flashcard" ? "#a855f7" : "transparent",
              color: activeTab === "flashcard" ? "#fff" : "var(--muted-foreground)",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Brain size={14} /> Flashcard 3D
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "quiz" ? "#a855f7" : "transparent",
              color: activeTab === "quiz" ? "#fff" : "var(--muted-foreground)",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Zap size={14} /> Trắc Nghiệm Tốc Độ
          </button>

          <button
            onClick={() => setActiveTab("spelling")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "spelling" ? "#a855f7" : "transparent",
              color: activeTab === "spelling" ? "#fff" : "var(--muted-foreground)",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Headphones size={14} /> Nghe & Gõ Từ
          </button>

          <button
            onClick={() => setActiveTab("list")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: activeTab === "list" ? "#a855f7" : "transparent",
              color: activeTab === "list" ? "#fff" : "var(--muted-foreground)",
              fontSize: "12px",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <List size={14} /> Tra Cứu ({words.length})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: SMART 3D FLASHCARD                               */}
      {/* ========================================================= */}
      {activeTab === "flashcard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Progress Bar & Counter */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", color: "var(--muted-foreground)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontWeight: 800, color: "var(--foreground)" }}>
                Từ {cardIndex + 1} / {words.length}
              </span>
              <div style={{ width: "160px", height: "6px", backgroundColor: "var(--muted)", borderRadius: "9999px", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${((cardIndex + 1) / words.length) * 100}%`,
                    height: "100%",
                    backgroundColor: "#a855f7",
                    transition: "width 0.3s ease"
                  }}
                />
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" }}>
              <input
                type="checkbox"
                checked={autoPlayAudio}
                onChange={(e) => setAutoPlayAudio(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              <span>Tự động phát âm khi chuyển thẻ</span>
            </label>
          </div>

          {/* 3D Interactive Flip Card */}
          {current && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              style={{
                minHeight: "360px",
                backgroundColor: "var(--card)",
                border: isFlipped ? "2px solid #a855f7" : "2px solid var(--border)",
                borderRadius: "24px",
                padding: "36px 28px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                position: "relative",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                transition: "all 0.25s ease"
              }}
            >
              {/* Card top toolbar */}
              <div style={{ position: "absolute", top: "18px", left: "20px", right: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      backgroundColor: "var(--muted)",
                      color: "var(--foreground)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      textTransform: "uppercase"
                    }}
                  >
                    {current.type}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 800,
                      backgroundColor: "rgba(168, 85, 247, 0.2)",
                      color: "#c084fc",
                      padding: "2px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    {current.level}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkWord(current);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: savedNotes[`${currentDeck.slug}_${current.word}`] ? "#f59e0b" : "var(--muted-foreground)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                      fontWeight: 700
                    }}
                    title="Lưu vào Sổ tay ghi chú SQLite"
                  >
                    <Bookmark size={15} fill={savedNotes[`${currentDeck.slug}_${current.word}`] ? "#f59e0b" : "none"} />
                    <span>Lưu Sổ Tay</span>
                  </button>

                  <span style={{ fontSize: "12px", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <RotateCw size={13} /> Nhấp để lật
                  </span>
                </div>
              </div>

              {!isFlipped ? (
                /* Card Front - Sinh động với hình ảnh minh hoạ */
                <div style={{ maxWidth: "640px", width: "100%" }}>
                  {/* Visual Illustration Panel - Vivid AI Images */}
                  {(() => {
                    const visual = getWordVisual(current.word);
                    // Generate vivid, beautiful images for the word using free AI
                    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(`A clear literal visual representation of the concept of '${current.word}', vector art style, minimalist illustration, no text, no letters, no words, colorful, vivid, educational`)}?width=400&height=400&nologo=true`;
                    
                    return (
                      <div
                        style={{
                          margin: "0 auto 20px",
                          width: "160px",
                          height: "160px",
                          borderRadius: "24px",
                          backgroundColor: "var(--card)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "3px solid rgba(74, 222, 128, 0.4)", // Light green border
                          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                          overflow: "hidden",
                          flexShrink: 0,
                          position: "relative"
                        }}
                      >
                        <img 
                          src={imgUrl} 
                          alt={current.word}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span style="font-size: 56px">${visual ? visual.emoji : "✨"}</span>`;
                          }}
                        />
                        {visual && (
                          <div style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: "rgba(0,0,0,0.6)",
                            padding: "4px",
                            backdropFilter: "blur(4px)"
                          }}>
                            <span style={{ fontSize: "11px", color: "#fff", fontWeight: 700, textAlign: "center", display: "block" }}>
                              {visual.label}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <h2
                    style={{
                      fontSize: "44px",
                      fontWeight: 900,
                      color: "var(--foreground)",
                      marginBottom: "8px",
                      letterSpacing: "-0.5px"
                    }}
                  >
                    {current.word}
                  </h2>

                  {/* Ẩn đi từ trong ví dụ - cách học cloze của Sorata */}
                  {current.example && (
                    <div style={{
                      backgroundColor: "var(--muted)",
                      borderRadius: "12px",
                      padding: "10px 16px",
                      marginBottom: "12px",
                      fontSize: "14px",
                      color: "var(--muted-foreground)",
                      fontStyle: "italic",
                      lineHeight: 1.5
                    }}>
                      Định nghĩa Tiếng Anh:
                      <div style={{ color: "var(--foreground)", fontStyle: "normal", fontWeight: 600, marginTop: "4px", fontSize: "13px" }}>
                        {/* Mask the word in example */}
                        {current.example.split(/\b/g).map((part, i) =>
                          part.toLowerCase() === current.word.toLowerCase()
                            ? <span key={i} style={{ color: "#a855f7", backgroundColor: "rgba(168,85,247,0.15)", borderRadius: "4px", padding: "1px 6px" }}>{'*'.repeat(part.length)}</span>
                            : <span key={i}>{part}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "16px", color: "var(--muted-foreground)", fontWeight: 600 }}>
                      {current.ipa}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(current.word);
                      }}
                      className="btn-ghost"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(168, 85, 247, 0.2)",
                        border: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#c084fc"
                      }}
                      title="Phát âm tiếng Anh chuẩn"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>

                  {/* Gợi ý - nút Gợi Ý giống Sorata */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    {current.collocations && (
                      <div style={{ display: "inline-block", backgroundColor: "var(--muted)", padding: "5px 12px", borderRadius: "8px", fontSize: "12px", color: "#38bdf8", fontWeight: 700 }}>
                        🔗 {current.collocations.split(",")[0]?.trim()}...
                      </div>
                    )}
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      backgroundColor: "rgba(168,85,247,0.15)",
                      border: "1px solid rgba(168,85,247,0.4)",
                      padding: "5px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#c084fc",
                      fontWeight: 700
                    }}>
                      🔎 Nhập từ tiếng Anh...
                    </div>
                  </div>
                </div>
              ) : (
                /* Card Back */
                <div style={{ maxWidth: "620px", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid var(--border)", paddingBottom: "10px" }}>
                    <h3 style={{ fontSize: "24px", fontWeight: 900, color: "var(--success)" }}>
                      {current.meaning}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(current.word);
                      }}
                      className="btn-ghost"
                      style={{ color: "#c084fc", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 700 }}
                    >
                      <Volume2 size={16} /> Nghe lại
                    </button>
                  </div>

                  {/* Context sentence */}
                  <div style={{ backgroundColor: "var(--muted)", padding: "14px 18px", borderRadius: "14px", borderLeft: "4px solid #a855f7", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#c084fc", textTransform: "uppercase" }}>Ví dụ ngữ cảnh:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(current.example);
                        }}
                        style={{ background: "none", border: "none", color: "#38bdf8", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}
                      >
                        Nghe câu ví dụ
                      </button>
                    </div>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", marginBottom: "4px" }}>
                      "{current.example}"
                    </p>
                    {current.example_vi && (
                      <p style={{ fontSize: "13px", color: "var(--muted-foreground)", fontStyle: "italic" }}>
                        → {current.example_vi}
                      </p>
                    )}
                  </div>

                  {/* Extra linguistics info: Collocations & Synonyms */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                    {current.collocations && (
                      <div style={{ backgroundColor: "rgba(56, 189, 248, 0.1)", padding: "10px", borderRadius: "10px" }}>
                        <span style={{ fontWeight: 800, color: "#38bdf8", display: "block", marginBottom: "2px" }}>Collocations:</span>
                        <span style={{ color: "var(--foreground)" }}>{current.collocations}</span>
                      </div>
                    )}
                    {current.synonyms && (
                      <div style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", padding: "10px", borderRadius: "10px" }}>
                        <span style={{ fontWeight: 800, color: "#f59e0b", display: "block", marginBottom: "2px" }}>Từ đồng nghĩa:</span>
                        <span style={{ color: "var(--foreground)" }}>{current.synonyms}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SRS 4-Level Grading Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
            <button
              onClick={() => handleGrade("again")}
              className="btn-duo"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                border: "1px solid #ef4444",
                padding: "12px",
                flexDirection: "column",
                gap: "2px"
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 800 }}>Chưa thuộc (Học lại)</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>Lặp lại &lt; 1 ngày</span>
            </button>

            <button
              onClick={() => handleGrade("hard")}
              className="btn-duo"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
                border: "1px solid #f59e0b",
                padding: "12px",
                flexDirection: "column",
                gap: "2px"
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 800 }}>Hơi khó</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>Lặp lại sau 2 ngày</span>
            </button>

            <button
              onClick={() => handleGrade("good")}
              className="btn-duo"
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                color: "#60a5fa",
                border: "1px solid #3b82f6",
                padding: "12px",
                flexDirection: "column",
                gap: "2px"
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 800 }}>Khá tốt</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>Lặp lại sau 4 ngày</span>
            </button>

            <button
              onClick={() => handleGrade("easy")}
              className="btn-duo"
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                color: "#4ade80",
                border: "1px solid #22c55e",
                padding: "12px",
                flexDirection: "column",
                gap: "2px"
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 800 }}>Thành thạo (Dễ)</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>Lặp lại sau 7 ngày</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: MULTIPLE CHOICE SPEED QUIZ                       */}
      {/* ========================================================= */}
      {activeTab === "quiz" && (
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "20px",
            padding: "30px"
          }}
        >
          {!quizFinished ? (
            <div>
              {/* Quiz Header & Streak */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--primary)" }}>
                    Câu {quizIdx + 1} / {words.length}
                  </span>
                  {quizStreak > 1 && (
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#ea580c", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Flame size={14} /> Chuỗi đúng: {quizStreak}🔥
                    </span>
                  )}
                </div>

                <div style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
                  Điểm số: <strong style={{ color: "var(--success)" }}>{quizScore}</strong> đúng
                </div>
              </div>

              {/* Quiz Question Prompt */}
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <span style={{ fontSize: "12px", color: "var(--muted-foreground)", textTransform: "uppercase", fontWeight: 700 }}>
                  Chọn nghĩa tiếng Việt chính xác của từ:
                </span>
                <h3 style={{ fontSize: "38px", fontWeight: 900, color: "var(--foreground)", margin: "10px 0 6px 0" }}>
                  {currentQuizWord?.word}
                </h3>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={{ fontSize: "16px", color: "var(--muted-foreground)" }}>
                    {currentQuizWord?.ipa}
                  </span>
                  <button
                    onClick={() => speak(currentQuizWord?.word)}
                    className="btn-ghost"
                    style={{ color: "#c084fc", cursor: "pointer" }}
                  >
                    <Volume2 size={18} />
                  </button>
                </div>
              </div>

              {/* 4 Options Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                {quizOptions.map((opt, oIdx) => {
                  const letter = ["A", "B", "C", "D"][oIdx];
                  const isSelected = selectedQuizOption === opt;
                  let bg = "var(--muted)";
                  let border = "1px solid var(--border)";
                  let textColor = "var(--foreground)";

                  if (isQuizAnswered) {
                    if (opt.isCorrect) {
                      bg = "rgba(34, 197, 94, 0.2)";
                      border = "2px solid #22c55e";
                      textColor = "#4ade80";
                    } else if (isSelected && !opt.isCorrect) {
                      bg = "rgba(239, 68, 68, 0.2)";
                      border = "2px solid #ef4444";
                      textColor = "#f87171";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectQuizOption(opt)}
                      disabled={isQuizAnswered}
                      style={{
                        padding: "16px 20px",
                        borderRadius: "14px",
                        backgroundColor: bg,
                        border: border,
                        color: textColor,
                        fontSize: "14px",
                        fontWeight: 700,
                        textAlign: "left",
                        cursor: isQuizAnswered ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <span style={{ fontWeight: 900, color: "var(--muted-foreground)", width: "20px" }}>
                        {letter}.
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Next Button after answering */}
              {isQuizAnswered && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleNextQuiz}
                    className="btn-duo btn-primary"
                    style={{ padding: "12px 24px", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>{quizIdx + 1 < words.length ? "Câu tiếp theo" : "Xem tổng kết"}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Quiz Results Card */
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Sparkles size={56} color="#a855f7" style={{ margin: "0 auto 16px auto" }} />
              <h3 style={{ fontSize: "24px", fontWeight: 800, color: "var(--foreground)", marginBottom: "8px" }}>
                Hoàn Thành Bài Trắc Nghiệm!
              </h3>
              <p style={{ fontSize: "16px", color: "var(--muted-foreground)", marginBottom: "20px" }}>
                Bạn đã trả lời đúng: <strong style={{ color: "var(--success)" }}>{quizScore} / {words.length}</strong> từ vựng
              </p>
              <div style={{ display: "inline-block", backgroundColor: "rgba(168, 85, 247, 0.15)", border: "2px solid #a855f7", padding: "16px 36px", borderRadius: "16px", marginBottom: "24px" }}>
                <span style={{ fontSize: "13px", color: "#c084fc", fontWeight: 700 }}>Độ chính xác phản xạ</span>
                <h4 style={{ fontSize: "36px", fontWeight: 900, color: "#c084fc" }}>
                  {Math.round((quizScore / words.length) * 100)}%
                </h4>
              </div>
              <div>
                <button
                  onClick={restartQuiz}
                  className="btn-duo btn-primary"
                  style={{ padding: "12px 24px" }}
                >
                  <RotateCcw size={15} style={{ marginRight: "6px" }} /> Làm Lại Trắc Nghiệm
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 3: LISTENING & SPELLING TEST                        */}
      {/* ========================================================= */}
      {activeTab === "spelling" && (
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "2px solid var(--border)",
            borderRadius: "20px",
            padding: "36px 28px",
            textAlign: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--primary)" }}>
              Từ {spellingIdx + 1} / {words.length}
            </span>
            <span style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
              Đúng: <strong style={{ color: "var(--success)" }}>{spellingScore}</strong> từ
            </span>
          </div>

          <p style={{ fontSize: "14px", color: "var(--muted-foreground)", marginBottom: "20px" }}>
            Lắng nghe phát âm và gõ chính xác các chữ cái của từ tiếng Anh:
          </p>

          {/* Large Audio speaker button */}
          <button
            onClick={() => speak(currentSpellingWord.word)}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "rgba(168, 85, 247, 0.2)",
              border: "2px solid #a855f7",
              color: "#c084fc",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              marginBottom: "24px",
              boxShadow: "0 0 25px rgba(168, 85, 247, 0.3)"
            }}
            title="Nghe lại phát âm"
          >
            <Volume2 size={36} />
          </button>

          {/* Vietnamese hint */}
          <p style={{ fontSize: "18px", fontWeight: 800, color: "var(--foreground)", marginBottom: "24px" }}>
            Gợi ý nghĩa: <span style={{ color: "#38bdf8" }}>{currentSpellingWord.meaning}</span>
          </p>

          {/* Input form */}
          <form onSubmit={handleCheckSpelling} style={{ display: "flex", justifyContent: "center", gap: "10px", maxWidth: "480px", margin: "0 auto 20px auto" }}>
            <input
              type="text"
              value={spellingInput}
              onChange={(e) => setSpellingInput(e.target.value)}
              placeholder="Nhập từ tiếng Anh bạn nghe được..."
              autoFocus
              disabled={spellingResult !== null}
              style={{
                flex: 1,
                padding: "12px 18px",
                borderRadius: "12px",
                backgroundColor: "var(--background)",
                border: spellingResult === "correct"
                  ? "2px solid #22c55e"
                  : spellingResult === "wrong"
                  ? "2px solid #ef4444"
                  : "1px solid var(--border)",
                color: "var(--foreground)",
                fontSize: "16px",
                fontWeight: 800,
                outline: "none"
              }}
            />
            {spellingResult === null ? (
              <button
                type="submit"
                className="btn-duo btn-primary"
                style={{ padding: "12px 24px", fontWeight: 800 }}
              >
                Kiểm Tra
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextSpelling}
                className="btn-duo btn-success"
                style={{ padding: "12px 24px", fontWeight: 800 }}
              >
                Tiếp Tục →
              </button>
            )}
          </form>

          {/* Feedback after checking */}
          {spellingResult === "correct" && (
            <div style={{ color: "#4ade80", fontWeight: 800, fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <CheckCircle2 size={20} /> Chính xác xuất sắc! ({currentSpellingWord.word} • {currentSpellingWord.ipa})
            </div>
          )}

          {spellingResult === "wrong" && (
            <div style={{ color: "#f87171", fontWeight: 800, fontSize: "15px" }}>
              Chưa chính xác! Đáp án đúng là: <strong style={{ color: "#4ade80", fontSize: "18px" }}>{currentSpellingWord.word}</strong> ({currentSpellingWord.ipa})
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 4: FULL WORD LIST EXPLORER (DICTIONARY VIEW)       */}
      {/* ========================================================= */}
      {activeTab === "list" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* List Search & Filters & Pagination Counter */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "8px 14px",
                width: "300px"
              }}
            >
              <Search size={15} color="var(--muted-foreground)" />
              <input
                type="text"
                value={listSearch}
                onChange={(e) => {
                  setListSearch(e.target.value);
                  setListPage(1);
                }}
                placeholder="Tra cứu từ vựng hoặc nghĩa..."
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--foreground)",
                  fontSize: "13px",
                  width: "100%"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              {["all", "noun", "verb", "adj"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setListTypeFilter(t);
                    setListPage(1);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: listTypeFilter === t ? "2px solid #a855f7" : "1px solid var(--border)",
                    backgroundColor: listTypeFilter === t ? "rgba(168, 85, 247, 0.2)" : "var(--card)",
                    color: listTypeFilter === t ? "#c084fc" : "var(--muted-foreground)",
                    cursor: "pointer"
                  }}
                >
                  {t === "all" ? "Tất cả từ loại" : t}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid of words with pagination */}
          {(() => {
            const filteredWords = words.filter((w) => {
              const matchSearch =
                w.word.toLowerCase().includes(listSearch.toLowerCase()) ||
                w.meaning.toLowerCase().includes(listSearch.toLowerCase());
              const matchType = listTypeFilter === "all" || w.type.toLowerCase().includes(listTypeFilter);
              return matchSearch && matchType;
            });

            const totalPages = Math.ceil(filteredWords.length / LIST_PAGE_SIZE) || 1;
            const currentFilteredWords = filteredWords.slice(
              (listPage - 1) * LIST_PAGE_SIZE,
              listPage * LIST_PAGE_SIZE
            );

            return (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "13px", color: "var(--muted-foreground)", padding: "0 4px" }}>
                  <span>
                    Hiển thị <strong>{currentFilteredWords.length}</strong> / <strong>{filteredWords.length}</strong> từ vựng (Trang {listPage}/{totalPages})
                  </span>
                  {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => setListPage((p) => Math.max(1, p - 1))}
                        disabled={listPage === 1}
                        className="btn-ghost"
                        style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", opacity: listPage === 1 ? 0.4 : 1, cursor: listPage === 1 ? "default" : "pointer" }}
                      >
                        ← Trang trước
                      </button>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground)" }}>
                        {listPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setListPage((p) => Math.min(totalPages, p + 1))}
                        disabled={listPage === totalPages}
                        className="btn-ghost"
                        style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "12px", opacity: listPage === totalPages ? 0.4 : 1, cursor: listPage === totalPages ? "default" : "pointer" }}
                      >
                        Trang sau →
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px" }}>
                  {currentFilteredWords.map((w, idx) => {
                    const isMastered = deckProgress[`${currentDeck.slug}_${w.word}`] === "easy";
                    const isSaved = savedNotes[`${currentDeck.slug}_${w.word}`];

                    return (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: "var(--card)",
                          border: isMastered ? "2px solid #22c55e" : "1px solid var(--border)",
                          borderRadius: "16px",
                          padding: "18px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: "12px",
                          position: "relative"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "var(--muted)", color: "var(--foreground)", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" }}>
                                {w.type}
                              </span>
                              <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: "rgba(168, 85, 247, 0.15)", color: "#c084fc", padding: "2px 6px", borderRadius: "4px" }}>
                                {w.level}
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <button
                                onClick={() => handleBookmarkWord(w)}
                                style={{ background: "none", border: "none", color: isSaved ? "#f59e0b" : "var(--muted-foreground)", cursor: "pointer" }}
                                title="Lưu vào Sổ tay SQLite"
                              >
                                <Bookmark size={16} fill={isSaved ? "#f59e0b" : "none"} />
                              </button>
                              <button
                                onClick={() => speak(w.word)}
                                className="btn-ghost"
                                style={{ color: "var(--primary)", cursor: "pointer", padding: "2px" }}
                                title="Phát âm"
                              >
                                <Volume2 size={16} />
                              </button>
                            </div>
                          </div>

                          <h4 style={{ fontSize: "18px", fontWeight: 800, color: "var(--foreground)", marginBottom: "2px" }}>
                            {w.word}
                          </h4>
                          <span style={{ fontSize: "13px", color: "var(--muted-foreground)", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                            {w.ipa}
                          </span>

                          <p style={{ fontSize: "14px", fontWeight: 800, color: "var(--success)", marginBottom: "8px" }}>
                            {w.meaning}
                          </p>

                          <div style={{ backgroundColor: "var(--muted)", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", color: "var(--foreground)", borderLeft: "2px solid #a855f7" }}>
                            <p style={{ fontWeight: 600, marginBottom: "2px" }}>"{w.example}"</p>
                            {w.example_vi && <p style={{ color: "var(--muted-foreground)", fontStyle: "italic" }}>→ {w.example_vi}</p>}
                          </div>
                        </div>

                        {w.collocations && (
                          <div style={{ fontSize: "11px", color: "#38bdf8", fontWeight: 700 }}>
                            🔗 {w.collocations}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "20px" }}>
                    <button
                      onClick={() => setListPage(1)}
                      disabled={listPage === 1}
                      className="btn-ghost"
                      style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", opacity: listPage === 1 ? 0.4 : 1, cursor: listPage === 1 ? "default" : "pointer" }}
                    >
                      « Đầu
                    </button>
                    <button
                      onClick={() => setListPage((p) => Math.max(1, p - 1))}
                      disabled={listPage === 1}
                      className="btn-ghost"
                      style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", opacity: listPage === 1 ? 0.4 : 1, cursor: listPage === 1 ? "default" : "pointer" }}
                    >
                      ‹ Trang trước
                    </button>
                    <span style={{ padding: "6px 16px", borderRadius: "8px", backgroundColor: "rgba(168, 85, 247, 0.2)", color: "#c084fc", fontWeight: 800, fontSize: "13px" }}>
                      Trang {listPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setListPage((p) => Math.min(totalPages, p + 1))}
                      disabled={listPage === totalPages}
                      className="btn-ghost"
                      style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", opacity: listPage === totalPages ? 0.4 : 1, cursor: listPage === totalPages ? "default" : "pointer" }}
                    >
                      Trang sau ›
                    </button>
                    <button
                      onClick={() => setListPage(totalPages)}
                      disabled={listPage === totalPages}
                      className="btn-ghost"
                      style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", opacity: listPage === totalPages ? 0.4 : 1, cursor: listPage === totalPages ? "default" : "pointer" }}
                    >
                      Cuối »
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
