import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Volume2,
  RotateCcw,
  ArrowRight,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Square,
  Activity,
  ChevronLeft,
  ChevronRight,
  Filter,
  Star,
  Play,
  Shuffle
} from "lucide-react";
import { sounds } from "../utils/audioEffects";
import { playGoogleSpeech } from "../utils/pronunciationAudio";

// =====================================================================
// 100+ Curated Shadowing Sentences Categorized by Topic
// =====================================================================
const SHADOWING_CATEGORIES = [
  {
    id: "all",
    label: "Tất cả",
    icon: "🌐",
    color: "#a855f7"
  },
  {
    id: "daily",
    label: "Giao tiếp hàng ngày",
    icon: "☀️",
    color: "#f59e0b"
  },
  {
    id: "business",
    label: "Tiếng Anh thương mại",
    icon: "💼",
    color: "#3b82f6"
  },
  {
    id: "ielts",
    label: "IELTS / Academic",
    icon: "🎓",
    color: "#10b981"
  },
  {
    id: "movies",
    label: "Movie Clips",
    icon: "🎬",
    color: "#ef4444"
  },
  {
    id: "ted",
    label: "TED Talks",
    icon: "🎤",
    color: "#8b5cf6"
  },
  {
    id: "pronunciation",
    label: "Luyện phát âm",
    icon: "🗣️",
    color: "#06b6d4"
  },
  {
    id: "kids",
    label: "Người mới bắt đầu",
    icon: "🌱",
    color: "#22c55e"
  }
];

