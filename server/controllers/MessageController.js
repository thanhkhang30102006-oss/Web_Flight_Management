const db = require("../models");
const Message = db.Message;
const CryptoJS = require("crypto-js");
const secretkey = process.env.CHAT_SECRET_KEY;
const decryptMessage = (cipherText) => {
  if (!cipherText) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secretkey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || cipherText;
  } catch (e) {
    return cipherText;
  }
};
// Lấy lịch sử chat của một hành khách
const getHistory = async (req, res) => {
  try {
    const { passengerID } = req.params;
    const messages = await Message.findAll({
      where: { passengerID: passengerID },
      order: [["createdAt", "ASC"]],
    });
    // giải mã
    const decryptedMessages = messages.map((msg) => {
      const msgData = msg.dataValues ? { ...msg.dataValues } : { ...msg };
      msgData.contentMessage = decryptMessage(msgData.contentMessage);

      return msgData;
    });
    return res.status(200).json(decryptedMessages);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// API Upload file (Để xử lý ảnh/file)
// Bạn cần cài thư viện: npm install multer
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }
    // Trả về đường dẫn file để Frontend gửi qua socket
    const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;
    return res.status(200).json({
      url: fileUrl,
      filename: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
// Staff
const getConversations = async (req, res) => {
  try {
    // 1. Lấy danh sách khách hàng đã chat
    const distinctPassengers = await Message.findAll({
      attributes: [
        [
          db.sequelize.fn("DISTINCT", db.sequelize.col("passengerID")),
          "passengerID",
        ],
      ],
      raw: true,
    });

    // 2. Lặp qua từng ID để lấy tin nhắn cuối cùng + Info khách
    const conversations = await Promise.all(
      distinctPassengers.map(async (p) => {
        const lastMsg = await Message.findOne({
          where: { passengerID: p.passengerID },
          order: [["messageTime", "DESC"]],
          // JOIN để lấy tên khách
          include: [
            {
              model: db.Passenger,
              as: "passenger",
              attributes: ["passengerName", "passengerImage"], // Đảm bảo đúng tên cột trong DB
            },
          ],
        });
        // Giải mã
        let decryptedLastMsg = "";
        if (lastMsg) {
          decryptedLastMsg = decryptMessage(lastMsg.contentMessage); // <--- GIẢI MÃ Ở ĐÂY
        }
        return {
          passengerID: p.passengerID,
          passengerName: lastMsg?.passenger?.passengerName || "Khách lạ",
          passengerImage: lastMsg?.passenger?.passengerImage,
          lastMsg: decryptedLastMsg,
          lastTime: lastMsg?.messageTime,
        };
      })
    );
    // Sắp xếp ai mới nhắn tin thì lên đầu
    conversations.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime));

    return res.status(200).json(conversations);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = { getHistory, uploadFile, getConversations };
