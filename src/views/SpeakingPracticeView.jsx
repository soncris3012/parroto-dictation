import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, Volume2, Sparkles, RotateCcw, ChevronLeft, ChevronRight, MessageCircle, Star, BookOpen, User } from "lucide-react";
import { MascotSvg } from "../components/Mascot";
import { sounds } from "../utils/audioEffects";
import { playGoogleSpeech } from "../utils/pronunciationAudio";

// =====================================================================
// 15 Rich Roleplay Scenarios with Multi-Turn AI Dialogue Scripts
// =====================================================================
const SCENARIOS = [
  {
    id: "coffee",
    name: "Gọi món tại quán Cafe",
    icon: "☕",
    level: "A2",
    partner: "Emma (Barista)",
    color: "#f59e0b",
    category: "Giao tiếp hàng ngày",
    description: "Thực hành gọi đồ uống, hỏi về menu và thanh toán tại quán cà phê.",
    tips: ["Dùng 'I'd like...' để gọi món lịch sự", "Hỏi về các lựa chọn: 'What sizes do you have?'", "Đặt câu hỏi về thành phần: 'Does it contain milk?'"],
    script: [
      { role: "ai", text: "Hi there! Welcome to Central Perk Café. What can I get started for you today?", vi: "Xin chào! Chào mừng bạn đến với quán cà phê. Hôm nay mình có thể phục vụ gì cho bạn?" },
      { role: "user_hint", text: "Order a drink (e.g., I'd like a large iced Americano, please.)", vi: "Gọi một đồ uống theo ý bạn" },
      { role: "ai", text: "Great choice! Would you like that with any milk or sweetener? We have oat milk, almond milk, and regular milk.", vi: "Lựa chọn tuyệt vời! Bạn muốn thêm sữa hoặc đường không? Chúng tôi có sữa yến mạch, sữa hạnh nhân và sữa thường." },
      { role: "user_hint", text: "Specify your preference (e.g., Oat milk, please. And no sugar.)", vi: "Chỉ định sở thích của bạn" },
      { role: "ai", text: "Perfect! Can I get your name for the order? And that will be four dollars fifty.", vi: "Hoàn hảo! Cho tôi biết tên của bạn để ghi lên đơn hàng? Và tổng cộng là 4 đô la 50 xu." },
      { role: "user_hint", text: "Give your name and ask about payment (e.g., I'll pay by card. My name is Minh.)", vi: "Đưa tên và hỏi về phương thức thanh toán" },
      { role: "ai", text: "Thank you, Minh! Your order will be ready in about five minutes. Feel free to find a seat.", vi: "Cảm ơn bạn! Đơn hàng của bạn sẽ sẵn sàng trong khoảng năm phút. Hãy tự nhiên tìm chỗ ngồi nhé." }
    ]
  },
  {
    id: "job_interview",
    name: "Phỏng vấn xin việc",
    icon: "💼",
    level: "B2",
    partner: "Mr. David (HR Manager)",
    color: "#3b82f6",
    category: "Tiếng Anh thương mại",
    description: "Luyện tập trả lời phỏng vấn xin việc chuyên nghiệp bằng tiếng Anh.",
    tips: ["Dùng STAR method: Situation, Task, Action, Result", "Bắt đầu bằng: 'I have X years of experience in...'", "Luôn hỏi lại: 'Could you tell me more about the role?'"],
    script: [
      { role: "ai", text: "Good morning! Please take a seat. Thanks for coming in today. Could you start by briefly introducing yourself?", vi: "Chào buổi sáng! Mời ngồi. Cảm ơn bạn đã đến hôm nay. Bạn có thể bắt đầu bằng cách tự giới thiệu ngắn gọn không?" },
      { role: "user_hint", text: "Introduce yourself professionally (name, background, current role)", vi: "Tự giới thiệu chuyên nghiệp" },
      { role: "ai", text: "Excellent. What makes you the right candidate for this marketing manager position?", vi: "Xuất sắc. Điều gì khiến bạn trở thành ứng viên phù hợp cho vị trí quản lý tiếp thị này?" },
      { role: "user_hint", text: "Highlight your key strengths and relevant experience", vi: "Nhấn mạnh điểm mạnh và kinh nghiệm liên quan" },
      { role: "ai", text: "Can you tell me about a time when you had to manage a difficult project under pressure?", vi: "Bạn có thể kể về một lần bạn phải quản lý một dự án khó khăn dưới áp lực không?" },
      { role: "user_hint", text: "Use STAR method to answer (Situation, Task, Action, Result)", vi: "Dùng phương pháp STAR để trả lời" },
      { role: "ai", text: "Very impressive. Where do you see yourself in five years?", vi: "Rất ấn tượng. Bạn thấy mình ở đâu sau 5 năm nữa?" }
    ]
  },
  {
    id: "hotel_checkin",
    name: "Check-in khách sạn",
    icon: "🏨",
    level: "B1",
    partner: "Receptionist Alex",
    color: "#8b5cf6",
    category: "Du lịch & Đi lại",
    description: "Làm thủ tục nhận phòng khách sạn và yêu cầu dịch vụ.",
    tips: ["Cung cấp thông tin: 'I have a reservation under the name...'", "Hỏi về tiện nghi: 'Does the room have WiFi?'", "Yêu cầu đặc biệt: 'Could I get a room with a sea view?'"],
    script: [
      { role: "ai", text: "Good evening! Welcome to the Grand Hyatt. Do you have a reservation with us?", vi: "Chào buổi tối! Chào mừng đến Grand Hyatt. Bạn có đặt phòng trước không?" },
      { role: "user_hint", text: "Confirm reservation (I have a reservation under the name...)", vi: "Xác nhận đặt phòng" },
      { role: "ai", text: "Perfect! I can see your booking for a deluxe double room for three nights. Could I see your passport and credit card please?", vi: "Tuyệt vời! Tôi thấy đặt phòng của bạn cho phòng deluxe đôi trong ba đêm. Cho tôi xem hộ chiếu và thẻ tín dụng của bạn nhé?" },
      { role: "user_hint", text: "Provide documents and ask about check-out time", vi: "Cung cấp giấy tờ và hỏi giờ trả phòng" },
      { role: "ai", text: "Check-out is at noon. Your room is 1508 on the 15th floor. The elevator is to your right. Would you like help with your luggage?", vi: "Giờ trả phòng là 12 giờ trưa. Phòng của bạn là 1508 ở tầng 15. Thang máy ở bên phải của bạn. Bạn có cần giúp đỡ với hành lý không?" }
    ]
  },
  {
    id: "doctor_visit",
    name: "Khám bệnh tại phòng khám",
    icon: "🏥",
    level: "B1",
    partner: "Dr. Sarah (General Practitioner)",
    color: "#10b981",
    category: "Sức khỏe & Y tế",
    description: "Mô tả triệu chứng bệnh và thảo luận về điều trị với bác sĩ.",
    tips: ["Mô tả triệu chứng: 'I've been having... for about X days'", "Dùng 'It hurts when...' hoặc 'I feel...'", "Hỏi về thuốc: 'How often should I take this?'"],
    script: [
      { role: "ai", text: "Hello! I'm Dr. Chen. What seems to be the problem today? How can I help you?", vi: "Xin chào! Tôi là Bác sĩ Chen. Hôm nay bạn có vấn đề gì vậy? Tôi có thể giúp gì cho bạn?" },
      { role: "user_hint", text: "Describe your main symptom (I've been having a headache / fever / sore throat for...)", vi: "Mô tả triệu chứng chính của bạn" },
      { role: "ai", text: "I see. How long have you had this symptom? And would you say the pain is mild, moderate, or severe?", vi: "Tôi hiểu. Bạn đã có triệu chứng này bao lâu rồi? Và bạn có thể nói cơn đau là nhẹ, vừa phải, hay nặng không?" },
      { role: "user_hint", text: "Explain duration and severity (It started about three days ago and it's quite severe)", vi: "Giải thích thời gian và mức độ" },
      { role: "ai", text: "Are you currently taking any medications? Do you have any known allergies to medicine?", vi: "Hiện tại bạn có đang dùng thuốc nào không? Bạn có biết mình dị ứng với thuốc nào không?" },
      { role: "user_hint", text: "Mention any current medications or allergies", vi: "Đề cập đến thuốc hoặc dị ứng hiện tại" },
      { role: "ai", text: "Based on your symptoms, I'd like to prescribe some medication. I'll write you a prescription. Come back in a week if you don't feel better.", vi: "Dựa trên triệu chứng của bạn, tôi muốn kê đơn thuốc. Tôi sẽ viết đơn cho bạn. Quay lại sau một tuần nếu bạn không cảm thấy tốt hơn." }
    ]
  },
  {
    id: "restaurant",
    name: "Đặt bàn & Gọi món nhà hàng",
    icon: "🍽️",
    level: "A2",
    partner: "Waiter James",
    color: "#ef4444",
    category: "Giao tiếp hàng ngày",
    description: "Thực hành đặt bàn, gọi món và xử lý tình huống tại nhà hàng.",
    tips: ["Đặt bàn: 'I'd like to reserve a table for...'", "Gọi món: 'I'll have...' hoặc 'Could I get...?'", "Phàn nàn lịch sự: 'I'm afraid there might be an issue with my order'"],
    script: [
      { role: "ai", text: "Good evening and welcome! Do you have a reservation, or would you like a table for tonight?", vi: "Chào buổi tối và chào mừng! Bạn có đặt bàn trước không, hay bạn muốn đặt bàn tối nay?" },
      { role: "user_hint", text: "Request a table (e.g., We'd like a table for four, please. Preferably by the window.)", vi: "Yêu cầu bàn theo mong muốn" },
      { role: "ai", text: "Of course! Right this way. Here are your menus. Can I start you off with some drinks while you look over the food menu?", vi: "Được thôi! Mời theo đây. Đây là thực đơn của quý khách. Tôi có thể phục vụ đồ uống trong khi quý khách xem thực đơn không?" },
      { role: "user_hint", text: "Order drinks and ask about today's specials", vi: "Gọi đồ uống và hỏi về món đặc biệt hôm nay" },
      { role: "ai", text: "Our special today is grilled salmon with lemon butter sauce. Are you ready to order your main course?", vi: "Món đặc biệt hôm nay là cá hồi nướng với sốt bơ chanh. Quý khách đã sẵn sàng gọi món chính chưa?" }
    ]
  },
  {
    id: "airport",
    name: "Làm thủ tục tại sân bay",
    icon: "✈️",
    level: "B1",
    partner: "Officer Sarah (Immigration)",
    color: "#06b6d4",
    category: "Du lịch & Đi lại",
    description: "Thực hành hỏi đường, làm thủ tục hải quan và nhập cảnh.",
    tips: ["Chuẩn bị: passport, boarding pass, destination address", "Trả lời rõ ràng: mục đích chuyến đi, thời gian ở lại", "Hỏi lịch lịch sự: 'Could you repeat that, please?'"],
    script: [
      { role: "ai", text: "Good afternoon. Passport please. Where are you flying to today?", vi: "Chào buổi chiều. Cho xem hộ chiếu. Hôm nay bạn bay đến đâu vậy?" },
      { role: "user_hint", text: "Hand over passport and state your destination", vi: "Đưa hộ chiếu và nêu điểm đến" },
      { role: "ai", text: "What is the purpose of your visit? Business or pleasure?", vi: "Mục đích chuyến thăm của bạn là gì? Công việc hay du lịch?" },
      { role: "user_hint", text: "Explain your purpose of travel (I'm visiting for tourism / business / study...)", vi: "Giải thích mục đích du lịch" },
      { role: "ai", text: "How long will you be staying? And do you have an address where you'll be staying in the country?", vi: "Bạn sẽ ở lại bao lâu? Và bạn có địa chỉ nơi bạn sẽ ở trong nước không?" },
      { role: "user_hint", text: "Provide duration of stay and accommodation address", vi: "Cung cấp thời gian lưu trú và địa chỉ" },
      { role: "ai", text: "Everything looks in order. Enjoy your stay! Gate C12 is down the hall to your left.", vi: "Mọi thứ đều ổn. Chúc bạn có chuyến đi vui vẻ! Cổng C12 ở phía cuối hành lang bên trái của bạn." }
    ]
  },
  {
    id: "shopping",
    name: "Mua sắm tại cửa hàng",
    icon: "🛍️",
    level: "A2",
    partner: "Shop Assistant Lisa",
    color: "#ec4899",
    category: "Giao tiếp hàng ngày",
    description: "Hỏi giá, đổi trả hàng và thương lượng khi mua sắm.",
    tips: ["Hỏi kích cỡ: 'Do you have this in a medium?'", "Đổi hàng: 'I'd like to return/exchange this item'", "Hỏi giảm giá: 'Is this item on sale?'"],
    script: [
      { role: "ai", text: "Hi! Welcome to the store. Can I help you find something specific today?", vi: "Xin chào! Chào mừng đến cửa hàng. Tôi có thể giúp bạn tìm thứ gì cụ thể không?" },
      { role: "user_hint", text: "Ask for help finding something (I'm looking for... / Do you have...?)", vi: "Hỏi về sản phẩm bạn cần" },
      { role: "ai", text: "We have that in blue, black, and white. What size are you looking for?", vi: "Chúng tôi có màu xanh, đen và trắng. Bạn đang tìm kích cỡ nào?" },
      { role: "user_hint", text: "Specify your size and ask about fitting rooms", vi: "Chỉ định kích cỡ và hỏi về phòng thay đồ" },
      { role: "ai", text: "The fitting rooms are in the back on the left. Take your time! If you need any other sizes, just let me know.", vi: "Phòng thay đồ ở phía sau bên trái. Cứ từ từ nhé! Nếu bạn cần kích cỡ khác, cứ nói với tôi." }
    ]
  },
  {
    id: "bank",
    name: "Giao dịch tại ngân hàng",
    icon: "🏦",
    level: "B1",
    partner: "Bank Teller Kevin",
    color: "#64748b",
    category: "Tài chính & Ngân hàng",
    description: "Thực hành mở tài khoản, chuyển tiền và hỏi về dịch vụ ngân hàng.",
    tips: ["Mở tài khoản: 'I'd like to open a savings account'", "Chuyển tiền: 'I need to make an international wire transfer'", "Hỏi phí: 'Are there any fees associated with this?'"],
    script: [
      { role: "ai", text: "Good morning! How can I assist you today?", vi: "Chào buổi sáng! Tôi có thể giúp gì cho bạn hôm nay?" },
      { role: "user_hint", text: "State your banking need (open account, transfer, inquire about services)", vi: "Nêu nhu cầu ngân hàng của bạn" },
      { role: "ai", text: "Certainly! I can help with that. Could I see a valid photo ID and proof of address please?", vi: "Chắc chắn rồi! Tôi có thể giúp bạn. Bạn có thể cho tôi xem giấy tờ tùy thân có ảnh hợp lệ và bằng chứng địa chỉ không?" },
      { role: "user_hint", text: "Provide documentation and ask about interest rates or terms", vi: "Cung cấp giấy tờ và hỏi về lãi suất hoặc điều khoản" },
      { role: "ai", text: "Our standard savings account offers 3.5% annual interest with no monthly fees. Would you like to proceed?", vi: "Tài khoản tiết kiệm tiêu chuẩn của chúng tôi có lãi suất hàng năm 3,5% và không có phí hàng tháng. Bạn có muốn tiến hành không?" }
    ]
  },
  {
    id: "academic",
    name: "Hỏi thăm giáo sư đại học",
    icon: "🎓",
    level: "B2",
    partner: "Professor Williams",
    color: "#7c3aed",
    category: "Học thuật & Giáo dục",
    description: "Trao đổi với giáo sư về bài tập, đề tài nghiên cứu và học bổng.",
    tips: ["Xưng hô đúng: 'Professor/Dr. [name]'", "Lịch sự: 'I was wondering if I could discuss...'", "Theo dõi email: 'Would it be possible to schedule office hours?'"],
    script: [
      { role: "ai", text: "Come in! Ah, you must be one of my Advanced English students. How can I help you today?", vi: "Vào đi! À, bạn phải là một trong những sinh viên Tiếng Anh nâng cao của tôi. Hôm nay tôi có thể giúp gì cho bạn?" },
      { role: "user_hint", text: "Explain why you came (question about assignment, grade, or topic)", vi: "Giải thích lý do bạn đến gặp" },
      { role: "ai", text: "Good question! The research paper should be at least 3,000 words and include at least five peer-reviewed sources. Have you chosen your topic yet?", vi: "Câu hỏi hay! Bài nghiên cứu phải dài ít nhất 3.000 từ và bao gồm ít nhất năm nguồn được bình duyệt. Bạn đã chọn chủ đề chưa?" },
      { role: "user_hint", text: "Suggest your research topic and ask for feedback", vi: "Đề xuất chủ đề nghiên cứu và xin phản hồi" },
      { role: "ai", text: "That's a fascinating angle. I'd suggest looking at the work of Noam Chomsky for theoretical framework. When do you think you can submit a draft?", vi: "Đó là một góc độ hấp dẫn. Tôi đề nghị bạn xem xét các công trình của Noam Chomsky làm khung lý thuyết. Bạn nghĩ bao giờ có thể nộp bản thảo?" }
    ]
  },
  {
    id: "tech_support",
    name: "Gọi hỗ trợ kỹ thuật",
    icon: "💻",
    level: "B1",
    partner: "Tech Support Agent Tom",
    color: "#0ea5e9",
    category: "Công nghệ",
    description: "Mô tả vấn đề kỹ thuật và làm theo hướng dẫn của nhân viên hỗ trợ.",
    tips: ["Mô tả lỗi: 'My device keeps... / I'm getting an error message that says...'", "Làm theo từng bước: 'Okay, I've done that. What's next?'", "Xác nhận: 'So you mean I should...?'"],
    script: [
      { role: "ai", text: "Thank you for calling TechSupport. My name is Tom. Can I get your name and account number please?", vi: "Cảm ơn đã gọi TechSupport. Tên tôi là Tom. Cho tôi biết tên và số tài khoản của bạn nhé?" },
      { role: "user_hint", text: "Provide your account info and describe the technical issue", vi: "Cung cấp thông tin tài khoản và mô tả vấn đề kỹ thuật" },
      { role: "ai", text: "I see. That sounds like a connectivity issue. Let's try some troubleshooting steps. First, could you restart your router by unplugging it for 30 seconds?", vi: "Tôi hiểu. Nghe có vẻ như là vấn đề kết nối. Hãy thử một số bước khắc phục. Đầu tiên, bạn có thể khởi động lại router bằng cách rút phích cắm trong 30 giây không?" },
      { role: "user_hint", text: "Follow the instruction and report back (Okay, I've done that. It's still not working.)", vi: "Làm theo hướng dẫn và báo cáo lại" },
      { role: "ai", text: "Let's try the next step. Can you check if the cable connecting your router to the modem is firmly plugged in on both ends?", vi: "Hãy thử bước tiếp theo. Bạn có thể kiểm tra xem dây cáp kết nối router với modem có được cắm chặt ở cả hai đầu không?" }
    ]
  },
  {
    id: "presentation",
    name: "Thuyết trình tại công ty",
    icon: "📊",
    level: "C1",
    partner: "Board Members",
    color: "#1d4ed8",
    category: "Tiếng Anh thương mại",
    description: "Thực hành trình bày báo cáo và xử lý câu hỏi từ ban giám đốc.",
    tips: ["Mở đầu mạnh: 'Good morning, I'd like to present our Q3 results...'", "Chuyển ý: 'Moving on to... / This brings me to...'", "Xử lý câu hỏi: 'That's a great question. Let me address that...'"],
    script: [
      { role: "ai", text: "The floor is yours. Please go ahead with your presentation whenever you're ready.", vi: "Bây giờ là phần của bạn. Hãy bắt đầu bài thuyết trình khi bạn sẵn sàng." },
      { role: "user_hint", text: "Open your presentation professionally (Good morning everyone, today I will...)", vi: "Mở đầu thuyết trình chuyên nghiệp" },
      { role: "ai", text: "Thank you. Looking at slide three, I notice the revenue projection seems optimistic. What assumptions underlie this forecast?", vi: "Cảm ơn. Nhìn vào slide thứ ba, tôi thấy dự báo doanh thu có vẻ khá lạc quan. Những giả định nào làm nền tảng cho dự báo này?" },
      { role: "user_hint", text: "Address the concern professionally (The forecast is based on...)", vi: "Giải quyết mối lo ngại một cách chuyên nghiệp" },
      { role: "ai", text: "That's helpful context. One more question — what's the contingency plan if the market doesn't perform as expected?", vi: "Đó là bối cảnh hữu ích. Một câu hỏi nữa — kế hoạch dự phòng là gì nếu thị trường không hoạt động như kỳ vọng?" }
    ]
  },
  {
    id: "neighborhood",
    name: "Hỏi đường người dân địa phương",
    icon: "🗺️",
    level: "A2",
    partner: "Local Resident Jenny",
    color: "#d97706",
    category: "Du lịch & Đi lại",
    description: "Hỏi đường và nhận chỉ dẫn di chuyển từ người dân địa phương.",
    tips: ["Hỏi lịch sự: 'Excuse me, could you tell me how to get to...?'", "Xác nhận: 'So I turn left at the traffic lights, right?'", "Cảm ơn: 'Thank you so much! That's really helpful.'"],
    script: [
      { role: "ai", text: "Oh hi! You look a bit lost. Can I help you find something?", vi: "Ồ xin chào! Bạn trông có vẻ bị lạc. Tôi có thể giúp bạn tìm gì không?" },
      { role: "user_hint", text: "Ask for directions to a specific place (Excuse me, I'm trying to get to...)", vi: "Hỏi đường đến một địa điểm cụ thể" },
      { role: "ai", text: "Oh yes! It's not far at all. Go straight down this street for about two blocks, then turn right at the traffic lights.", vi: "Ồ đúng rồi! Không xa lắm đâu. Đi thẳng theo con phố này khoảng hai khu nhà, sau đó rẽ phải ở đèn giao thông." },
      { role: "user_hint", text: "Confirm the directions and ask about landmarks (Is there a landmark I should look for?)", vi: "Xác nhận chỉ dẫn và hỏi về địa danh" },
      { role: "ai", text: "You'll see a big blue sign on the corner. You can't miss it! It should take about 10 minutes on foot.", vi: "Bạn sẽ thấy một biển hiệu màu xanh lớn ở góc đường. Không thể nhầm được! Đi bộ khoảng 10 phút thôi." }
    ]
  },
  {
    id: "flatmate",
    name: "Tìm bạn ở ghép",
    icon: "🏠",
    level: "B1",
    partner: "Potential Flatmate Mark",
    color: "#16a34a",
    category: "Cuộc sống hàng ngày",
    description: "Trao đổi về chia sẻ căn hộ và các quy tắc sống chung.",
    tips: ["Hỏi về điều kiện sống: 'Is there a minimum lease period?'", "Nêu thói quen: 'I usually go to bed around 11 PM'", "Hỏi về chia sẻ hóa đơn: 'How do you split the bills?'"],
    script: [
      { role: "ai", text: "Hey! Thanks for coming to check out the apartment. I'm Mark, your potential flatmate. What do you think of the place so far?", vi: "Này! Cảm ơn bạn đã đến xem căn hộ. Tôi là Mark, người ở ghép tiềm năng của bạn. Bạn thấy nơi này thế nào?" },
      { role: "user_hint", text: "Share your first impressions and ask about the room", vi: "Chia sẻ ấn tượng đầu tiên và hỏi về phòng" },
      { role: "ai", text: "The rent is split fifty-fifty, so that's about eight hundred each per month including utilities. Are you a student or do you work?", vi: "Tiền thuê chia đôi, khoảng tám trăm mỗi người mỗi tháng bao gồm tiện ích. Bạn là sinh viên hay đi làm?" },
      { role: "user_hint", text: "Describe your situation and ask about house rules", vi: "Mô tả tình huống của bạn và hỏi về quy tắc nhà" },
      { role: "ai", text: "We keep things pretty clean around here. I cook on weekdays if you want to join for dinner sometimes. What are your working hours like?", vi: "Chúng tôi giữ mọi thứ khá gọn gàng ở đây. Tôi nấu ăn vào các ngày trong tuần nếu bạn muốn ăn tối cùng đôi khi. Giờ làm việc của bạn như thế nào?" }
    ]
  },
  {
    id: "dating",
    name: "Hẹn hò & Gặp gỡ bạn mới",
    icon: "😊",
    level: "B1",
    partner: "New Acquaintance Amy",
    color: "#f43f5e",
    category: "Giao tiếp xã hội",
    description: "Thực hành giao tiếp xã hội, kết bạn và trao đổi sở thích.",
    tips: ["Chia sẻ sở thích: 'In my free time, I love...'", "Hỏi thêm: 'That sounds interesting! Tell me more about...'", "Đề xuất hoạt động: 'We should check out that new place sometime!'"],
    script: [
      { role: "ai", text: "Hi! I don't think we've met before. I'm Amy. Are you new to this part of the city?", vi: "Xin chào! Tôi nghĩ chúng ta chưa gặp nhau. Tôi là Amy. Bạn có phải người mới đến khu vực này không?" },
      { role: "user_hint", text: "Introduce yourself and share a bit about where you're from", vi: "Tự giới thiệu và chia sẻ về bản thân" },
      { role: "ai", text: "Oh that's cool! I lived in Hanoi for two years actually. I loved the food there! What do you enjoy doing in your free time?", vi: "Ồ thú vị đấy! Tôi thực ra đã sống ở Hà Nội hai năm. Tôi rất thích đồ ăn ở đó! Bạn thích làm gì vào thời gian rảnh?" },
      { role: "user_hint", text: "Share your hobbies and ask about her interests too", vi: "Chia sẻ sở thích và hỏi về sở thích của cô ấy" },
      { role: "ai", text: "No way! I love hiking too! There's this amazing trail near the city that I've been wanting to explore. Would you be up for joining me sometime?", vi: "Thật không! Tôi cũng thích đi bộ leo núi! Có một đường mòn tuyệt vời gần thành phố mà tôi muốn khám phá. Bạn có muốn tham gia không?" }
    ]
  },
  {
    id: "conference",
    name: "Hội nghị quốc tế",
    icon: "🌐",
    level: "C1",
    partner: "International Delegate Dr. Park",
    color: "#0284c7",
    category: "Tiếng Anh thương mại",
    description: "Networking tại hội nghị quốc tế và thảo luận về xu hướng ngành.",
    tips: ["Giới thiệu chuyên nghiệp: 'Allow me to introduce myself. I'm..., representing...'", "Hỏi ý kiến: 'What's your take on the latest trends in...?'", "Kết nối: 'I'd love to keep in touch. Here's my business card.'"],
    script: [
      { role: "ai", text: "Excuse me, is this seat taken? I couldn't help but notice your name badge. You're from Vietnam? I've been fascinated by the Southeast Asian fintech scene.", vi: "Xin lỗi, chỗ này có ai ngồi không? Tôi không thể không chú ý đến thẻ tên của bạn. Bạn đến từ Việt Nam? Tôi rất bị thu hút bởi bối cảnh fintech Đông Nam Á." },
      { role: "user_hint", text: "Introduce yourself professionally and engage with their interest", vi: "Tự giới thiệu chuyên nghiệp và tương tác với mối quan tâm của họ" },
      { role: "ai", text: "That's incredibly interesting. How are Vietnamese startups approaching the challenge of financial inclusion for the unbanked population?", vi: "Điều đó thực sự thú vị. Các startup Việt Nam đang tiếp cận thách thức tài chính toàn diện cho dân số không có tài khoản ngân hàng như thế nào?" },
      { role: "user_hint", text: "Share insights about your area of expertise", vi: "Chia sẻ hiểu biết về lĩnh vực chuyên môn của bạn" },
      { role: "ai", text: "Fascinating perspective! I'd love to explore potential collaboration opportunities. Do you have a card? Perhaps we could set up a call next week?", vi: "Quan điểm thú vị! Tôi rất muốn khám phá các cơ hội hợp tác tiềm năng. Bạn có danh thiếp không? Có lẽ chúng ta có thể sắp xếp một cuộc gọi vào tuần sau?" }
    ]
  }
];

