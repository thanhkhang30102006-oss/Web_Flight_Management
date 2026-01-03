const fs = require('fs');
const path = require('path');
const DATA_PATH = path.resolve(__dirname, './emailTemplates.json');

// 1. Lấy tất cả template

const getAllTemplates = () => {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            console.warn(`File dữ liệu không tồn tại tại: ${DATA_PATH}`);
            return [];
        }
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Lỗi đọc file template:", err);
        return [];
    }
};

// 2. Cập nhật Template

const updateTemplate = (id, newSubject, newContent) => {
    try {
        const templates = getAllTemplates();
        const index = templates.findIndex(t => t.id === id);
        
        if (index !== -1) {
            templates[index].subject = newSubject;
            templates[index].content = newContent;
            
            // Ghi đè lại file JSON
            fs.writeFileSync(DATA_PATH, JSON.stringify(templates, null, 2), 'utf8');
            return templates[index];
        }
        return null;
    } catch (error) {
        console.error("Lỗi khi ghi file template:", error);
        return null;
    }
};

/**
 * 3. Render Template
 * @param {string} templateId 
 * @param {object} dataMap 
 */
const renderTemplate = (templateId, dataMap) => {
    const templates = getAllTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
        console.warn(`Không tìm thấy template với ID: ${templateId}`);
        return null;
    }

    let { subject, content } = template;

    Object.keys(dataMap).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        
        const value = dataMap[key] !== undefined && dataMap[key] !== null ? dataMap[key] : "";
        
        content = content.replace(regex, value);
        subject = subject.replace(regex, value);
    });

    return { subject, content };
};

module.exports = {
    getAllTemplates,
    updateTemplate,
    renderTemplate
};