const ALL_SENTENCES = [
  // ── Daily Life (25 sentences) ──────────────────────────────────────
  { id: 1, cat: "daily", level: "B1", text: "Mornings are tough, but with a plan, you can win the day.", ipa: "/ˈmɔː.nɪŋz ɑː tʌf, bʌt wɪð ə plæn, juː kæn wɪn ðə deɪ/", vi: "Buổi sáng thật khó khăn, nhưng với một kế hoạch, bạn có thể chiến thắng cả ngày." },
  { id: 2, cat: "daily", level: "A2", text: "Get sunlight in your eyes first thing in the morning.", ipa: "/ɡɛt ˈsʌn.laɪt ɪn jɔːr aɪz fɜːst θɪŋ ɪn ðə ˈmɔː.nɪŋ/", vi: "Hãy đón nhận ánh sáng mặt trời vào mắt ngay việc đầu tiên vào buổi sáng." },
  { id: 3, cat: "daily", level: "A2", text: "Once you're out of bed, have a big glass of water.", ipa: "/wʌns jɔːr aʊt ɒv bɛd, hæv ə bɪɡ ɡlɑːs ɒv ˈwɔː.tər/", vi: "Một khi đã ra khỏi giường, hãy uống một ly nước lớn." },
  { id: 4, cat: "daily", level: "B1", text: "Wake up with the mentality of a champion, not a quitter.", ipa: "/weɪk ʌp wɪð ðə mɛnˈtæl.ə.ti ɒv ə ˈtʃæm.piən, nɒt ə ˈkwɪt.ər/", vi: "Thức dậy với tâm lý của một nhà vô địch, không phải kẻ bỏ cuộc." },
  { id: 5, cat: "daily", level: "A2", text: "I usually have breakfast before I go to work.", ipa: "/aɪ ˈjuː.ʒu.ə.li hæv ˈbrek.fəst bɪˈfɔːr aɪ ɡəʊ tə wɜːk/", vi: "Tôi thường ăn sáng trước khi đi làm." },
  { id: 6, cat: "daily", level: "A2", text: "Could you tell me where the nearest pharmacy is?", ipa: "/kʊd juː tɛl miː wɛər ðə ˈnɪər.ɪst ˈfɑː.mə.si ɪz/", vi: "Bạn có thể cho tôi biết hiệu thuốc gần nhất ở đâu không?" },
  { id: 7, cat: "daily", level: "B1", text: "I really appreciate everything you've done to help me.", ipa: "/aɪ ˈrɪəl.i əˈpriː.ʃi.eɪt ˈev.ri.θɪŋ juːv dʌn tə hɛlp miː/", vi: "Tôi thực sự biết ơn tất cả những gì bạn đã làm để giúp tôi." },
  { id: 8, cat: "daily", level: "B1", text: "It's not about how fast you go, it's about keeping going.", ipa: "/ɪts nɒt əˈbaʊt haʊ fɑːst juː ɡəʊ, ɪts əˈbaʊt ˈkiːp.ɪŋ ˈɡəʊ.ɪŋ/", vi: "Không phải về việc bạn đi nhanh thế nào, mà là về việc không ngừng tiến bước." },
  { id: 9, cat: "daily", level: "A2", text: "Excuse me, I think I left my bag at the front desk.", ipa: "/ɪkˈskjuːz miː, aɪ θɪŋk aɪ lɛft maɪ bæɡ ət ðə frʌnt dɛsk/", vi: "Xin lỗi, tôi nghĩ tôi đã để quên túi ở quầy lễ tân." },
  { id: 10, cat: "daily", level: "B1", text: "Would you mind if I joined you for lunch today?", ipa: "/wʊd juː maɪnd ɪf aɪ dʒɔɪnd juː fɔːr lʌntʃ təˈdeɪ/", vi: "Bạn có phiền không nếu tôi cùng ăn trưa với bạn hôm nay?" },
  { id: 11, cat: "daily", level: "B1", text: "I'm sorry I'm late. The traffic was terrible this morning.", ipa: "/aɪm ˈsɒr.i aɪm leɪt. ðə ˈtræf.ɪk wɒz ˈtɛr.ɪ.bəl ðɪs ˈmɔː.nɪŋ/", vi: "Tôi xin lỗi vì đến muộn. Giao thông sáng nay rất kinh khủng." },
  { id: 12, cat: "daily", level: "A2", text: "Let's catch up over coffee sometime this week.", ipa: "/lɛts kætʃ ʌp ˈəʊ.vər ˈkɒf.i ˈsʌm.taɪm ðɪs wiːk/", vi: "Hãy gặp nhau uống cà phê vào lúc nào đó trong tuần này nhé." },
  { id: 13, cat: "daily", level: "B1", text: "I've been meaning to call you but things have been so busy.", ipa: "/aɪv bɪn ˈmiː.nɪŋ tə kɔːl juː bʌt θɪŋz hæv bɪn səʊ ˈbɪz.i/", vi: "Tôi đã định gọi cho bạn nhưng mọi thứ quá bận rộn." },
  { id: 14, cat: "daily", level: "A2", text: "Don't forget to lock the door when you leave the house.", ipa: "/dəʊnt fəˈɡɛt tə lɒk ðə dɔːr wɛn juː liːv ðə haʊs/", vi: "Đừng quên khóa cửa khi bạn rời khỏi nhà." },
  { id: 15, cat: "daily", level: "B2", text: "There's a fine line between being confident and being arrogant.", ipa: "/ðɛrz ə faɪn laɪn bɪˈtwiːn ˈbiː.ɪŋ ˈkɒn.fɪ.dənt ænd ˈbiː.ɪŋ ˈær.ə.ɡənt/", vi: "Có một ranh giới mỏng giữa sự tự tin và sự ngạo mạn." },
  { id: 16, cat: "daily", level: "B1", text: "If you want to improve your English, practice every single day.", ipa: "/ɪf juː wɒnt tə ɪmˈpruːv jɔːr ˈɪŋ.ɡlɪʃ, ˈpræk.tɪs ˈev.ri ˈsɪŋ.ɡəl deɪ/", vi: "Nếu bạn muốn cải thiện tiếng Anh, hãy luyện tập mỗi ngày." },
  { id: 17, cat: "daily", level: "A2", text: "What time does the next train to the city center depart?", ipa: "/wɒt taɪm dʌz ðə nɛkst treɪn tə ðə ˈsɪt.i ˈsɛn.tər dɪˈpɑːt/", vi: "Chuyến tàu tiếp theo đến trung tâm thành phố khởi hành lúc mấy giờ?" },
  { id: 18, cat: "daily", level: "B1", text: "Small, consistent efforts lead to extraordinary results over time.", ipa: "/smɔːl, kənˈsɪs.tənt ˈɛf.ərts liːd tə ɪkˌstrɔːr.dɪ.nər.i rɪˈzʌlts ˈəʊ.vər taɪm/", vi: "Những nỗ lực nhỏ nhất quán dẫn đến kết quả phi thường theo thời gian." },
  { id: 19, cat: "daily", level: "B1", text: "Clear pronunciation opens the door to effective communication.", ipa: "/klɪər prəˌnʌn.siˈeɪ.ʃən ˈəʊ.pənz ðə dɔːr tuː ɪˈfɛk.tɪv kəˌmjuː.nɪˈkeɪ.ʃən/", vi: "Phát âm rõ ràng mở ra cánh cửa dẫn đến giao tiếp hiệu quả." },
  { id: 20, cat: "daily", level: "A2", text: "Can I have the bill, please? We'd like to pay separately.", ipa: "/kæn aɪ hæv ðə bɪl, pliːz? wiːd laɪk tə peɪ ˈsɛp.ər.ɪt.li/", vi: "Làm ơn cho tôi tính tiền được không? Chúng tôi muốn thanh toán riêng." },
  { id: 21, cat: "daily", level: "B1", text: "Practice makes perfect when you listen and repeat consistently.", ipa: "/ˈpræk.tɪs meɪks ˈpɜː.fɪkt wɛn juː ˈlɪs.ən ænd rɪˈpiːt kənˈsɪs.tənt.li/", vi: "Luyện tập tạo nên sự hoàn hảo khi bạn kiên trì lắng nghe và nhại lại." },
  { id: 22, cat: "daily", level: "B1", text: "Do you happen to know if there's a gym nearby?", ipa: "/duː juː ˈhæp.ən tə nəʊ ɪf ðɛrz ə dʒɪm ˈnɪər.baɪ/", vi: "Bạn có biết gần đây có phòng tập thể dục không?" },
  { id: 23, cat: "daily", level: "B1", text: "You should really give this podcast a listen. It's amazing!", ipa: "/juː ʃʊd ˈrɪəl.i ɡɪv ðɪs ˈpɒd.kɑːst ə ˈlɪs.ən. ɪts əˈmeɪ.zɪŋ/", vi: "Bạn thực sự nên nghe thử podcast này. Nó thật tuyệt vời!" },
  { id: 24, cat: "daily", level: "A2", text: "I'll meet you at the coffee shop at half past seven.", ipa: "/aɪl miːt juː æt ðə ˈkɒf.i ʃɒp æt hɑːf pɑːst ˈsev.ən/", vi: "Tôi sẽ gặp bạn tại quán cà phê lúc bảy rưỡi." },
  { id: 25, cat: "daily", level: "B2", text: "It's easier said than done, but nothing worth having comes easy.", ipa: "/ɪts ˈiː.zi.ər sɛd ðæn dʌn, bʌt ˈnʌθ.ɪŋ wɜːθ ˈhæv.ɪŋ kʌmz ˈiː.zi/", vi: "Nói dễ hơn làm, nhưng không có gì đáng để có mà lại dễ dàng." },

  // ── Business English (20 sentences) ──────────────────────────────────
  { id: 26, cat: "business", level: "B2", text: "We need to align our strategies before the board meeting next week.", ipa: "/wiː niːd tə əˈlaɪn aʊər ˈstræt.ɪ.dʒiz bɪˈfɔːr ðə bɔːrd ˈmiː.tɪŋ nɛkst wiːk/", vi: "Chúng ta cần điều chỉnh chiến lược trước cuộc họp hội đồng quản trị tuần sau." },
  { id: 27, cat: "business", level: "B2", text: "Let's circle back to this agenda item at the end of the meeting.", ipa: "/lɛts ˈsɜː.kəl bæk tə ðɪs əˈdʒɛn.də ˈaɪ.təm æt ðə ɛnd ɒv ðə ˈmiː.tɪŋ/", vi: "Hãy quay lại điểm này trong chương trình nghị sự vào cuối cuộc họp." },
  { id: 28, cat: "business", level: "C1", text: "The quarterly revenue exceeded projections by fifteen percent.", ipa: "/ðə ˈkwɔːt.ər.li ˈrev.ə.njuː ɪkˈsiːdɪd prəˈdʒɛk.ʃənz baɪ ˌfɪf.tiːn pəˈsɛnt/", vi: "Doanh thu quý này vượt dự báo 15 phần trăm." },
  { id: 29, cat: "business", level: "B2", text: "Could you walk me through the key deliverables for this project?", ipa: "/kʊd juː wɔːk miː θruː ðə kiː dɪˈlɪv.ər.ə.bəlz fɔːr ðɪs ˈprɒdʒ.ɪkt/", vi: "Bạn có thể dẫn tôi qua các kết quả bàn giao chính của dự án này không?" },
  { id: 30, cat: "business", level: "C1", text: "We'd like to propose a strategic partnership that benefits both parties.", ipa: "/wiːd laɪk tə prəˈpəʊz ə strəˈtiː.dʒɪk ˈpɑːt.nər.ʃɪp ðæt ˈbɛn.ɪ.fɪts bəʊθ ˈpɑː.tiz/", vi: "Chúng tôi muốn đề xuất một quan hệ đối tác chiến lược có lợi cho cả hai bên." },
  { id: 31, cat: "business", level: "B2", text: "The deadline has been pushed back to the fifteenth of next month.", ipa: "/ðə ˈdɛd.laɪn hæz bɪn pʊʃt bæk tə ðə ˌfɪf.tiːnθ ɒv nɛkst mʌnθ/", vi: "Thời hạn đã được lùi sang ngày 15 của tháng sau." },
  { id: 32, cat: "business", level: "B2", text: "Our goal is to increase market share in Southeast Asia by twenty percent.", ipa: "/aʊər ɡəʊl ɪz tə ɪnˈkriːs ˈmɑː.kɪt ʃɛər ɪn ˌsaʊθˈiːst ˈeɪ.ʒə baɪ ˈtwɛnt.i pəˈsɛnt/", vi: "Mục tiêu của chúng tôi là tăng thị phần tại Đông Nam Á lên 20 phần trăm." },
  { id: 33, cat: "business", level: "B1", text: "I'd like to schedule a call this Thursday if that works for you.", ipa: "/aɪd laɪk tə ˈskɛdʒ.uːl ə kɔːl ðɪs ˈθɜːz.deɪ ɪf ðæt wɜːks fɔːr juː/", vi: "Tôi muốn sắp xếp một cuộc gọi vào thứ Năm này nếu bạn có thể." },
  { id: 34, cat: "business", level: "B2", text: "Could you please provide an executive summary by end of business?", ipa: "/kʊd juː pliːz prəˈvaɪd ən ɪɡˈzɛk.jʊ.tɪv ˈsʌm.ər.i baɪ ɛnd ɒv ˈbɪz.nɪs/", vi: "Bạn có thể cung cấp bản tóm tắt điều hành trước khi hết giờ làm việc không?" },
  { id: 35, cat: "business", level: "C1", text: "The venture capital firm is conducting due diligence on our startup.", ipa: "/ðə ˈvɛntʃ.ər ˈkæp.ɪ.təl fɜːm ɪz kənˈdʌkt.ɪŋ djuː ˈdɪl.ɪ.dʒəns ɒn aʊər ˈstɑː.tʌp/", vi: "Công ty đầu tư mạo hiểm đang thực hiện thẩm định doanh nghiệp trên công ty khởi nghiệp của chúng tôi." },
  { id: 36, cat: "business", level: "B1", text: "Let me get back to you with a more detailed proposal by tomorrow.", ipa: "/lɛt miː ɡɛt bæk tə juː wɪð ə mɔːr dɪˈteɪld prəˈpəʊ.zəl baɪ təˈmɒr.əʊ/", vi: "Để tôi phản hồi bạn với một đề xuất chi tiết hơn vào ngày mai." },
  { id: 37, cat: "business", level: "B2", text: "We should streamline our workflow to maximize operational efficiency.", ipa: "/wiː ʃʊd ˈstriːm.laɪn aʊər ˈwɜːk.fləʊ tə ˈmæk.sɪ.maɪz ˌɒp.ərˈeɪ.ʃən.əl ɪˈfɪʃ.ən.si/", vi: "Chúng ta nên tối ưu hóa quy trình làm việc để tối đa hóa hiệu quả vận hành." },
  { id: 38, cat: "business", level: "B2", text: "I think we need to pivot our approach given the current market conditions.", ipa: "/aɪ θɪŋk wiː niːd tə ˈpɪv.ət aʊər əˈprəʊtʃ ˈɡɪv.ən ðə ˈkɜːr.ənt ˈmɑː.kɪt kənˈdɪʃ.ənz/", vi: "Tôi nghĩ chúng ta cần thay đổi hướng tiếp cận dựa trên điều kiện thị trường hiện tại." },
  { id: 39, cat: "business", level: "C1", text: "The merger was finalized after months of intensive negotiations.", ipa: "/ðə ˈmɜːdʒ.ər wɒz ˈfaɪ.nəl.aɪzd ˈɑːf.tər mʌnθs ɒv ɪnˈtɛn.sɪv nɪˌɡəʊ.siˈeɪ.ʃənz/", vi: "Vụ sáp nhập được hoàn tất sau nhiều tháng đàm phán căng thẳng." },
  { id: 40, cat: "business", level: "B1", text: "Please make sure the contract is reviewed by our legal team first.", ipa: "/pliːz meɪk ʃʊər ðə ˈkɒn.trækt ɪz rɪˈvjuːd baɪ aʊər ˈliː.ɡəl tiːm fɜːst/", vi: "Hãy đảm bảo hợp đồng được nhóm pháp lý của chúng tôi xem xét trước." },
  { id: 41, cat: "business", level: "B2", text: "We've seen significant growth in our customer retention metrics this quarter.", ipa: "/wiːv siːn sɪɡˈnɪf.ɪ.kənt ɡrəʊθ ɪn aʊər ˈkʌs.tə.mər rɪˈtɛn.ʃən ˈmɛt.rɪks ðɪs ˈkwɔːt.ər/", vi: "Chúng tôi đã thấy tăng trưởng đáng kể trong các chỉ số giữ chân khách hàng trong quý này." },
  { id: 42, cat: "business", level: "B1", text: "I'll send you the meeting minutes by the end of the day.", ipa: "/aɪl sɛnd juː ðə ˈmiː.tɪŋ ˈmɪn.ɪts baɪ ðə ɛnd ɒv ðə deɪ/", vi: "Tôi sẽ gửi cho bạn biên bản cuộc họp trước cuối ngày." },
  { id: 43, cat: "business", level: "B2", text: "Could we set up a task force to handle this cross-departmental issue?", ipa: "/kʊd wiː sɛt ʌp ə tɑːsk fɔːrs tə ˈhæn.dəl ðɪs krɒs dɪˈpɑːt.mənt.əl ˈɪʃ.uː/", vi: "Chúng ta có thể thành lập một tổ chuyên trách để xử lý vấn đề liên phòng ban này không?" },
  { id: 44, cat: "business", level: "C1", text: "Sustainable business practices are no longer optional; they're a necessity.", ipa: "/səˈsteɪ.nə.bəl ˈbɪz.nɪs ˈpræk.tɪs.ɪz ɑːr nəʊ ˈlɒŋ.ər ˈɒp.ʃən.əl; ðeər ə nɪˈsɛs.ɪ.ti/", vi: "Thực hành kinh doanh bền vững không còn là tùy chọn nữa; chúng là điều cần thiết." },
  { id: 45, cat: "business", level: "B2", text: "Innovation drives our competitive advantage in this rapidly evolving sector.", ipa: "/ˌɪn.əˈveɪ.ʃən draɪvz aʊər kəmˈpɛt.ɪ.tɪv ədˈvɑːn.tɪdʒ ɪn ðɪs ˈræp.ɪd.li ɪˈvɒl.vɪŋ ˈsɛk.tər/", vi: "Đổi mới thúc đẩy lợi thế cạnh tranh của chúng tôi trong lĩnh vực phát triển nhanh chóng này." },

  // ── IELTS / Academic (15 sentences) ──────────────────────────────────
  { id: 46, cat: "ielts", level: "C1", text: "Climate change poses unprecedented challenges to global food security.", ipa: "/ˈklaɪ.mət tʃeɪndʒ pəʊzɪz ʌnˈprɛs.ɪ.dɛn.tɪd ˈtʃæl.ɪn.dʒɪz tə ˈɡləʊ.bəl fuːd sɪˈkjʊər.ɪ.ti/", vi: "Biến đổi khí hậu đặt ra những thách thức chưa từng có đối với an ninh lương thực toàn cầu." },
  { id: 47, cat: "ielts", level: "C1", text: "The proliferation of social media has fundamentally altered the way we communicate.", ipa: "/ðə prəˌlɪf.ərˈeɪ.ʃən ɒv ˈsəʊ.ʃəl ˈmiː.di.ə hæz ˌfʌn.dəˈmɛn.tə.li ˈɔːl.tərd ðə weɪ wiː kəˈmjuː.nɪ.keɪt/", vi: "Sự bùng nổ của mạng xã hội đã thay đổi căn bản cách chúng ta giao tiếp." },
  { id: 48, cat: "ielts", level: "B2", text: "Governments should invest more heavily in renewable energy infrastructure.", ipa: "/ˈɡʌv.ən.mənts ʃʊd ɪnˈvɛst mɔːr ˈhɛv.ɪ.li ɪn rɪˈnjuː.ə.bəl ˈɛn.ər.dʒi ˈɪn.frə.strʌk.tʃər/", vi: "Các chính phủ nên đầu tư nhiều hơn vào cơ sở hạ tầng năng lượng tái tạo." },
  { id: 49, cat: "ielts", level: "C1", text: "Urbanization has both positive and negative consequences for sustainable development.", ipa: "/ˌɜː.bə.naɪˈzeɪ.ʃən hæz bəʊθ ˈpɒz.ɪ.tɪv ænd ˈnɛɡ.ə.tɪv ˈkɒn.sɪ.kwən.sɪz fɔːr səˈsteɪ.nə.bəl dɪˈvɛl.əp.mənt/", vi: "Đô thị hóa có cả hậu quả tích cực lẫn tiêu cực đối với phát triển bền vững." },
  { id: 50, cat: "ielts", level: "B2", text: "The evidence suggests a strong correlation between education and economic growth.", ipa: "/ðɪ ˈɛv.ɪ.dəns səˈdʒɛsts ə strɒŋ ˌkɒr.əˈleɪ.ʃən bɪˈtwiːn ˌɛdʒ.uˈkeɪ.ʃən ænd ˌiː.kəˈnɒm.ɪk ɡrəʊθ/", vi: "Bằng chứng cho thấy mối tương quan mạnh mẽ giữa giáo dục và tăng trưởng kinh tế." },
  { id: 51, cat: "ielts", level: "C1", text: "Critics argue that globalization has exacerbated economic inequality worldwide.", ipa: "/ˈkrɪt.ɪks ˈɑː.ɡjuː ðæt ˌɡləʊ.bəl.aɪˈzeɪ.ʃən hæz ɪɡˈzæs.ər.beɪ.tɪd ˌiː.kəˈnɒm.ɪk ˌɪn.ɪˈkwɒl.ɪ.ti ˌwɜːld.waɪd/", vi: "Các nhà phê bình lập luận rằng toàn cầu hóa đã làm trầm trọng thêm sự bất bình đẳng kinh tế trên toàn thế giới." },
  { id: 52, cat: "ielts", level: "B2", text: "Technological advances have transformed the landscape of modern healthcare.", ipa: "/ˌtɛk.nəˈlɒdʒ.ɪ.kəl ədˈvɑːn.sɪz hæv trænsˈfɔːmd ðə ˈlænd.skeɪp ɒv ˈmɒd.ən ˈhɛlθˌkeər/", vi: "Những tiến bộ công nghệ đã chuyển đổi bối cảnh chăm sóc sức khỏe hiện đại." },
  { id: 53, cat: "ielts", level: "C1", text: "Proponents of nuclear energy claim that it offers a reliable low-carbon alternative.", ipa: "/prəˈpəʊ.nənts ɒv ˈnjuː.kliər ˈɛn.ər.dʒi kleɪm ðæt ɪt ˈɒf.ərz ə rɪˈlaɪ.ə.bəl ləʊ ˈkɑː.bən ɔːlˈtɜːr.nə.tɪv/", vi: "Những người ủng hộ năng lượng hạt nhân cho rằng nó cung cấp một sự thay thế ít carbon đáng tin cậy." },
  { id: 54, cat: "ielts", level: "B2", text: "Mental health services remain underfunded in many parts of the world.", ipa: "/ˈmɛn.tl hɛlθ ˈsɜː.vɪs.ɪz rɪˈmeɪn ˌʌn.dəˈfʌn.dɪd ɪn ˈmɛn.i pɑːts ɒv ðə wɜːld/", vi: "Các dịch vụ sức khỏe tâm thần vẫn chưa được tài trợ đầy đủ ở nhiều nơi trên thế giới." },
  { id: 55, cat: "ielts", level: "C1", text: "The disparity between the rich and poor continues to widen at an alarming rate.", ipa: "/ðə dɪˈspær.ɪ.ti bɪˈtwiːn ðə rɪtʃ ænd pɔːr kənˈtɪn.juːz tə ˈwaɪ.dən æt ən əˈlɑːm.ɪŋ reɪt/", vi: "Sự chênh lệch giữa người giàu và người nghèo tiếp tục mở rộng với tốc độ đáng báo động." },
  { id: 56, cat: "ielts", level: "B2", text: "Some scholars believe that artificial intelligence will redefine the job market.", ipa: "/sʌm ˈskɒl.ərz bɪˈliːv ðæt ˌɑː.tɪˈfɪʃ.əl ɪnˈtɛl.ɪ.dʒəns wɪl ˌriː.dɪˈfaɪn ðə dʒɒb ˈmɑː.kɪt/", vi: "Một số học giả tin rằng trí tuệ nhân tạo sẽ định nghĩa lại thị trường việc làm." },
  { id: 57, cat: "ielts", level: "C1", text: "Biodiversity loss is one of the most pressing environmental concerns of our time.", ipa: "/ˌbaɪ.əʊ.daɪˈvɜː.sɪ.ti lɒs ɪz wʌn ɒv ðə məʊst ˈprɛs.ɪŋ ɪnˈvaɪ.rən.mɛn.tl kənˈsɜːnz ɒv aʊər taɪm/", vi: "Mất đa dạng sinh học là một trong những vấn đề môi trường cấp bách nhất trong thời đại của chúng ta." },
  { id: 58, cat: "ielts", level: "B2", text: "Investment in education is the most effective long-term strategy for reducing poverty.", ipa: "/ɪnˈvɛst.mənt ɪn ˌɛdʒ.uˈkeɪ.ʃən ɪz ðə məʊst ɪˈfɛk.tɪv lɒŋ tɜːm ˈstræt.ɪ.dʒi fɔːr rɪˈdjuː.sɪŋ ˈpɒv.ər.ti/", vi: "Đầu tư vào giáo dục là chiến lược dài hạn hiệu quả nhất để giảm nghèo." },
  { id: 59, cat: "ielts", level: "C1", text: "The ethical implications of gene editing remain a topic of fierce academic debate.", ipa: "/ðɪ ˈɛθ.ɪ.kəl ˌɪm.plɪˈkeɪ.ʃənz ɒv dʒiːn ˈɛd.ɪ.tɪŋ rɪˈmeɪn ə ˈtɒp.ɪk ɒv fɪərs ˌæk.əˈdɛm.ɪk dɪˈbeɪt/", vi: "Những hàm ý đạo đức của chỉnh sửa gen vẫn là chủ đề tranh luận học thuật gay gắt." },
  { id: 60, cat: "ielts", level: "B2", text: "Urban green spaces are crucial for the physical and mental wellbeing of city residents.", ipa: "/ˈɜː.bən ɡriːn ˈspeɪs.ɪz ɑːr ˈkruː.ʃəl fɔːr ðə ˈfɪz.ɪ.kəl ænd ˈmɛn.tl ˈwɛl.biː.ɪŋ ɒv ˈsɪt.i ˈrɛz.ɪ.dənts/", vi: "Không gian xanh đô thị là yếu tố quan trọng cho sức khỏe thể chất và tinh thần của cư dân thành phố." },

  // ── Movie Clips (15 sentences) ─────────────────────────────────────
  { id: 61, cat: "movies", level: "B1", text: "I feel like I'm going in circles. I need a fresh start.", ipa: "/aɪ fiːl laɪk aɪm ˈɡəʊ.ɪŋ ɪn ˈsɜː.kəlz. aɪ niːd ə frɛʃ stɑːt/", vi: "Tôi cảm thấy như mình đang đi vòng vòng. Tôi cần một khởi đầu mới." },
  { id: 62, cat: "movies", level: "B1", text: "You had me at hello. I've never been the same since.", ipa: "/juː hæd miː æt həˈləʊ. aɪv ˈnɛv.ər bɪn ðə seɪm sɪns/", vi: "Bạn đã chinh phục tôi ngay lần đầu gặp gỡ. Tôi chưa bao giờ như cũ kể từ đó." },
  { id: 63, cat: "movies", level: "B1", text: "Life is like a box of chocolates. You never know what you're gonna get.", ipa: "/laɪf ɪz laɪk ə bɒks ɒv ˈtʃɒk.lɪts. juː ˈnɛv.ər nəʊ wɒt jɔːr ˈɡɒn.ə ɡɛt/", vi: "Cuộc sống giống như một hộp sô-cô-la. Bạn không bao giờ biết mình sẽ nhận được gì." },
  { id: 64, cat: "movies", level: "B2", text: "To infinity and beyond! Nothing is impossible if you believe.", ipa: "/tə ɪnˈfɪn.ɪ.ti ænd bɪˈɒnd! ˈnʌθ.ɪŋ ɪz ɪmˈpɒs.ɪ.bəl ɪf juː bɪˈliːv/", vi: "Đến vô tận và xa hơn nữa! Không có gì là không thể nếu bạn tin tưởng." },
  { id: 65, cat: "movies", level: "B1", text: "I am your father. Did you ever think this moment would come?", ipa: "/aɪ æm jɔːr ˈfɑː.ðər. dɪd juː ˈɛv.ər θɪŋk ðɪs ˈməʊ.mənt wʊd kʌm/", vi: "Tôi là cha của anh. Anh có bao giờ nghĩ khoảnh khắc này sẽ đến không?" },
  { id: 66, cat: "movies", level: "B2", text: "Why so serious? Sometimes you have to let go and laugh at life.", ipa: "/waɪ səʊ ˈsɪər.i.əs? ˈsʌm.taɪmz juː hæv tə lɛt ɡəʊ ænd lɑːf æt laɪf/", vi: "Sao lại nghiêm trọng vậy? Đôi khi bạn phải buông bỏ và cười vào cuộc sống." },
  { id: 67, cat: "movies", level: "B1", text: "I just want you to know that I love you and I'm proud of you.", ipa: "/aɪ dʒʌst wɒnt juː tə nəʊ ðæt aɪ lʌv juː ænd aɪm praʊd ɒv juː/", vi: "Tôi chỉ muốn bạn biết rằng tôi yêu bạn và tôi tự hào về bạn." },
  { id: 68, cat: "movies", level: "B2", text: "Every second counts when you're running out of time. Don't waste a single one.", ipa: "/ˈɛv.ri ˈsɛk.ənd kaʊnts wɛn jɔːr ˈrʌn.ɪŋ aʊt ɒv taɪm. dəʊnt weɪst ə ˈsɪŋ.ɡəl wʌn/", vi: "Mỗi giây đều có giá trị khi bạn đang cạn kiệt thời gian. Đừng lãng phí dù một giây." },
  { id: 69, cat: "movies", level: "B1", text: "Here's looking at you, kid. We'll always have Paris.", ipa: "/hɪərz ˈlʊk.ɪŋ æt juː, kɪd. wiːl ˈɔːl.weɪz hæv ˈpær.ɪs/", vi: "Tôi nhìn vào mắt em đây, cô bé. Chúng ta sẽ luôn có Paris." },
  { id: 70, cat: "movies", level: "B2", text: "With great power comes great responsibility. Never forget that.", ipa: "/wɪð ɡreɪt ˈpaʊ.ər kʌmz ɡreɪt rɪˌspɒn.sɪˈbɪl.ɪ.ti. ˈnɛv.ər fəˈɡɛt ðæt/", vi: "Với quyền năng lớn đi kèm trách nhiệm lớn. Đừng bao giờ quên điều đó." },
  { id: 71, cat: "movies", level: "A2", text: "Don't ever let somebody tell you that you can't do something.", ipa: "/dəʊnt ˈɛv.ər lɛt ˈsʌm.bɒd.i tɛl juː ðæt juː kɑːnt duː ˈsʌm.θɪŋ/", vi: "Đừng bao giờ để ai đó nói với bạn rằng bạn không thể làm được điều gì đó." },
  { id: 72, cat: "movies", level: "B1", text: "I know what I have to do now. I've always known.", ipa: "/aɪ nəʊ wɒt aɪ hæv tə duː naʊ. aɪv ˈɔːl.weɪz nəʊn/", vi: "Tôi biết mình phải làm gì bây giờ. Tôi đã luôn biết điều đó." },
  { id: 73, cat: "movies", level: "B2", text: "The greatest risk in life is not taking any risk at all.", ipa: "/ðə ˈɡreɪ.tɪst rɪsk ɪn laɪf ɪz nɒt ˈteɪk.ɪŋ ˈɛn.i rɪsk æt ɔːl/", vi: "Rủi ro lớn nhất trong cuộc sống là không chấp nhận bất kỳ rủi ro nào cả." },
  { id: 74, cat: "movies", level: "B1", text: "It's not who I am underneath, but what I do that defines me.", ipa: "/ɪts nɒt huː aɪ æm ˌʌn.dəˈniːθ, bʌt wɒt aɪ duː ðæt dɪˈfaɪnz miː/", vi: "Không phải tôi là ai bên trong, mà là những gì tôi làm mới định nghĩa tôi." },
  { id: 75, cat: "movies", level: "B2", text: "We accept the love we think we deserve. That's the sad truth of it.", ipa: "/wiː əkˈsɛpt ðə lʌv wiː θɪŋk wiː dɪˈzɜːv. ðæts ðə sæd truːθ ɒv ɪt/", vi: "Chúng ta chấp nhận tình yêu mà chúng ta nghĩ mình xứng đáng được nhận. Đó là sự thật đau buồn của nó." },

  // ── TED Talks (12 sentences) ─────────────────────────────────────
  { id: 76, cat: "ted", level: "C1", text: "The secret to success is not talent. It's grit—perseverance and passion for long-term goals.", ipa: "/ðə ˈsiː.krɪt tə səkˈsɛs ɪz nɒt ˈtæl.ənt. ɪts ɡrɪt—ˌpɜː.sɪˈvɪər.əns ænd ˈpæʃ.ən fɔːr lɒŋ tɜːm ɡəʊlz/", vi: "Bí quyết của thành công không phải là tài năng. Đó là sức mạnh bền bỉ—sự kiên trì và đam mê với mục tiêu dài hạn." },
  { id: 77, cat: "ted", level: "C1", text: "Vulnerability is not weakness; it's our greatest measure of courage.", ipa: "/ˌvʌl.nər.əˈbɪl.ɪ.ti ɪz nɒt ˈwiːk.nɪs; ɪts aʊər ˈɡreɪ.tɪst ˈmɛʒ.ər ɒv ˈkʌr.ɪdʒ/", vi: "Dễ bị tổn thương không phải là điểm yếu; đó là thước đo lòng can đảm lớn nhất của chúng ta." },
  { id: 78, cat: "ted", level: "B2", text: "Happiness is not something that happens to you; it's something you create.", ipa: "/ˈhæp.ɪ.nɪs ɪz nɒt ˈsʌm.θɪŋ ðæt ˈhæp.ənz tə juː; ɪts ˈsʌm.θɪŋ juː kriˈeɪt/", vi: "Hạnh phúc không phải là điều xảy đến với bạn; đó là điều bạn tạo ra." },
  { id: 79, cat: "ted", level: "C1", text: "The brain is more like a muscle than a fixed hardware. It can be trained.", ipa: "/ðə breɪn ɪz mɔːr laɪk ə ˈmʌs.əl ðæn ə fɪkst ˈhɑːd.weər. ɪt kæn biː treɪnd/", vi: "Não bộ giống cơ bắp hơn là phần cứng cố định. Nó có thể được rèn luyện." },
  { id: 80, cat: "ted", level: "B2", text: "Every person you meet knows something you don't. Learn from everyone.", ipa: "/ˈɛv.ri ˈpɜː.sən juː miːt nəʊz ˈsʌm.θɪŋ juː dəʊnt. lɜːn frɒm ˈɛv.ri.wʌn/", vi: "Mỗi người bạn gặp đều biết điều gì đó bạn chưa biết. Hãy học hỏi từ tất cả mọi người." },
  { id: 81, cat: "ted", level: "C1", text: "We tend to overestimate what we can do in a day and underestimate what we can do in a decade.", ipa: "/wiː tɛnd tə ˌəʊ.vərˈɛs.tɪ.meɪt wɒt wiː kæn duː ɪn ə deɪ ænd ˌʌn.dərˈɛs.tɪ.meɪt wɒt wiː kæn duː ɪn ə ˈdɛk.eɪd/", vi: "Chúng ta có xu hướng đánh giá quá cao những gì mình có thể làm trong một ngày và đánh giá thấp những gì có thể làm trong một thập kỷ." },
  { id: 82, cat: "ted", level: "B2", text: "Diversity of thought is what drives progress and innovation in any field.", ipa: "/daɪˈvɜː.sɪ.ti ɒv θɔːt ɪz wɒt draɪvz ˈprɒɡ.rɛs ænd ˌɪn.əˈveɪ.ʃən ɪn ˈɛn.i fiːld/", vi: "Sự đa dạng trong tư duy là điều thúc đẩy tiến bộ và đổi mới trong bất kỳ lĩnh vực nào." },
  { id: 83, cat: "ted", level: "C1", text: "The most powerful predictor of success is believing that improvement is possible.", ipa: "/ðə məʊst ˈpaʊ.ər.fəl prɪˈdɪk.tər ɒv səkˈsɛs ɪz bɪˈliːv.ɪŋ ðæt ɪmˈpruːv.mənt ɪz ˈpɒs.ɪ.bəl/", vi: "Yếu tố dự báo mạnh nhất của thành công là tin rằng sự cải thiện là có thể." },
  { id: 84, cat: "ted", level: "B2", text: "Connection is why we're here. It is what gives purpose and meaning to our lives.", ipa: "/kəˈnɛk.ʃən ɪz waɪ wɪər hɪər. ɪt ɪz wɒt ɡɪvz ˈpɜː.pəs ænd ˈmiː.nɪŋ tə aʊər laɪvz/", vi: "Sự kết nối là lý do chúng ta ở đây. Đó là thứ mang lại mục đích và ý nghĩa cho cuộc sống của chúng ta." },
  { id: 85, cat: "ted", level: "C1", text: "The way we talk to our children becomes their inner voice for the rest of their lives.", ipa: "/ðə weɪ wiː tɔːk tə aʊər ˈtʃɪl.drən bɪˈkʌmz ðɛər ˈɪn.ər vɔɪs fɔːr ðə rɛst ɒv ðɛər laɪvz/", vi: "Cách chúng ta nói chuyện với con cái trở thành giọng nói nội tâm của chúng suốt phần đời còn lại." },
  { id: 86, cat: "ted", level: "B2", text: "When you change the way you look at things, the things you look at change.", ipa: "/wɛn juː tʃeɪndʒ ðə weɪ juː lʊk æt θɪŋz, ðə θɪŋz juː lʊk æt tʃeɪndʒ/", vi: "Khi bạn thay đổi cách nhìn nhận sự việc, những sự việc bạn nhìn vào cũng thay đổi." },
  { id: 87, cat: "ted", level: "C1", text: "Authentic leadership is about being the same person in public as you are in private.", ipa: "/ɔːˈθɛn.tɪk ˈliː.dər.ʃɪp ɪz əˈbaʊt ˈbiː.ɪŋ ðə seɪm ˈpɜː.sən ɪn ˈpʌb.lɪk æz juː ɑːr ɪn ˈpraɪ.vɪt/", vi: "Lãnh đạo chân thật là về việc trở thành cùng một người trước công chúng như bạn là trong riêng tư." },

  // ── Pronunciation Focus (10 sentences) ───────────────────────────
  { id: 88, cat: "pronunciation", level: "B1", text: "Butter and water are better when mixed together in a bowl.", ipa: "/ˈbʌt.ər ænd ˈwɔː.tər ɑːr ˈbɛt.ər wɛn mɪkst təˈɡɛð.ər ɪn ə bəʊl/", vi: "Bơ và nước ngon hơn khi trộn cùng nhau trong một cái bát. (Luyện âm /t/ biến thành /d/)" },
  { id: 89, cat: "pronunciation", level: "B1", text: "The thirty-three thieves thought they thrilled the throne throughout Thursday.", ipa: "/ðə ˈθɜː.ti θriː θiːvz θɔːt ðeɪ θrɪld ðə θrəʊn θruːˈaʊt ˈθɜːz.deɪ/", vi: "Ba mươi ba tên trộm nghĩ rằng chúng đã làm hào hứng ngai vàng suốt thứ Năm. (Luyện âm /θ/ và /ð/)" },
  { id: 90, cat: "pronunciation", level: "A2", text: "She sells seashells by the seashore. The shells she sells are surely seashells.", ipa: "/ʃiː sɛlz ˈsiː.ʃɛlz baɪ ðə ˈsiː.ʃɔːr. ðə ʃɛlz ʃiː sɛlz ɑːr ˈʃʊər.li ˈsiː.ʃɛlz/", vi: "Cô ấy bán vỏ sò ở bờ biển. Những vỏ sò cô ấy bán chắc chắn là vỏ sò biển. (Luyện /ʃ/ và /s/)" },
  { id: 91, cat: "pronunciation", level: "B2", text: "Could you would you should you couldn't shouldn't wouldn't if you didn't have to?", ipa: "/kʊd juː wʊd juː ʃʊd juː ˈkʊd.ənt ˈʃʊd.ənt ˈwʊd.ənt ɪf juː ˈdɪd.ənt hæv tə/", vi: "Liệu bạn có thể, có nên, có muốn, không thể, không nên, không muốn nếu bạn không cần phải không? (Luyện modal verbs)" },
  { id: 92, cat: "pronunciation", level: "B1", text: "I would've told her but I couldn't have known she'd be there.", ipa: "/aɪ wʊdəv təʊld hər bʌt aɪ ˈkʊd.ənt hæv nəʊn ʃiːd biː ðɛər/", vi: "Tôi đáng lẽ đã nói cho cô ấy nhưng tôi không thể biết cô ấy sẽ ở đó. (Luyện contractions)" },
  { id: 93, cat: "pronunciation", level: "B2", text: "The politician's popularity plummeted after the press conference on pollution policy.", ipa: "/ðə pəˈlɪt.ɪ.kənz ˌpɒp.jʊˈlær.ɪ.ti ˈplʌm.ɪ.tɪd ˈɑːf.tər ðə prɛs ˈkɒn.fər.əns ɒn pəˈluː.ʃən ˈpɒl.ɪ.si/", vi: "Sự nổi tiếng của chính khách sụt giảm mạnh sau cuộc họp báo về chính sách ô nhiễm. (Luyện âm /p/)" },
  { id: 94, cat: "pronunciation", level: "B1", text: "Wouldn't it be wonderful if we could wake up one day feeling fantastic?", ipa: "/ˈwʊd.ənt ɪt biː ˈwʌn.dər.fəl ɪf wiː kʊd weɪk ʌp wʌn deɪ ˈfiː.lɪŋ fænˈtæs.tɪk/", vi: "Thật tuyệt vời biết bao nếu chúng ta có thể thức dậy một ngày cảm thấy tuyệt vời?" },
  { id: 95, cat: "pronunciation", level: "B2", text: "Throughout the year, thorough research thoroughly supports the theory of transformation.", ipa: "/θruːˈaʊt ðə jɪər, ˈθʌr.ə rɪˈsɜːtʃ ˈθʌr.ə.li səˈpɔːts ðə ˈθɪər.i ɒv ˌtræns.fɔːˈmeɪ.ʃən/", vi: "Suốt cả năm, nghiên cứu kỹ lưỡng ủng hộ toàn diện lý thuyết biến đổi. (Luyện /θ/ vs /ð/)" },
  { id: 96, cat: "pronunciation", level: "B1", text: "The man ran a can of spam across the land of the tan sand dam.", ipa: "/ðə mæn ræn ə kæn ɒv spæm əˈkrɒs ðə lænd ɒv ðə tæn sænd dæm/", vi: "Người đàn ông mang một hộp thịt hộp qua vùng đất có đập cát nâu. (Luyện âm /æ/)" },
  { id: 97, cat: "pronunciation", level: "C1", text: "Particularly particularly particularly powerful pronunciation patterns can particularly challenge particular people.", ipa: "/pəˈtɪk.jʊ.lə.li pəˈtɪk.jʊ.lə.li pəˈtɪk.jʊ.lə.li ˈpaʊ.ər.fəl prəˌnʌn.siˈeɪ.ʃən ˈpæt.ənz kæn pəˈtɪk.jʊ.lə.li ˈtʃæl.ɪndʒ pəˈtɪk.jʊ.lər ˈpiː.pəl/", vi: "Các mẫu phát âm đặc biệt mạnh mẽ có thể đặc biệt thách thức những người cụ thể. (Luyện âm /pəˈtɪk.jʊ.lə.li/)" },

  // ── Kids & Beginner (10 sentences) ─────────────────────────────────
  { id: 98, cat: "kids", level: "A1", text: "Hello! My name is Minh and I am ten years old.", ipa: "/həˈləʊ! maɪ neɪm ɪz mɪn ænd aɪ æm tɛn jɪərz əʊld/", vi: "Xin chào! Tên tôi là Minh và tôi mười tuổi." },
  { id: 99, cat: "kids", level: "A1", text: "I like to play football with my friends after school.", ipa: "/aɪ laɪk tə pleɪ ˈfʊt.bɔːl wɪð maɪ frɛndz ˈɑːf.tər skuːl/", vi: "Tôi thích chơi bóng đá với bạn bè sau giờ học." },
  { id: 100, cat: "kids", level: "A1", text: "Can you help me? I don't understand this question.", ipa: "/kæn juː hɛlp miː? aɪ dəʊnt ˌʌn.dəˈstænd ðɪs ˈkwɛs.tʃən/", vi: "Bạn có thể giúp tôi không? Tôi không hiểu câu hỏi này." },
  { id: 101, cat: "kids", level: "A1", text: "The cat sat on the mat and looked at the fat rat.", ipa: "/ðə kæt sæt ɒn ðə mæt ænd lʊkt æt ðə fæt ræt/", vi: "Con mèo ngồi trên tấm thảm và nhìn con chuột béo." },
  { id: 102, cat: "kids", level: "A1", text: "What is your favorite color? Mine is blue.", ipa: "/wɒt ɪz jɔːr ˈfeɪ.vər.ɪt ˈkʌl.ər? maɪn ɪz bluː/", vi: "Màu yêu thích của bạn là gì? Của tôi là màu xanh dương." },
  { id: 103, cat: "kids", level: "A2", text: "I want to be a doctor when I grow up because I like helping people.", ipa: "/aɪ wɒnt tə biː ə ˈdɒk.tər wɛn aɪ ɡrəʊ ʌp bɪˈkɒz aɪ laɪk ˈhɛlp.ɪŋ ˈpiː.pəl/", vi: "Tôi muốn trở thành bác sĩ khi lớn lên vì tôi thích giúp đỡ mọi người." },
  { id: 104, cat: "kids", level: "A2", text: "Yesterday I went to the zoo and I saw many different animals.", ipa: "/ˈjɛs.tər.deɪ aɪ wɛnt tə ðə zuː ænd aɪ sɔː ˈmɛn.i ˈdɪf.ər.ənt ˈæn.ɪ.məlz/", vi: "Hôm qua tôi đến vườn thú và tôi thấy nhiều loài động vật khác nhau." },
  { id: 105, cat: "kids", level: "A2", text: "My mom makes the best noodle soup in the whole wide world.", ipa: "/maɪ mɒm meɪks ðə bɛst ˈnuː.dəl suːp ɪn ðə həʊl waɪd wɜːld/", vi: "Mẹ tôi nấu món phở ngon nhất trên cả thế giới." },
  { id: 106, cat: "kids", level: "A2", text: "If you study hard every day, you will get good marks in school.", ipa: "/ɪf juː ˈstʌd.i hɑːrd ˈɛv.ri deɪ, juː wɪl ɡɛt ɡʊd mɑːks ɪn skuːl/", vi: "Nếu bạn học chăm chỉ mỗi ngày, bạn sẽ đạt điểm tốt ở trường." },
  { id: 107, cat: "kids", level: "A2", text: "It's important to be kind and share things with others.", ipa: "/ɪts ɪmˈpɔːt.ənt tə biː kaɪnd ænd ʃɛər θɪŋz wɪð ˈʌð.ərz/", vi: "Điều quan trọng là phải tử tế và chia sẻ mọi thứ với người khác." }
];

