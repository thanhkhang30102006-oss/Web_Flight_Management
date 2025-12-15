const AIRPORT_MAP = {
  HAN: "Hà Nội (Nội Bài)",
  SGN: "TP. Hồ Chí Minh (Tân Sơn Nhất)",
  DAD: "Đà Nẵng",
  CXR: "Cam Ranh",
  PQC: "Phú Quốc",
  VCA: "Cần Thơ",
  HUI: "Huế",
};

const translateAirport = (code) => {
  if (!code) return "";
  return AIRPORT_MAP[code] || code;
};

module.exports = {
  AIRPORT_MAP,
  translateAirport,
};
