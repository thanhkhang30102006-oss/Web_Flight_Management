// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

console.log("Loaded AdminController:", AdminController);

// Gọi đúng tên hàm: getAllEmailTemplates
router.get('/email-templates', AdminController.getAllEmailTemplates);

// Gọi đúng tên hàm: updateEmailTemplate
router.put('/email-templates/:id', AdminController.updateEmailTemplate);

router.post('/translate', AdminController.translateText);

module.exports = router;