const CATEGORY_FILTERS = [
  { id: "all", label: "Tất cả", icon: "🌐" },
  { id: "Giao tiếp hàng ngày", label: "Hàng ngày", icon: "☀️" },
  { id: "Du lịch & Đi lại", label: "Du lịch", icon: "✈️" },
  { id: "Tiếng Anh thương mại", label: "Thương mại", icon: "💼" },
  { id: "Học thuật & Giáo dục", label: "Học thuật", icon: "🎓" },
  { id: "Sức khỏe & Y tế", label: "Y tế", icon: "🏥" },
  { id: "Giao tiếp xã hội", label: "Xã hội", icon: "😊" }
];

const LEVEL_COLORS = { A1: "#22c55e", A2: "#4ade80", B1: "#60a5fa", B2: "#a855f7", C1: "#f59e0b", C2: "#ef4444" };

const AI_SMART_REPLIES = {
  default: [
    { trigger: [], reply: "That's a great response! Could you elaborate a bit more?", vi: "Câu trả lời tuyệt vời! Bạn có thể giải thích thêm một chút không?" },
    { trigger: [], reply: "Interesting perspective! What made you think of that approach?", vi: "Quan điểm thú vị! Điều gì khiến bạn nghĩ đến cách tiếp cận đó?" },
    { trigger: [], reply: "I see what you mean. Let me ask you a follow-up question about that.", vi: "Tôi hiểu ý bạn. Để tôi hỏi thêm một câu hỏi liên quan đến điều đó." }
  ]
};

