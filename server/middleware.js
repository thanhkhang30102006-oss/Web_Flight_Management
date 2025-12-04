const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Lấy token
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Lọc bỏ chữ "Bearer"

  if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userDecoded) => {
    if (err) {
      // Token sai hoặc hết hạn -> Chặn
      return res
        .status(403)
        .json({ message: "Token không hợp lệ hoặc hết hạn" });
    }

    req.user = userDecoded;

    next();
  });
};

module.exports = authMiddleware;
