const fs = require('fs');
const axios = require('axios');
const path = require('path');
const translate = require('google-translate-api-x');
const DATA_PATH = path.resolve(__dirname, '../service/editFormEmail/emailTemplates.json');
const { getAllTemplates, updateTemplate } = require('../service/editFormEmail/templateManager');
const AdminController = {
    // API: Lấy danh sách
    getAllEmailTemplates: (req, res) => {
      try {
            console.log("Đang lấy danh sách template..."); // Log để debug
            const templates = getAllTemplates();
            return res.status(200).json({
                success: true,
                data: templates
            });
        } catch (error) {
            console.error("Lỗi Controller lấy template:", error);
            return res.status(500).json({ 
                success: false, 
                message: "Lỗi server khi lấy danh sách template" 
            });
        }
    },

    // API: Cập nhật
    updateEmailTemplate: (req, res) => {
      try {
            const { id } = req.params;
            const { subject, content } = req.body;
            console.log(`Đang cập nhật template: ${id}`); // Log để debug

            const updatedTemplate = updateTemplate(id, subject, content);

            if (!updatedTemplate) {
                return res.status(404).json({ 
                    success: false, 
                    message: "Không tìm thấy mẫu email hoặc lỗi khi lưu file." 
                });
            }

            return res.status(200).json({
                success: true,
                message: "Cập nhật mẫu email thành công!",
                data: updatedTemplate
            });
        } catch (error) {
            console.error("Lỗi Controller cập nhật template:", error);
            return res.status(500).json({ 
                success: false, 
                message: "Lỗi server khi cập nhật template" 
            });
        }
    },
        // API: Dịch văn bản sử dụng LibreTranslate
   translateText: async (req, res) => {
        try {
            const { q, source, target } = req.body;
            
            // Log xem Backend có nhận được dữ liệu không
            console.log(`[Translate Request] Từ ${source} sang ${target}`);
            console.log(`[Text Input]:`, q ? q.substring(0, 50) + "..." : "UNDEFINED");

            if (!q) {
                console.warn("[Translate Warning] Text input rỗng");
                return res.status(200).json({ translatedText: "" });
            }

            // Gọi Google Translate
            const resGoogle = await translate(q, { 
                from: source, 
                to: target,
                forceBatch: false,
                autoCorrect: true
            });

            // Log kết quả trả về từ Google
            console.log(`[Google Response]:`, resGoogle.text ? "Có kết quả" : "Không có text");
            
            // Đảm bảo luôn trả về string (tránh undefined)
            const finalResult = resGoogle.text || q; 

            return res.status(200).json({ translatedText: finalResult });

        } catch (error) {
            console.error("[Translate Error]:", error.message);
            // Fallback: Trả về văn bản gốc nếu lỗi
            return res.status(200).json({ translatedText: req.body.q || "" }); 
        }
    }
};

module.exports = AdminController;