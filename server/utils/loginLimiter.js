const loginAttempts = {};

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 10 * 60 * 1000;
const loginLimiter = {
  checkBlock: (email) => {
    const entry = loginAttempts[email];
    if (!entry) return false;

    // Nếu đang có thời gian khóa và chưa hết giờ
    if (entry.blockUntil && Date.now() < entry.blockUntil) {
      return true; // Đang bị khóa
    }

    // Nếu hết giờ khóa thì reset luôn
    if (entry.blockUntil && Date.now() > entry.blockUntil) {
      delete loginAttempts[email];
    }

    return false;
  },

  // 2. Ghi nhận một lần đăng nhập sai
  addFail: (email) => {
    if (!loginAttempts[email]) {
      loginAttempts[email] = { count: 0, blockUntil: null };
    }

    loginAttempts[email].count += 1;

    // Nếu sai quá 5 lần -> Set thời gian khóa
    if (loginAttempts[email].count >= MAX_ATTEMPTS) {
      // Khóa 10 phút tính từ bây giờ
      loginAttempts[email].blockUntil = Date.now() + BLOCK_DURATION;
      return true; // Trả về true nghĩa là "Vừa bị khóa xong"
    }
    return false;
  },

  // 3. Reset khi đăng nhập thành công hoặc Admin mở khóa
  reset: (email) => {
    delete loginAttempts[email];
  },

  // 4. Lấy thông tin (để hiển thị log còn bao nhiêu lần thử)
  getAttempts: (email) => {
    return loginAttempts[email]?.count || 0;
  },
};

module.exports = loginLimiter;
