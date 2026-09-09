import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ieltsExamsData } from "../src/data/ieltsExamsData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Authentic IELTS Scenarios Bank
const scenarios = [
  {
    theme: "Holiday & Travel Booking",
    sec1: [
      { prompt: "Customer Name: Arthur [ ___________ ]", answer: "Pendelton", audio: "Customer: My name is Arthur Pendelton, that is P-E-N-D-E-L-T-O-N.", expl: "Người nói đánh vần rõ họ: P-E-N-D-E-L-T-O-N." },
      { prompt: "Contact Telephone: [ ___________ ]", answer: "07700900461", audio: "Agent: And your mobile number? Customer: It is 07700 900461.", expl: "Số điện thoại liên lạc: 07700900461." },
      { prompt: "Preferred Seat Type: [ ___________ ] seat", answer: "aisle", audio: "Agent: What seating do you prefer? Customer: I always prefer an aisle seat if possible.", expl: "Ghế cạnh lối đi (aisle seat)." },
      { prompt: "Date of Departure: 14th of [ ___________ ]", answer: "October", audio: "Customer: I would like to depart on the 14th of October.", expl: "Tháng khởi hành: October (tháng 10)." },
      { prompt: "Total Number of Travelers: [ ___________ ] adults", answer: "2", audio: "Agent: How many travelers? Customer: Just 2 adults, myself and my wife.", expl: "Số lượng hành khách: 2 người lớn." },
      { prompt: "Special Meal Requirement: [ ___________ ]", answer: "vegetarian", audio: "Customer: My wife requires a vegetarian meal for both flights.", expl: "Bữa ăn ăn chay: vegetarian." },
      { prompt: "Luggage Allowance: Up to [ ___________ ] kg per person", answer: "25", audio: "Agent: The standard ticket includes 25 kg of checked luggage.", expl: "Hành lý ký gửi tối đa: 25 kg." },
      { prompt: "Booking Reference: [ ___________ ]", answer: "SYD782", audio: "Agent: Your reference number is S-Y-D-7-8-2.", expl: "Mã đặt chỗ: SYD782." }
    ],
    sec2: [
      { prompt: "Where will the guided walking tour begin?", options: ["The City Clock Tower", "The Visitor Information Pavilion", "The Central Railway Platform", "The Riverfront Pier"], correct: "B", audio: "Tour guide: Welcome everyone! Please assemble right outside the Visitor Information Pavilion where our guide will hand out audio headsets.", expl: "Địa điểm tập trung: Visitor Information Pavilion." },
      { prompt: "Which exhibition hall is closed for renovation this weekend?", options: ["Modern Art Wing", "Natural History Gallery", "Ancient Egyptian Artifacts", "Maritime Technology"], correct: "C", audio: "Guide: Please note that the Ancient Egyptian Artifacts hall is temporarily closed for renovation until next Tuesday.", expl: "Khu vực đang bảo trì: Ancient Egyptian Artifacts." },
      { prompt: "What item is strictly prohibited inside the historic cathedral?", options: ["Bottled mineral water", "Professional camera flash equipment", "Compact umbrellas", "Audio tour headphones"], correct: "B", audio: "Guide: Photography is permitted, but professional camera flash equipment is strictly prohibited inside to protect the centuries-old murals.", expl: "Cấm đèn flash máy ảnh chuyên nghiệp (professional camera flash equipment)." },
      { prompt: "At what time does the sunset boat cruise depart?", options: ["4:30 PM", "5:15 PM", "6:00 PM", "6:45 PM"], correct: "B", audio: "Guide: The boat cruise embarks promptly at 5:15 PM from Pier 4.", expl: "Tàu khởi hành lúc 5:15 chiều." },
      { prompt: "Children under the age of 12 receive what discount?", options: ["20% off regular admission", "50% off regular admission", "Completely free entry", "Free hot chocolate only"], correct: "B", audio: "Guide: Family tickets are available, and children under 12 receive a 50% discount on regular adult admission.", expl: "Trẻ dưới 12 tuổi giảm 50% (50% off)." },
      { prompt: "Where should visitors leave large backpacks?", options: ["In the bus luggage bay", "In the electronic lockers by reception", "With the security guard", "Inside the souvenir cafe"], correct: "B", audio: "Guide: Large rucksacks must be stowed in the electronic lockers beside the main reception desk.", expl: "Gửi balo tại tủ khóa điện tử cạnh quầy lễ tân (electronic lockers)." },
      { prompt: "What special souvenir is given to all tour participants?", options: ["A handcrafted ceramic magnet", "A botanical watercolor postcard", "A leather luggage tag", "A guidebook to heritage architecture"], correct: "B", audio: "Guide: At the end of today's tour, each guest will receive a commemorative botanical watercolor postcard.", expl: "Quà lưu niệm: botanical watercolor postcard." }
    ],
    sec3: [
      { prompt: "What is the primary objective of Mark and Elena's research proposal?", options: ["To analyze microplastic concentration in urban rivers", "To survey renewable energy adoption in suburban homes", "To measure pedestrian traffic impact on retail sales", "To evaluate recycling habits among university students"], correct: "A", audio: "Elena: Professor Davis suggested we focus our primary research objective on measuring microplastic concentration along urban riverbanks.", expl: "Mục tiêu chính: Phân tích nồng độ vi nhựa ở sông đô thị (microplastic concentration)." },
      { prompt: "Why did Mark suggest revising their water sampling methodology?", options: ["The equipment was too heavy to carry", "The initial sample size was statistically insignificant", "Water levels fluctuated unpredictably during monsoon", "Laboratory processing fees exceeded the student grant"], correct: "B", audio: "Mark: After looking at similar studies, I realized taking samples from only three locations was statistically insignificant. We need at least ten sites.", expl: "Lý do sửa đổi: Cỡ mẫu ban đầu chưa có ý nghĩa thống kê (statistically insignificant)." },
      { prompt: "Which laboratory apparatus must they book two weeks in advance?", options: ["The mass spectrometer", "The infrared microscope", "The centrifuge separator", "The optical spectrometer"], correct: "A", audio: "Elena: Remember the department technician said the mass spectrometer gets booked up fast; we have to reserve it two weeks ahead.", expl: "Thiết bị cần đặt trước 2 tuần: mass spectrometer." },
      { prompt: "How will the students divide the report writing tasks?", options: ["Elena writes the literature review while Mark compiles the raw data", "Mark writes the introduction while Elena presents the findings", "They will both write all sections collaboratively", "Mark handles ethics clearance while Elena drafts the conclusion"], correct: "A", audio: "Mark: I think it is best if you handle the literature review since you have already read all the papers, and I will compile the raw data spreadsheets.", expl: "Elena phụ trách tổng quan tài liệu, Mark phụ trách tổng hợp bảng dữ liệu." },
      { prompt: "What deadline did Professor Davis set for the first draft submission?", options: ["Friday, November 12th", "Wednesday, November 17th", "Monday, November 22nd", "Friday, December 3rd"], correct: "C", audio: "Elena: Don't forget, Professor Davis wants our first full draft in his inbox by 5 PM on Monday, November 22nd.", expl: "Hạn chót nộp bản thảo đầu tiên: Monday, November 22nd." },
      { prompt: "What was the main ethical concern raised during ethics approval?", options: ["Disposal of hazardous chemical reagents", "Safety protocols while collecting water samples at night", "Consent forms for interviewing local anglers", "Publishing location data of protected bird habitats"], correct: "B", audio: "Mark: The ethics committee flagged safety protocols because we initially planned to collect samples after sunset near slippery embankments.", expl: "Lo ngại an toàn khi lấy mẫu vào ban đêm cạnh bờ trơn trượt." },
      { prompt: "What percentage of their final grade does this project account for?", options: ["20%", "30%", "40%", "50%"], correct: "C", audio: "Elena: Let's do our best, this project contributes a massive 40% towards our environmental chemistry module grade.", expl: "Chiếm 40% điểm tổng kết (40%)." }
    ],
    sec4: [
      { prompt: "Topic of today's academic lecture: Architectural Evolution of [ ___________ ]", answer: "bridges", audio: "Lecturer: Good morning class. Today we shall examine the architectural evolution and engineering principles behind historic suspension bridges.", expl: "Chủ đề bài giảng: Cầu treo (bridges)." },
      { prompt: "Key material breakthrough in the 19th century: [ ___________ ]", answer: "steel", audio: "Lecturer: The turning point occurred when wrought iron was superseded by high-tensile steel cables, allowing unprecedented spans.", expl: "Vật liệu đột phá: Thép (steel)." },
      { prompt: "Primary aerodynamic force causing structural resonance: [ ___________ ]", answer: "wind", audio: "Lecturer: Engineers in the early twentieth century failed to anticipate the destructive torsional oscillations generated by steady wind.", expl: "Lực khí động học: Gió (wind)." },
      { prompt: "Famous bridge failure in 1940: [ ___________ ] Narrows Bridge", answer: "Tacoma", audio: "Lecturer: The most infamous example remains the catastrophic collapse of the Tacoma Narrows Bridge in Washington State.", expl: "Cây cầu sập năm 1940: Tacoma." },
      { prompt: "Modern damping systems utilize hydraulic [ ___________ ]", answer: "shock absorbers", audio: "Lecturer: Modern mega-bridges install tuned mass dampers coupled with hydraulic shock absorbers to neutralize seismic and wind vibrations.", expl: "Bộ phận giảm xóc thủy lực (shock absorbers)." },
      { prompt: "Average lifespan expected from modern composite cables: [ ___________ ] years", answer: "100", audio: "Lecturer: Contemporary carbon-fiber cables are engineered to resist corrosion for a design lifespan exceeding 100 years.", expl: "Tuổi thọ dự kiến: 100 năm (100)." },
      { prompt: "Main sensor technology used for continuous health monitoring: [ ___________ ] sensors", answer: "fiber optic", audio: "Lecturer: Maintenance teams now embed fiber optic sensors directly inside the tarmac and steel deck to detect microscopic hairline fractures.", expl: "Cảm biến sợi quang (fiber optic sensors)." },
      { prompt: "Next week's reading assignment focuses on [ ___________ ] tunnels", answer: "underwater", audio: "Lecturer: For our next seminar, please complete the chapter on submerged underwater tunnels.", expl: "Đọc về đường hầm dưới nước (underwater tunnels)." }
    ]
  },
  {
    theme: "Student Campus Accommodation & Facilities",
    sec1: [
      { prompt: "Student ID Number: [ ___________ ]", answer: "ST78492", audio: "Admin: What is your registered student number? Student: It is S-T-7-8-4-9-2.", expl: "Mã số sinh viên: ST78492." },
      { prompt: "Room Preference: [ ___________ ] with en-suite bathroom", answer: "single", audio: "Student: I am looking for a single room with private en-suite bathroom.", expl: "Phòng đơn: single." },
      { prompt: "Preferred Residence Hall: [ ___________ ] Court", answer: "Wellington", audio: "Admin: Which hall do you fancy? Student: Wellington Court is closest to my laboratory.", expl: "Tên ký túc xá: Wellington Court." },
      { prompt: "Rental Period: [ ___________ ] months", answer: "9", audio: "Student: I only need accommodation for the standard academic year, which is 9 months.", expl: "Thời hạn thuê: 9 tháng." },
      { prompt: "Weekly Rent Rate: £[ ___________ ] per week", answer: "165", audio: "Admin: Single en-suite rooms at Wellington are currently £165 per week including utility bills.", expl: "Giá thuê mỗi tuần: £165." },
      { prompt: "Deposit Amount: £[ ___________ ]", answer: "250", audio: "Admin: A refundable damage deposit of £250 is required before key handover.", expl: "Tiền đặt cọc: £250." },
      { prompt: "Emergency Contact Name: [ ___________ ] Davis", answer: "Rachel", audio: "Student: My emergency contact is my sister, Rachel Davis.", expl: "Tên người liên hệ khẩn cấp: Rachel." },
      { prompt: "Key collection appointment date: [ ___________ ] September", answer: "18th", audio: "Admin: We can arrange key collection on the 18th of September.", expl: "Ngày nhận chìa khóa: 18th September." }
    ],
    sec2: [
      { prompt: "What is the primary focus of the new campus sports complex?", options: ["Elite competitive athletics only", "Community health, fitness and student wellness", "Hosting national basketball tournaments", "Commercial fitness trainer certification"], correct: "B", audio: "Presenter: Our vision for the newly opened sports complex is centered firmly on community health, inclusive student fitness, and mental wellness.", expl: "Mục tiêu trọng tâm: Sức khỏe cộng đồng và thể chất sinh viên." },
      { prompt: "Which facility requires advance online booking via the campus app?", options: ["The cardio running track", "The Olympic swimming lanes", "The squash and badminton courts", "The weightlifting free-zone"], correct: "C", audio: "Presenter: While the general gym floor is walk-in, the squash and badminton courts must be booked at least 24 hours in advance via the mobile app.", expl: "Phải đặt trước: Squash and badminton courts." },
      { prompt: "What time does the swimming pool open on Saturday mornings?", options: ["6:00 AM", "7:30 AM", "8:00 AM", "9:00 AM"], correct: "B", audio: "Presenter: On weekends, the swimming pool opens slightly later at 7:30 AM for early bird lane swimming.", expl: "Mở cửa lúc 7:30 AM sáng thứ Bảy." },
      { prompt: "What safety equipment is provided free of charge for bouldering wall users?", options: ["Chalk bags and climbing shoes", "Safety helmets and harnesses", "Wrist guards and knee pads", "Belay certification cards"], correct: "B", audio: "Presenter: All climbers can borrow safety helmets and certified harnesses free of charge from the equipment desk.", expl: "Cung cấp miễn phí mũ bảo hiểm và đai an toàn (helmets and harnesses)." },
      { prompt: "Student annual sports membership fee is priced at:", options: ["£45", "£85", "£120", "£150"], correct: "B", audio: "Presenter: Full annual student membership is heavily subsidized at just £85 for the entire twelve months.", expl: "Học phí hội viên thường niên cho sinh viên: £85." },
      { prompt: "Where is the physiotherapist clinic located inside the center?", options: ["Next to the main reception cafe", "On the second floor beside studio 3", "In the basement adjacent to locker rooms", "In the outdoor pavilion"], correct: "B", audio: "Presenter: If you sustain a minor injury, our accredited physiotherapist clinic is situated on the second floor right beside studio 3.", expl: "Phòng vật lý trị liệu ở tầng 2 cạnh studio 3." },
      { prompt: "What healthy option is offered at the smoothie bar after 5 PM?", options: ["Free protein booster shots", "Half-price recovery bowls", "Free electrolyte replenishment pouches", "Buy-one-get-one organic smoothies"], correct: "A", audio: "Presenter: Every weekday evening after 5 PM, members can request a free protein booster shot with any smoothie order.", expl: "Tặng kèm protein booster shot sau 5 giờ chiều." }
    ],
    sec3: [
      { prompt: "What topic has Julian selected for his psychology dissertation?", options: ["Cognitive decline in aging demographics", "The psychological impact of remote working on corporate teams", "Sleep architecture and memory consolidation in adolescents", "The influence of social media algorithms on attention span"], correct: "C", audio: "Julian: After reviewing recent neuroimaging papers, I have settled on sleep architecture and memory consolidation in adolescents.", expl: "Đề tài: Cấu trúc giấc ngủ và củng cố trí nhớ ở thanh thiếu niên." },
      { prompt: "What difficulty did Sarah anticipate with the participant recruitment?", options: ["Obtaining parental consent forms", "Reimbursing participants travel expenses", "Lacking sufficient EEG monitoring headsets", "Scheduling testing sessions during school exam periods"], correct: "A", audio: "Sarah: Because the participants are minors between 14 and 17, obtaining formal parental consent forms will require significant administrative effort.", expl: "Khó khăn xin giấy chấp thuận từ phụ huynh (parental consent forms)." },
      { prompt: "How many volunteers do they need for statistical validity?", options: ["25 participants", "40 participants", "60 participants", "100 participants"], correct: "B", audio: "Julian: Our power analysis calculation indicates we need a cohort of exactly 40 participants divided into experimental and control groups.", expl: "Số lượng người tham gia yêu cầu: 40 người." },
      { prompt: "What instrument will be used to record overnight brain wave activity?", options: ["Portable multi-channel EEG caps", "Smart wristband heart rate monitors", "Functional MRI brain scanning", "Sleep diary questionnaire logs"], correct: "A", audio: "Julian: The department recently acquired five portable multi-channel EEG caps that subjects can comfortably wear in their own beds.", expl: "Thiết bị ghi sóng não: Portable multi-channel EEG caps." },
      { prompt: "Why does Sarah advise against testing subjects during exam week?", options: ["Stress hormones will distort natural cortisol and melatonin baselines", "Students will be too busy to attend morning interviews", "The university laboratory closes during revision week", "EEG sensors produce noise during high anxiety"], correct: "A", audio: "Sarah: Testing during exams is problematic because elevated cortisol and stress hormones completely distort baseline sleep cycles.", expl: "Nồng độ cortisol do căng thẳng thi cử làm sai lệch kết quả sinh học." },
      { prompt: "When is their ethical proposal due for faculty review?", options: ["October 15th", "October 30th", "November 10th", "November 25th"], correct: "B", audio: "Julian: The ethics board deadline is October 30th, so we must finalize our risk assessment before then.", expl: "Hạn nộp đề cương đạo đức: October 30th." },
      { prompt: "What grant has Julian applied for to support the study?", options: ["The British Neuroscience Student Bursary", "The University Innovation Seed Fund", "The National Mental Health Fellowship", "The Chancellor's Research Travel Award"], correct: "B", audio: "Julian: I submitted an application for the University Innovation Seed Fund, which could provide up to £1,500 for honorariums.", expl: "Gói tài trợ University Innovation Seed Fund (£1,500)." }
    ],
    sec4: [
      { prompt: "Lecture theme: The Evolutionary Biology of Marine [ ___________ ]", answer: "mammals", audio: "Lecturer: Today we examine the remarkable evolutionary journey of marine mammals, specifically tracing how terrestrial quadrupeds transitioned into ocean dwellers.", expl: "Chủ đề: Động vật có vú ở biển (marine mammals)." },
      { prompt: "Earliest known ancestor of modern cetaceans: [ ___________ ]", answer: "Pakicetus", audio: "Lecturer: Fossil discoveries in Pakistan revealed Pakicetus, a wolf-like four-legged ungulate that lived approximately 50 million years ago.", expl: "Tổ tiên sớm nhất: Pakicetus." },
      { prompt: "Skeletal evidence showing vestigial [ ___________ ] bones inside whale blubber", answer: "pelvis", audio: "Lecturer: An unmistakable clue is the vestigial pelvis and hind limb bones buried deep within modern whale blubber.", expl: "Xương chậu thoái hóa (vestigial pelvis)." },
      { prompt: "Physiological adaptation: High concentration of [ ___________ ] in muscle tissue", answer: "myoglobin", audio: "Lecturer: To endure hour-long deep dives, marine mammals possess extraordinary concentrations of myoglobin in their muscle tissue.", expl: "Protein dự trữ oxy trong cơ: myoglobin." },
      { prompt: "Acoustic navigation mechanism: [ ___________ ]", answer: "echolocation", audio: "Lecturer: Odontocetes like dolphins produce high-frequency clicks channeled through the melon for echolocation.", expl: "Cơ chế định vị bằng tiếng vang: echolocation." },
      { prompt: "Main modern threat highlighted by the speaker: underwater [ ___________ ] pollution", answer: "noise", audio: "Lecturer: Commercial shipping, naval sonar, and seismic airguns have generated catastrophic levels of underwater noise pollution.", expl: "Ô nhiễm tiếng ồn dưới nước (underwater noise pollution)." },
      { prompt: "Maximum diving depth recorded for Cuvier's beaked whale: nearly [ ___________ ] meters", answer: "3000", audio: "Lecturer: Scientists recorded Cuvier's beaked whale diving to an astonishing depth of nearly 3,000 meters.", expl: "Độ sâu lặn kỷ lục: gần 3000 mét (3000)." },
      { prompt: "Recommended reading for next tutorial: Chapter [ ___________ ] of Ocean Ecology", answer: "7", audio: "Lecturer: Make sure to thoroughly study Chapter 7 before Friday's seminar.", expl: "Đọc chương 7 (Chapter 7)." }
    ]
  },
  {
    theme: "Environmental Science & Wildlife Conservation",
    sec1: [
      { prompt: "Volunteer Applicant Name: David [ ___________ ]", answer: "Callaghan", audio: "Staff: May I take your full name? Applicant: David Callaghan, that is C-A-L-L-A-G-H-A-N.", expl: "Họ người đăng ký tình nguyện: Callaghan." },
      { prompt: "Preferred Volunteer Task: Forest [ ___________ ]", answer: "restoration", audio: "Applicant: I am keen on hands-on environmental work, particularly native forest restoration.", expl: "Công việc tình nguyện: Forest restoration (phục hồi rừng)." },
      { prompt: "Availability: Every [ ___________ ] morning", answer: "Saturday", audio: "Applicant: I work full-time during weekdays, so I can commit every Saturday morning.", expl: "Thời gian rảnh: Mỗi sáng thứ Bảy (Saturday)." },
      { prompt: "Valid First Aid Certificate held? [ ___________ ] (Yes/No)", answer: "Yes", audio: "Staff: Do you hold a current first aid qualification? Applicant: Yes, I renewed it last spring.", expl: "Đã có chứng chỉ sơ cấp cứu: Yes." },
      { prompt: "Dietary Preference for lunch: [ ___________ ]", answer: "vegan", audio: "Applicant: I adhere to a strict vegan diet.", expl: "Chế độ ăn: vegan (thuần chay)." },
      { prompt: "Emergency Phone Contact: [ ___________ ]", answer: "07899124560", audio: "Applicant: You can reach my brother at 07899 124560.", expl: "Số liên hệ khẩn cấp: 07899124560." },
      { prompt: "Shoe Size for work safety boots: UK size [ ___________ ]", answer: "9", audio: "Staff: What size safety boots should we prepare? Applicant: UK size 9 fits me well.", expl: "Cỡ giày bảo hộ: UK size 9." },
      { prompt: "Induction training date: 5th of [ ___________ ]", answer: "August", audio: "Staff: The mandatory volunteer induction takes place on the 5th of August.", expl: "Ngày tập huấn nhập môn: 5th of August." }
    ],
    sec2: [
      { prompt: "Where is the new wildlife rescue sanctuary located?", options: ["Beside the coastal wetland estuary", "Adjacent to Pine Ridge Nature Reserve", "Inside the old botanical greenhouse", "Near the municipal reservoir dam"], correct: "B", audio: "Ranger: Our newly established sanctuary is situated immediately adjacent to the Pine Ridge Nature Reserve.", expl: "Vị trí khu bảo tồn: Ngay cạnh Pine Ridge Nature Reserve." },
      { prompt: "What animal is the primary patient at the clinic this season?", options: ["Injured coastal seabirds", "Orphaned red squirrels", "European hedgehogs", "Barn owls and raptors"], correct: "C", audio: "Ranger: Due to early autumn gardening and road traffic, European hedgehogs comprise nearly 70% of our patient intake.", expl: "Loài động vật cần cứu hộ nhiều nhất: Nhím châu Âu (European hedgehogs)." },
      { prompt: "How can members of the public assist without visiting the site?", options: ["Sponsoring an animal recovery enclosure online", "Sending homemade blankets through the post", "Setting humane traps in their backyards", "Broadcasting radio awareness ads"], correct: "A", audio: "Ranger: Supporters can sponsor an individual recovery enclosure through our secure website for £10 a month.", expl: "Tài trợ chuồng phục hồi qua website (£10/tháng)." },
      { prompt: "What should someone do if they discover an orphaned baby animal?", options: ["Feed it warm cow milk immediately", "Place it in a quiet cardboard box with a warm towel and call the rescue hotline", "Bring it to the local police department", "Release it back into dense forest bushes"], correct: "B", audio: "Ranger: Never feed wild animals kitchen milk. Carefully place the animal in a ventilated box with a warm towel and ring our emergency hotline.", expl: "Đặt vào hộp thông gió với khăn ấm và gọi đường dây nóng." },
      { prompt: "Sanctuary open visiting hours for registered school groups:", options: ["Tuesday and Thursday mornings", "Every weekday afternoon from 1 PM to 4 PM", "Saturday morning only", "Sunday during feeding demonstrations"], correct: "B", audio: "Ranger: Pre-booked school educational tours run every weekday afternoon from 1 PM to 4 PM.", expl: "Giờ tham quan cho trường học: Các buổi chiều trong tuần từ 1 PM đến 4 PM." },
      { prompt: "What is the name of the sanctuary's resident mascot owl?", options: ["Barnaby", "Whisper", "Orion", "Pip"], correct: "A", audio: "Ranger: Barnaby, our blind rescue barn owl, has become the beloved mascot of our education center.", expl: "Tên cú mèo linh vật: Barnaby." },
      { prompt: "What volunteer task requires completing a 3-week veterinary training module?", options: ["Mending boundary fences", "Assisting in the veterinary rehabilitation ward", "Leading visitor gift shop sales", "Preparing daily fruit feed trays"], correct: "B", audio: "Ranger: Anyone wishing to assist veterinary nurses in the intensive rehabilitation ward must first complete our three-week training module.", expl: "Trợ lý phòng điều trị hồi sức thú y (veterinary rehabilitation ward)." }
    ],
    sec3: [
      { prompt: "What specific aspect of urban heat islands is Liam investigating?", options: ["Roof surface materials and thermal radiation", "Tree canopy density in high-density housing estates", "Asphalt road temperature versus underground subway vents", "Air-conditioning exhaust dispersion in narrow alleyways"], correct: "B", audio: "Liam: My focus is quantifying how differing densities of native street tree canopies mitigate temperature spikes in high-density housing estates.", expl: "Khảo sát mật độ tán cây xanh tại khu nhà ở mật độ cao." },
      { prompt: "What data collection tool will Liam deploy across 12 urban districts?", options: ["Infrared thermal imaging drones", "Calibrated wireless microclimate temperature loggers", "Handheld mercury thermometers", "Satellite spectral imaging feeds"], correct: "B", audio: "Liam: I have secured twelve calibrated wireless microclimate loggers that record temperature and relative humidity every fifteen minutes.", expl: "Máy ghi dữ liệu vi khí hậu không dây tự động (wireless microclimate loggers)." },
      { prompt: "Why did Dr. Chen suggest excluding commercial shopping districts from the study?", options: ["Heavy foot traffic increases risk of sensor theft", "Tall glass skyscrapers reflect sunlight irregularly, introducing confounding variables", "Pedestrian permission permits are difficult to obtain", "Air quality monitors are already installed by the city council"], correct: "B", audio: "Dr. Chen: Reflective architectural glass in commercial towers creates extreme localized glare and irregular thermal anomalies that could bias your data.", expl: "Kính phản quang từ các tòa cao ốc thương mại tạo sai số nhiệt cục bộ." },
      { prompt: "How long will the continuous sensor deployment phase last?", options: ["Two weeks during July heatwaves", "Six continuous weeks through mid-summer", "Three months across summer and autumn", "One full calendar year"], correct: "B", audio: "Liam: The sensor logging will operate without interruption for six continuous weeks during peak summer heat.", expl: "Thời gian triển khai cảm biến: 6 tuần liên tục (six continuous weeks)." },
      { prompt: "What statistical software package will Liam use for regression modeling?", options: ["SPSS Statistics", "R Studio with spatial analysis packages", "Python Jupyter Notebooks with Pandas", "GraphPad Prism"], correct: "B", audio: "Liam: I plan to run the multi-variable regression models in R Studio using open-source geospatial packages.", expl: "Phần mềm phân tích: R Studio với các gói phân tích không gian." },
      { prompt: "Who is providing funding for Liam's sensor equipment batteries?", options: ["The City Municipal Sustainability Grant", "The Departmental Undergraduate Bursary", "An independent meteorological charity", "The Environmental Protection Agency"], correct: "A", audio: "Liam: The municipal sustainability grant awarded me £600 specifically to cover long-life lithium battery packs and mounting brackets.", expl: "Nguồn tài trợ: City Municipal Sustainability Grant." },
      { prompt: "When does Liam plan to present his preliminary findings to the city council?", options: ["Early September", "Late October", "Mid-December", "Next March"], correct: "B", audio: "Liam: The urban planning committee invited me to present preliminary findings at their public policy session in late October.", expl: "Báo cáo sơ bộ vào cuối tháng 10 (late October)." }
    ],
    sec4: [
      { prompt: "Topic of the lecture: Global Migration of [ ___________ ] Birds", answer: "migratory", audio: "Lecturer: Today we shall explore the aerodynamic efficiency and magnetic navigational systems of migratory birds.", expl: "Chủ đề bài giảng: Chim di cư (migratory birds)." },
      { prompt: "Navigational organ containing cryptochrome proteins: the [ ___________ ]", answer: "eye", audio: "Lecturer: Groundbreaking biophysical research showed that cryptochrome pigments in the avian eye enable birds to visually perceive Earth's magnetic field lines.", expl: "Cơ quan thị giác cảm nhận từ trường: the eye (mắt)." },
      { prompt: "Fuel storage: Migratory birds double their body [ ___________ ] before long flights", answer: "fat", audio: "Lecturer: To prepare for non-stop oceanic crossings, songbirds gorge on berries and double their body fat in less than ten days.", expl: "Tích trữ năng lượng bằng mỡ cơ thể: fat." },
      { prompt: "Record holder for longest non-stop migration flight: Bar-tailed [ ___________ ]", answer: "Godwit", audio: "Lecturer: The undisputed champion is the Bar-tailed Godwit, which flies 11,000 kilometers non-stop across the Pacific Ocean from Alaska to New Zealand.", expl: "Loài chim bay không nghỉ dài nhất: Bar-tailed Godwit." },
      { prompt: "Number of consecutive days spent airborne without landing: [ ___________ ] days", answer: "11", audio: "Lecturer: Satellite tags confirmed the godwit stayed airborne for eleven consecutive days and nights without touching ground or water.", expl: "Số ngày bay liên tục: 11 ngày (11)." },
      { prompt: "Impact of light pollution: Birds become disoriented by illuminated [ ___________ ] towers", answer: "communication", audio: "Lecturer: Night-flying migrants get attracted and trapped by the glare of illuminated radio and communication towers, resulting in lethal collisions.", expl: "Tháp viễn thông phát sáng ban đêm gây tai nạn: communication towers." },
      { prompt: "International conservation treaty: The Ramsar Convention on [ ___________ ]", answer: "Wetlands", audio: "Lecturer: Preserving coastal stopover mudflats requires international enforcement of the Ramsar Convention on Wetlands.", expl: "Công ước quốc tế Ramsar về vùng đất ngập nước: Wetlands." },
      { prompt: "Students must submit their summary essay by next [ ___________ ]", answer: "Thursday", audio: "Lecturer: Your three-page critical review of migration telemetry is due next Thursday at noon.", expl: "Nộp bài luận trước thứ Năm tuần sau (Thursday)." }
    ]
  }
];

