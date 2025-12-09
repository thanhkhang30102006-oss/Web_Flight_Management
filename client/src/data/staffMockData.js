// Dữ liệu mô phỏng bảng `flightinformations`


// Dữ liệu mô phỏng Join giữa `tickets`, `passengers`, và `payments`
export const DB_TICKETS = [
  { 
    ticketID: "TK-001", passengerName: "Phan Thanh Khang", 
    flightNumber: "VN001", seatNumber: "12A", 
    ticketBookTime: "2025-12-01 10:00:00", ticketState: "valid", 
    paymentPrice: "1250000.00" 
  },
  { 
    ticketID: "TK-002", passengerName: "Hà Điền Trung Hiếu", 
    flightNumber: "QH111", seatNumber: "05B", 
    ticketBookTime: "2025-12-04 06:26:04", ticketState: "valid", 
    paymentPrice: "2125000.00" 
  },
  { 
    ticketID: "TK-003", passengerName: "Nguyen Van C", 
    flightNumber: "QH203", seatNumber: "10C", 
    ticketBookTime: "2025-12-05 08:30:00", ticketState: "cancelled", 
    paymentPrice: "0.00" 
  },
];

export const MOCK_REVENUE_WEEKLY = [
  { day: "T2", revenue: 120000000 },
  { day: "T3", revenue: 98000000 },
  { day: "T4", revenue: 150000000 },
  { day: "T5", revenue: 110000000 },
  { day: "T6", revenue: 210000000 },
  { day: "T7", revenue: 250000000 },
  { day: "CN", revenue: 230000000 },
];


const generateRealisticFlights = () => {
  const flights = [];
  const airlines = ["VN", "VJ", "QH", "VU"];
  const routes = [
    { dep: "HAN", arr: "SGN" }, { dep: "SGN", arr: "HAN" },
    { dep: "DAD", arr: "SGN" }, { dep: "HAN", arr: "DAD" },
    { dep: "SGN", arr: "PQC" }, { dep: "HPH", arr: "SGN" }
  ];

  // Cấu hình tỉ trọng chuyến bay theo khung giờ (Total ~ 100%)
  const hoursDistribution = [
    { start: 0, end: 5, prob: 0.05 },   // Đêm: 5%
    { start: 6, end: 9, prob: 0.25 },   // Sáng: 25% (Cao điểm)
    { start: 10, end: 15, prob: 0.30 }, // Trưa: 30%
    { start: 16, end: 19, prob: 0.25 }, // Chiều: 25% (Cao điểm)
    { start: 20, end: 23, prob: 0.15 }, // Tối: 15%
  ];

  const totalFlights = 60; // Giả lập 60 chuyến/ngày

  for (let i = 0; i < totalFlights; i++) {
    // 1. Chọn khung giờ dựa trên xác suất
    const rand = Math.random();
    let cumulativeProb = 0;
    let selectedPeriod = hoursDistribution[hoursDistribution.length - 1];

    for (const period of hoursDistribution) {
      cumulativeProb += period.prob;
      if (rand <= cumulativeProb) {
        selectedPeriod = period;
        break;
      }
    }

    // 2. Random giờ phút cụ thể trong khung đã chọn
    const hour = Math.floor(Math.random() * (selectedPeriod.end - selectedPeriod.start + 1)) + selectedPeriod.start;
    const minute = Math.floor(Math.random() * 60);
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

    // 3. Random thông tin khác
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const route = routes[Math.floor(Math.random() * routes.length)];
    const number = Math.floor(100 + Math.random() * 900);

    flights.push({
      flightNumber: `${airline}${number}`,
      departurePoint: route.dep,
      arrivePoint: route.arr,
      departureTime: timeString,
      planeType: Math.random() > 0.5 ? "Airbus A321" : "Boeing 787",
      flightState: Math.random() > 0.9 ? "delayed" : (Math.random() > 0.95 ? "cancelled" : "active")
    });
  }

  // Sắp xếp theo giờ bay
  return flights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
};

// Xuất dữ liệu
export const DB_FLIGHTS = generateRealisticFlights();