export default function SpeakingPracticeView() {
  const [catFilter, setCatFilter] = useState("all");
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [inputVal, setInputVal] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [scriptStep, setScriptStep] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const messagesEndRef = useRef(null);

  const filteredScenarios = catFilter === "all"
    ? SCENARIOS
    : SCENARIOS.filter(s => s.category === catFilter);

  // Init chat with first AI message when scenario changes
  useEffect(() => {
    const firstAiMsg = selectedScenario.script.find(s => s.role === "ai");
    if (firstAiMsg) {
      setMessages([{ sender: "ai", text: firstAiMsg.text, vi: firstAiMsg.vi, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }]);
      setScriptStep(1);
    }
  }, [selectedScenario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speak = (txt) => playGoogleSpeech(txt, 0.9);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setInputVal("");
    sounds.playCorrect();

    const newMsgs = [
      ...messages,
      { sender: "user", text: userText, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }
    ];
    setMessages(newMsgs);

    // Find next AI reply from script
    setTimeout(() => {
      const script = selectedScenario.script;
      let nextAiMsg = null;
      let searchStep = scriptStep;

      while (searchStep < script.length) {
        if (script[searchStep].role === "ai") {
          nextAiMsg = script[searchStep];
          setScriptStep(searchStep + 1);
          break;
        }
        searchStep++;
      }

      // If no more script, use smart generic reply
      if (!nextAiMsg) {
        const smartReplies = AI_SMART_REPLIES.default;
        nextAiMsg = smartReplies[Math.floor(Math.random() * smartReplies.length)];
        setScriptStep(0); // Loop back
      }

      const reply = nextAiMsg;
      setMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: reply.reply || reply.text,
          vi: reply.vi,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      speak(reply.reply || reply.text);
    }, 900);
  };

  const handleMicToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.lang = "en-US";
      rec.onresult = (e) => {
        setInputVal(e.results[0][0].transcript);
        setIsRecording(false);
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      rec.start();
    } else {
      setTimeout(() => {
        setIsRecording(false);
        setInputVal("I'd like to try a large cappuccino with oat milk, please.");
      }, 2500);
    }
  };

  const handleReset = () => {
    const firstAiMsg = selectedScenario.script.find(s => s.role === "ai");
    if (firstAiMsg) {
      setMessages([{ sender: "ai", text: firstAiMsg.text, vi: firstAiMsg.vi, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }]);
      setScriptStep(1);
    }
    setInputVal("");
  };

  // Get current script hint
  const currentHint = selectedScenario.script[scriptStep - 1]?.role === "user_hint"
    ? selectedScenario.script[scriptStep - 1]
    : selectedScenario.script.slice(scriptStep).find(s => s.role === "user_hint");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "860px", margin: "0 auto", width: "100%", height: "calc(100vh - 100px)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--foreground)", marginBottom: "4px" }}>
            🎙️ Luyện Nói AI Roleplay ({SCENARIOS.length} kịch bản)
          </h2>
          <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
            Thực hành phản xạ giao tiếp tự nhiên qua 15 kịch bản thực tế đa dạng với AI đồng hành
          </p>
        </div>
        <button
          onClick={() => setShowTips(!showTips)}
          className="btn-ghost"
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}
        >
          <BookOpen size={14} /> Mẹo luyện nói
        </button>
      </div>

      {/* Tips Panel */}
      {showTips && (
        <div style={{ backgroundColor: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "14px", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
            <Sparkles size={14} style={{ color: "#c084fc" }} />
            <span style={{ fontSize: "13px", fontWeight: 800, color: "#c084fc" }}>Mẹo luyện nói kịch bản "{selectedScenario.name}"</span>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
            {selectedScenario.tips.map((tip, i) => (
              <li key={i} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "var(--foreground)" }}>
                <span style={{ color: "#a855f7", fontWeight: 800 }}>{i + 1}.</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {CATEGORY_FILTERS.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCatFilter(cat.id)}
            style={{
              padding: "5px 12px",
              borderRadius: "9999px",
              border: catFilter === cat.id ? "2px solid var(--primary)" : "1px solid var(--border)",
              backgroundColor: catFilter === cat.id ? "var(--primary)" : "var(--card)",
              color: catFilter === cat.id ? "#fff" : "var(--muted-foreground)",
              fontWeight: 700,
              fontSize: "11px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Scenario Picker + Active Info */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "stretch" }}>
        {/* Scenario List */}
        <div style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          flex: 1,
          minWidth: "280px"
        }}>
          {filteredScenarios.map(sc => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "7px 14px",
                borderRadius: "10px",
                border: selectedScenario.id === sc.id ? `2px solid ${sc.color}` : "1px solid var(--border)",
                backgroundColor: selectedScenario.id === sc.id ? `${sc.color}18` : "var(--card)",
                color: selectedScenario.id === sc.id ? sc.color : "var(--muted-foreground)",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap"
              }}
            >
              <span>{sc.icon}</span>
              <span>{sc.name}</span>
              <span style={{
                fontSize: "10px",
                padding: "1px 5px",
                borderRadius: "4px",
                backgroundColor: LEVEL_COLORS[sc.level] + "22",
                color: LEVEL_COLORS[sc.level],
                fontWeight: 800
              }}>{sc.level}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Scenario Bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        backgroundColor: "var(--card)",
        border: `2px solid ${selectedScenario.color}33`,
        borderRadius: "14px",
        padding: "12px 16px",
        flexWrap: "wrap"
      }}>
        <div style={{ fontSize: "28px" }}>{selectedScenario.icon}</div>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
            <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--foreground)" }}>{selectedScenario.name}</span>
            <span style={{ fontSize: "11px", fontWeight: 800, padding: "2px 8px", borderRadius: "5px", backgroundColor: LEVEL_COLORS[selectedScenario.level] + "22", color: LEVEL_COLORS[selectedScenario.level] }}>{selectedScenario.level}</span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--muted-foreground)", margin: 0 }}>{selectedScenario.description}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: selectedScenario.color + "22", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={16} style={{ color: selectedScenario.color }} />
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--foreground)" }}>{selectedScenario.partner}</div>
            <div style={{ fontSize: "10px", color: selectedScenario.color, fontWeight: 700 }}>{selectedScenario.category}</div>
          </div>
        </div>
        <button onClick={handleReset} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--muted-foreground)" }}>
          <RotateCcw size={13} /> Bắt đầu lại
        </button>
      </div>

      {/* Chat Messages */}
      <div style={{
        flex: 1,
        backgroundColor: "var(--card)",
        border: "2px solid var(--border)",
        borderRadius: "20px",
        padding: "16px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        minHeight: "280px"
      }}>
        {messages.map((m, idx) => {
          const isAi = m.sender === "ai";
          return (
            <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start", justifyContent: isAi ? "flex-start" : "flex-end" }}>
              {isAi && (
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: selectedScenario.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${selectedScenario.color}44` }}>
                  <span style={{ fontSize: "16px" }}>{selectedScenario.icon}</span>
                </div>
              )}
              <div style={{
                maxWidth: "72%",
                backgroundColor: isAi ? "var(--muted)" : "var(--primary)",
                color: isAi ? "var(--foreground)" : "#ffffff",
                padding: "10px 14px",
                borderRadius: isAi ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                border: isAi ? "1px solid var(--border)" : "none"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, opacity: 0.6 }}>
                    {isAi ? selectedScenario.partner : "Bạn"} • {m.time}
                  </span>
                  {isAi && (
                    <button onClick={() => speak(m.text)} style={{ background: "transparent", border: "none", cursor: "pointer", color: selectedScenario.color, padding: "0 2px" }}>
                      <Volume2 size={13} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.5, marginBottom: m.vi ? "4px" : 0 }}>{m.text}</p>
                {m.vi && <p style={{ fontSize: "11px", opacity: 0.65, fontStyle: "italic", marginBottom: 0 }}>{m.vi}</p>}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Current hint display */}
      {currentHint && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(56,189,248,0.08)", border: "1px dashed #38bdf8", borderRadius: "10px", padding: "8px 14px" }}>
          <Sparkles size={13} style={{ color: "#38bdf8", flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#38bdf8" }}>💡 Gợi ý: </span>
            <span style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>{currentHint.text}</span>
          </div>
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSend} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--card)", border: "2px solid var(--border)", borderRadius: "16px", padding: "8px 12px" }}>
        <button
          type="button"
          onClick={handleMicToggle}
          style={{
            width: "38px", height: "38px", borderRadius: "50%",
            backgroundColor: isRecording ? "#ef4444" : selectedScenario.color + "22",
            color: isRecording ? "#fff" : selectedScenario.color,
            border: `2px solid ${isRecording ? "#ef4444" : selectedScenario.color + "44"}`,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            animation: isRecording ? "pulse 1s infinite" : "none",
            flexShrink: 0
          }}
          title="Nhấp để nói bằng giọng nói"
        >
          <Mic size={16} />
        </button>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={isRecording ? "🎙️ Đang lắng nghe..." : "Gõ hoặc nói câu trả lời bằng tiếng Anh..."}
          style={{ flex: 1, border: "none", outline: "none", backgroundColor: "transparent", color: "var(--foreground)", fontSize: "14px", fontWeight: 500 }}
        />

        <button type="submit" className="btn-duo btn-primary" style={{ padding: "8px 16px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", fontSize: "13px" }}>
          <Send size={14} /> Gửi
        </button>
      </form>
    </div>
  );
}