let totalQ = 0;
ieltsExamsData.forEach((book, bookIdx) => {
  book.exams.forEach((exam, examIdx) => {
    const scenario = scenarios[(bookIdx * 4 + examIdx) % scenarios.length];
    const allQ = [];
    let qCount = 1;

    scenario.sec1.forEach((item) => {
      allQ.push({
        id: qCount++,
        section: "Section 1",
        type: "fill",
        prompt: item.prompt,
        answer: item.answer,
        audioText: item.audio,
        explanation: item.expl
      });
    });

    scenario.sec2.forEach((item) => {
      allQ.push({
        id: qCount++,
        section: "Section 2",
        type: "choice",
        prompt: item.prompt,
        options: item.options,
        correct: item.correct,
        audioText: item.audio,
        explanation: item.expl
      });
    });

    scenario.sec3.forEach((item) => {
      allQ.push({
        id: qCount++,
        section: "Section 3",
        type: "choice",
        prompt: item.prompt,
        options: item.options,
        correct: item.correct,
        audioText: item.audio,
        explanation: item.expl
      });
    });

    scenario.sec4.forEach((item) => {
      allQ.push({
        id: qCount++,
        section: "Section 4",
        type: "fill",
        prompt: item.prompt,
        answer: item.answer,
        audioText: item.audio,
        explanation: item.expl
      });
    });

    exam.sampleQuestions = allQ;
    exam.questionsCount = allQ.length;
    totalQ += allQ.length;
  });
});

console.log(`Generated ${totalQ} questions across ${ieltsExamsData.length} books!`);
const targetPath = path.join(__dirname, "../src/data/ieltsExamsData.js");
fs.writeFileSync(targetPath, "export const ieltsExamsData = " + JSON.stringify(ieltsExamsData, null, 2) + ";\n", "utf8");
console.log("Written successfully to:", targetPath);