export default function ShadowingView() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionError, setRecognitionError] = useState("");
  const [userTranscript, setUserTranscript] = useState("");
  const [analyzedWords, setAnalyzedWords] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [completedIds, setCompletedIds] = useState(new Set());

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Filter sentences by category
  const filteredSentences = selectedCat === "all"
    ? ALL_SENTENCES
    : ALL_SENTENCES.filter(s => s.cat === selectedCat);

  const current = filteredSentences[currentIdx] || filteredSentences[0];

  useEffect(() => {
    resetAttempt();
  }, [currentIdx, selectedCat]);

  const resetAttempt = () => {
    if (isRecording) stopRecording();
    setScoreResult(null);
    setUserTranscript("");
    setAnalyzedWords(null);
    setRecognitionError("");
    setRecordSeconds(0);
  };

  const playAudio = () => {
    if (current) playGoogleSpeech(current.text, 0.9);
  };

  const analyzeSpeech = (spoken) => {
    if (!spoken || !spoken.trim()) {
      setRecognitionError("Chưa phát hiện giọng nói. Vui lòng nói to và rõ hơn!");
      return;
    }

    const cleanTargetTokens = current.text.split(/\s+/).map(w => {
      const clean = w.replace(/^[^\w]+|[^\w]+$/g, "").toLowerCase();
      return { raw: w, clean };
    });

    const spokenTokens = spoken.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(w => w.length > 0);

    let matchCount = 0;
    const wordEvaluations = cleanTargetTokens.map(t => {
      const isDirectMatch = spokenTokens.includes(t.clean);
      const isFuzzyMatch = spokenTokens.some(sw => {
        if (sw === t.clean) return true;
        if (t.clean.length >= 4 && (sw.startsWith(t.clean.slice(0, 3)) || t.clean.startsWith(sw.slice(0, 3)))) return true;
        return false;
      });

      if (isDirectMatch) { matchCount += 1; return { ...t, status: "correct" }; }
      else if (isFuzzyMatch) { matchCount += 0.8; return { ...t, status: "acceptable" }; }
      else { return { ...t, status: "missed" }; }
    });

    const finalScore = Math.min(100, Math.max(0, Math.round((matchCount / cleanTargetTokens.length) * 100)));
    setAnalyzedWords(wordEvaluations);
    setScoreResult({ score: finalScore, matched: Math.round(matchCount), total: cleanTargetTokens.length });

    if (finalScore >= 75) {
      sounds.playCorrect();
      setCompletedIds(prev => new Set([...prev, current.id]));
    } else {
      sounds.playWrong();
    }
  };

  const startRecording = () => {
    resetAttempt();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionError("Trình duyệt chưa hỗ trợ Web Speech API. Dùng Google Chrome để luyện shadowing!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
      let finalTranscript = "";

      recognition.onstart = () => {
        setIsRecording(true);
        setRecognitionError("");
        setRecordSeconds(0);
        timerRef.current = setInterval(() => {
          setRecordSeconds(prev => { if (prev >= 12) { stopRecording(); return prev; } return prev + 1; });
        }, 1000);
      };

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }
        setUserTranscript(finalTranscript || interim);
      };

      recognition.onerror = (event) => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (event.error === "no-speech") setRecognitionError("Chưa phát hiện giọng nói. Nói to và rõ hơn nhé!");
        else if (event.error === "not-allowed") setRecognitionError("Quyền truy cập micro bị từ chối. Hãy cấp quyền micro cho trình duyệt!");
        else setRecognitionError(`Lỗi nhận diện âm thanh (${event.error}). Thử lại!`);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (finalTranscript && finalTranscript.trim().length > 1) analyzeSpeech(finalTranscript);
        else setRecognitionError("Chưa thu được giọng nói. Nói to và rõ hơn nhé!");
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setIsRecording(false);
      setRecognitionError("Không thể khởi động micro: " + err.message);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const shuffle = () => {
    const len = filteredSentences.length;
    if (len === 0) return;
    setCurrentIdx(Math.floor(Math.random() * len));
  };

  const catInfo = SHADOWING_CATEGORIES.find(c => c.id === selectedCat) || SHADOWING_CATEGORIES[0];
  const levelColors = { A1: "#22c55e", A2: "#4ade80", B1: "#60a5fa", B2: "#a855f7", C1: "#f59e0b", C2: "#ef4444" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "860px", margin: "0 auto", width: "100%", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--foreground)", marginBottom: "6px" }}>
            🎤 Luyện Nói & Nhại Theo (Shadowing)
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
            {ALL_SENTENCES.length} câu luyện tập • {SHADOWING_CATEGORIES.length - 1} chủ đề • Nhận diện giọng nói AI chấm điểm chính xác từng từ
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#22c55e" }}>
            ✓ {completedIds.size} câu hoàn thành
          </span>
          <button
            onClick={shuffle}
            className="btn-ghost"
            style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)" }}
          >
            <Shuffle size={14} /> Ngẫu nhiên
          </button>
        </div>
      </div>

      {/* Category Filter Tabs - như app Sorata */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {SHADOWING_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCat(cat.id); setCurrentIdx(0); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 14px",
              borderRadius: "9999px",
              border: selectedCat === cat.id ? `2px solid ${cat.color}` : "1px solid var(--border)",
              backgroundColor: selectedCat === cat.id ? `${cat.color}22` : "var(--card)",
              color: selectedCat === cat.id ? cat.color : "var(--muted-foreground)",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap"
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span style={{
              backgroundColor: selectedCat === cat.id ? cat.color : "var(--muted)",
              color: selectedCat === cat.id ? "#fff" : "var(--muted-foreground)",
              borderRadius: "9999px",
              padding: "1px 6px",
              fontSize: "10px",
              fontWeight: 800
            }}>
              {cat.id === "all" ? ALL_SENTENCES.length : ALL_SENTENCES.filter(s => s.cat === cat.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Progress Bar within category */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
          {currentIdx + 1} / {filteredSentences.length}
        </span>
        <div style={{ flex: 1, height: "6px", backgroundColor: "var(--muted)", borderRadius: "9999px", overflow: "hidden" }}>
          <div style={{
            width: `${((currentIdx + 1) / filteredSentences.length) * 100}%`,
            height: "100%",
            backgroundColor: catInfo.color,
            transition: "width 0.3s ease"
          }} />
        </div>
        <span style={{ fontSize: "12px", color: catInfo.color, fontWeight: 700, whiteSpace: "nowrap" }}>
          {catInfo.icon} {catInfo.label}
        </span>
      </div>

      {/* Main Practice Card */}
      {current && (
        <div style={{
          backgroundColor: "var(--card)",
          border: `2px solid ${scoreResult ? (scoreResult.score >= 75 ? "#22c55e" : "#ef4444") : "var(--border)"}`,
          borderRadius: "24px",
          padding: "32px 28px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          transition: "border-color 0.3s ease"
        }}>
          {/* Nav + Level badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <button onClick={() => { if (currentIdx > 0) setCurrentIdx(currentIdx - 1); else setCurrentIdx(filteredSentences.length - 1); }} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
              <ChevronLeft size={16} /> Trước
            </button>

            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: levelColors[current.level] + "22", color: levelColors[current.level], padding: "3px 10px", borderRadius: "6px" }}>
                {current.level}
              </span>
              <span style={{ fontSize: "11px", fontWeight: 800, backgroundColor: catInfo.color + "22", color: catInfo.color, padding: "3px 10px", borderRadius: "6px" }}>
                {catInfo.icon} {catInfo.label}
              </span>
              {completedIds.has(current.id) && (
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#22c55e", padding: "3px 10px" }}>✓ Hoàn thành</span>
              )}
            </div>

            <button onClick={() => { if (currentIdx + 1 < filteredSentences.length) setCurrentIdx(currentIdx + 1); else setCurrentIdx(0); }} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
              Tiếp <ChevronRight size={16} />
            </button>
          </div>

          {/* Main Sentence with word-level highlighting */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px", marginBottom: "16px" }}>
              {analyzedWords ? (
                analyzedWords.map((token, i) => (
                  <span key={i} style={{
                    fontSize: "22px", fontWeight: 800, lineHeight: 1.3,
                    color: token.status === "correct" ? "#4ade80" : token.status === "acceptable" ? "#f59e0b" : "#f87171",
                    borderBottom: `3px solid ${token.status === "correct" ? "#4ade80" : token.status === "acceptable" ? "#f59e0b" : "#f87171"}`,
                    transition: "color 0.3s ease"
                  }}>
                    {token.raw}
                  </span>
                ))
              ) : (
                <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--foreground)", lineHeight: 1.5, maxWidth: "700px" }}>
                  {current.text}
                </p>
              )}
            </div>

            {/* IPA phonetic guide */}
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)", fontStyle: "italic", marginBottom: "10px" }}>
              {current.ipa}
            </p>

            {/* Vietnamese translation */}
            <p style={{ fontSize: "14px", color: "#38bdf8", fontWeight: 500 }}>
              🇻🇳 {current.vi}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button
              onClick={playAudio}
              className="btn-duo btn-outline"
              style={{ padding: "10px 20px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <Play size={16} /> Nghe phát âm mẫu
            </button>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className="btn-duo"
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                backgroundColor: isRecording ? "#ef4444" : catInfo.color,
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 800,
                animation: isRecording ? "pulse 1s infinite" : "none"
              }}
            >
              {isRecording ? (
                <><Square size={16} /> Dừng ({recordSeconds}s)</>
              ) : (
                <><Mic size={16} /> Nhái lại ngay</>
              )}
            </button>

            <button
              onClick={resetAttempt}
              className="btn-ghost"
              style={{ padding: "10px 16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}
            >
              <RotateCcw size={14} /> Thử lại
            </button>
          </div>

          {/* Real-time transcript */}
          {(userTranscript || isRecording) && (
            <div style={{ backgroundColor: "var(--muted)", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px", textAlign: "left" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--muted-foreground)", display: "block", marginBottom: "4px" }}>
                {isRecording ? "🔴 Đang nghe..." : "🎙️ Bạn vừa nói:"}
              </span>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--foreground)" }}>
                {userTranscript || "..."}
              </p>
            </div>
          )}

          {/* Error message */}
          {recognitionError && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", borderRadius: "12px", padding: "12px 16px", marginBottom: "16px" }}>
              <AlertCircle size={16} style={{ color: "#f87171", flexShrink: 0 }} />
              <p style={{ fontSize: "13px", color: "#f87171", fontWeight: 600 }}>{recognitionError}</p>
            </div>
          )}

          {/* Score Result */}
          {scoreResult && (
            <div style={{
              backgroundColor: scoreResult.score >= 75 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              border: `2px solid ${scoreResult.score >= 75 ? "#22c55e" : "#ef4444"}`,
              borderRadius: "16px",
              padding: "20px",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "52px", fontWeight: 900, color: scoreResult.score >= 75 ? "#4ade80" : "#f87171", marginBottom: "6px" }}>
                {scoreResult.score}%
              </div>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)", marginBottom: "8px" }}>
                {scoreResult.score >= 90 ? "🏆 Xuất sắc! Phát âm hoàn hảo!" :
                 scoreResult.score >= 75 ? "🎉 Tốt lắm! Tiếp tục luyện tập!" :
                 scoreResult.score >= 50 ? "💪 Khá! Cần cải thiện thêm một chút." :
                 "😅 Hãy lắng nghe kỹ và thử lại nhé!"}
              </p>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                Đúng {scoreResult.matched}/{scoreResult.total} từ
              </p>
              {scoreResult.score >= 75 && (
                <button
                  onClick={() => { if (currentIdx + 1 < filteredSentences.length) setCurrentIdx(currentIdx + 1); else setCurrentIdx(0); }}
                  className="btn-duo btn-success"
                  style={{ marginTop: "12px", padding: "10px 24px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  <ArrowRight size={16} /> Câu tiếp theo
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {analyzedWords && (
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", fontSize: "12px", color: "var(--muted-foreground)" }}>
          <span style={{ color: "#4ade80", fontWeight: 700 }}>■ Đúng hoàn toàn</span>
          <span style={{ color: "#f59e0b", fontWeight: 700 }}>■ Chấp nhận được</span>
          <span style={{ color: "#f87171", fontWeight: 700 }}>■ Cần luyện thêm</span>
        </div>
      )}
    </div>
  );
}
