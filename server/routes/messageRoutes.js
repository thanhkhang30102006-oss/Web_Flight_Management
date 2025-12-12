const express = require("express");
const router = express.Router();
const messageController = require("../controllers/MessageController");
const multer = require("multer");
const path = require("path");

// Cấu hình Multer lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.get("/history/:passengerID", messageController.getHistory);
router.post("/upload", upload.single("file"), messageController.uploadFile);
router.get("/conversations", messageController.getConversations); 
module.exports = router;