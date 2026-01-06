const calculateSpecificTicketPrice = (
  flight,
  seatType,
  bookingDate = new Date()
) => {
  try {
    // 1. Cấu hình giá cơ bản
    const basePrices = {
      economy: 1000000,
      business: 3000000,
    };

    const departureFullStr = `${flight.departureDay}T${flight.departureTime}`;
    const arriveFullStr = `${flight.arriveDay}T${flight.arriveTime}`;

    const departureDate = new Date(departureFullStr);
    const arriveDate = new Date(arriveFullStr);

    const bookDate = new Date(bookingDate);

    // 3. Tính giá theo thời lượng bay (1 tiếng = 500k)
    const flightDurationMs = arriveDate - departureDate;
    const flightDurationHours = flightDurationMs / (1000 * 60 * 60);
    const pricePerDuration = Math.round(flightDurationHours * 500000);

    // 4. Tính giảm giá (Dựa trên khoảng cách từ lúc đặt đến lúc bay)
    const timeUntilDepartureMs = departureDate - bookDate;
    const daysUntilDeparture = timeUntilDepartureMs / (1000 * 60 * 60 * 24);

    let discountPercent = 0;
    // Logic giảm giá 5% nếu đặt trước 30 ngày
    if (daysUntilDeparture >= 30) {
      discountPercent = 0.05;
    }

    const typeKey = seatType.toLowerCase().includes("business")
      ? "business"
      : "economy";
    const basePrice = basePrices[typeKey];

    // 6. Tính toán cuối cùng
    const grossPrice = basePrice + pricePerDuration;
    const discountAmount = grossPrice * discountPercent;

    return Math.round(grossPrice - discountAmount);
  } catch (error) {
    console.error("Lỗi tính giá chi tiết:", error);
    return 0;
  }
};

module.exports = { calculateSpecificTicketPrice };
