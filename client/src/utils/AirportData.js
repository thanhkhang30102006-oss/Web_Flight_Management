// Dữ liệu sân bay Việt Nam với tọa độ và khu vực

export const AIRPORT_DATA = {
  // --- MIỀN BẮC ---
  HAN: {
    code: "HAN",
    name: "Hà Nội (Nội Bài)",
    lat: 21.2187,
    lng: 105.8042,
    region: "North",
  },
  HPH: {
    code: "HPH",
    name: "Hải Phòng (Cát Bi)",
    lat: 20.8193,
    lng: 106.7333,
    region: "North",
  },
  VDO: {
    code: "VDO",
    name: "Vân Đồn (Quảng Ninh)",
    lat: 21.1167,
    lng: 107.4167,
    region: "North",
  },
  THD: {
    code: "THD",
    name: "Thanh Hóa (Thọ Xuân)",
    lat: 19.9017,
    lng: 105.4678,
    region: "North",
  },
  VII: {
    code: "VII",
    name: "Vinh (Nghệ An)",
    lat: 18.73,
    lng: 105.67,
    region: "North",
  },
  DIN: {
    code: "DIN",
    name: "Điện Biên Phủ",
    lat: 21.3972,
    lng: 103.0078,
    region: "North",
  },

  // --- MIỀN TRUNG ---
  DAD: {
    code: "DAD",
    name: "Đà Nẵng",
    lat: 16.0544,
    lng: 108.2022,
    region: "Central",
  },
  HUI: {
    code: "HUI",
    name: "Huế (Phú Bài)",
    lat: 16.4,
    lng: 107.7,
    region: "Central",
  },
  CXR: {
    code: "CXR",
    name: "Nha Trang (Cam Ranh)",
    lat: 12.0,
    lng: 109.2167,
    region: "Central",
  },
  UIH: {
    code: "UIH",
    name: "Quy Nhơn (Phù Cát)",
    lat: 13.955,
    lng: 109.0422,
    region: "Central",
  },
  VCL: {
    code: "VCL",
    name: "Quảng Nam (Chu Lai)",
    lat: 15.4061,
    lng: 108.7056,
    region: "Central",
  },
  VDH: {
    code: "VDH",
    name: "Đồng Hới (Quảng Bình)",
    lat: 17.515,
    lng: 106.5906,
    region: "Central",
  },
  TBB: {
    code: "TBB",
    name: "Tuy Hòa (Phú Yên)",
    lat: 13.0494,
    lng: 109.3336,
    region: "Central",
  },

  // --- TÂY NGUYÊN ---
  DLI: {
    code: "DLI",
    name: "Đà Lạt (Liên Khương)",
    lat: 11.7506,
    lng: 108.3736,
    region: "Highlands",
  },
  BMV: {
    code: "BMV",
    name: "Buôn Ma Thuột",
    lat: 12.6681,
    lng: 108.12,
    region: "Highlands",
  },
  PXU: {
    code: "PXU",
    name: "Pleiku (Gia Lai)",
    lat: 14.0044,
    lng: 108.0172,
    region: "Highlands",
  },

  // --- MIỀN NAM ---
  SGN: {
    code: "SGN",
    name: "TP.HCM (Tân Sơn Nhất)",
    lat: 10.8231,
    lng: 106.6297,
    region: "South",
  },
  PQC: {
    code: "PQC",
    name: "Phú Quốc",
    lat: 10.2272,
    lng: 103.9675,
    region: "South",
  },
  VCA: {
    code: "VCA",
    name: "Cần Thơ",
    lat: 10.0851,
    lng: 105.7117,
    region: "South",
  },
  VCS: {
    code: "VCS",
    name: "Côn Đảo",
    lat: 8.7325,
    lng: 106.6289,
    region: "South",
  },
  VKG: {
    code: "VKG",
    name: "Rạch Giá (Kiên Giang)",
    lat: 9.9597,
    lng: 105.1339,
    region: "South",
  },
  CAH: {
    code: "CAH",
    name: "Cà Mau",
    lat: 9.1756,
    lng: 105.1794,
    region: "South",
  },
};

// Danh sách mảng để dùng cho Dropdown/Select/Map (Loop)
export const AIRPORT_LIST = Object.values(AIRPORT_DATA);
// Danh sách loại máy bay để dùng trong Modal
export const AIRCRAFT_TYPES = [
  "Boeing 787",
  "Airbus A321",
  "Airbus A350",
  "Embraer 190",
  "ATR 72"
];

// Hàm tiện ích: Lấy thông tin sân bay theo mã (An toàn)
export const getAirportInfo = (code) => {
  return (
    AIRPORT_DATA[code] || {
      code: code,
      name: code,
      lat: 0,
      lng: 0,
      region: "Unknown",
    }
  );
};