import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Mail,
  Save,
  Globe,
  ArrowRightLeft,
  Loader2,
  Wand2,
} from "lucide-react";
import "../../pages/AdminDashboard.css";
import "./EmailTemplateManager.css";

const API_URL = "http://localhost:3001/api/admin";

const prettifyHTML = (html) => {
  if (!html) return "";

  // Xóa bớt khoảng trắng thừa và xuống dòng cũ để format lại từ đầu
  let formatted = "";
  const reg = /(>)(<)(\/*)/g;
  let xml = html.replace(reg, "$1\r\n$2$3");
  let pad = 0;

  // Danh sách các thẻ tự đóng (không cần thụt lề sau nó)
  const voidTags = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ];

  xml.split("\r\n").forEach((node) => {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) {
        pad -= 1;
      }
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    // Kiểm tra void tags để không tăng indent
    const tagName = node.match(/^<([a-z0-9]+)/i);
    if (tagName && voidTags.includes(tagName[1].toLowerCase())) {
      indent = 0;
    }

    let padding = "";
    for (let i = 0; i < pad; i++) {
      padding += "  "; // 2 spaces per indent
    }

    formatted += padding + node + "\r\n";
    pad += indent;
  });

  return formatted.trim();
};

const EmailTemplateManager = () => {
  const [rawTemplates, setRawTemplates] = useState([]); // Dữ liệu thô từ DB
  const [selectedBaseId, setSelectedBaseId] = useState(null); // ID gốc (không có _vi/_en)
  const [currentLang, setCurrentLang] = useState("vi"); // 'vi' | 'en'
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch dữ liệu từ Backend
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${API_URL}/email-templates`);
      if (res.data.success) {
        setRawTemplates(res.data.data);
        // Chọn mặc định item đầu tiên nếu có
        if (res.data.data.length > 0) {
          const firstId = res.data.data[0].id;
          const baseId = firstId.replace(/_(vi|en)$/, "");
          setSelectedBaseId(baseId);
        }
      }
    } catch (error) {
      console.error("Lỗi tải template:", error);
      alert("Không thể kết nối đến server.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Logic Gom nhóm (Group) các template VI và EN lại với nhau
  // Kết quả: [{ baseId: 'booking_success', name: 'Xác nhận đặt vé', ... }]
  const groupedTemplates = useMemo(() => {
    const groups = {};
    rawTemplates.forEach((t) => {
      // Tách suffix _vi hoặc _en ra để lấy baseId
      const baseId = t.id.replace(/_(vi|en)$/, "");

      if (!groups[baseId]) {
        groups[baseId] = {
          baseId,
          name: t.name, // Lấy tên mặc định của bản ghi đầu tiên tìm thấy
          hasVi: false,
          hasEn: false,
        };
      }

      if (t.id.endsWith("_vi")) {
        groups[baseId].hasVi = true;

        groups[baseId].name = t.name;
      }
      if (t.id.endsWith("_en")) groups[baseId].hasEn = true;
    });
    return Object.values(groups);
  }, [rawTemplates]);

  // 3. Xác định Template đang hiển thị dựa trên BaseID và Lang
  const currentTemplateId = `${selectedBaseId}_${currentLang}`;
  let currentTemplate = rawTemplates.find((t) => t.id === currentTemplateId);

  if (!currentTemplate && selectedBaseId) {
    const fallbackId = `${selectedBaseId}_${currentLang === "vi" ? "en" : "vi"}`;
    const fallbackTemplate = rawTemplates.find((t) => t.id === fallbackId);
    if (fallbackTemplate) {
      // Clone ra một bản tạm để hiển thị
      currentTemplate = {
        ...fallbackTemplate,
        id: currentTemplateId,
        subject: "",
        content: "",
      };
    }
  }
  // 4. Xử lý Update State Local
  const handleUpdate = (field, value) => {
    const exists = rawTemplates.find((t) => t.id === currentTemplateId);
    if (exists) {
      setRawTemplates((prev) =>
        prev.map((t) =>
          t.id === currentTemplateId ? { ...t, [field]: value } : t
        )
      );
    } else {
      // Tạo mới bản ghi trong state
      const newTemplate = {
        ...currentTemplate,
        [field]: value,
        id: currentTemplateId,
      };
      setRawTemplates((prev) => [...prev, newTemplate]);
    }
  };

  // 5. Lưu xuống Backend
  const handleSave = async () => {
    if (!currentTemplate) return;
    setIsSaving(true);
    try {
      await axios.put(`${API_URL}/email-templates/${currentTemplateId}`, {
        subject: currentTemplate.subject,
        content: currentTemplate.content,
      });
      alert(`Đã lưu bản ${currentLang.toUpperCase()} thành công!`);
    } catch (error) {
      console.error("Lỗi lưu:", error);
      alert("Lỗi khi lưu template.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormatCode = () => {
    if (!currentTemplate) return;
    const formatted = prettifyHTML(currentTemplate.content);
    handleUpdate("content", formatted);
  };

  // 6. Xử lý Dịch tự động (LibreTranslate)
  const handleAutoTranslate = async () => {
    if (!currentTemplate) return;
    const sourceLang = currentLang;
    const targetLang = currentLang === "vi" ? "en" : "vi";
    const targetId = `${selectedBaseId}_${targetLang}`;

    if (
      !window.confirm(
        `Dịch từ ${sourceLang.toUpperCase()} sang ${targetLang.toUpperCase()}? Nội dung cũ sẽ bị ghi đè.`
      )
    )
      return;

    setIsTranslating(true);

    try {
      // Hàm helper dịch an toàn
      const translateTextSafe = async (text) => {
        if (!text || typeof text !== "string") return "";

        // 1. Bảo vệ biến {{...}}
        const variables = [];
        const protectedText = text.replace(/{{(.*?)}}/g, (match) => {
          variables.push(match);
          return `__VAR_${variables.length - 1}__`;
        });

        // 2. Gọi API
        try {
          const res = await axios.post(`${API_URL}/translate`, {
            q: protectedText,
            source: sourceLang,
            target: targetLang,
          });

          // Kiểm tra kết quả trả về
          let translatedText = res.data?.translatedText;

          // Nếu API trả về rỗng hoặc undefined, dùng lại text gốc
          if (!translatedText) {
            console.warn("API không trả về kết quả dịch, dùng fallback.");
            return text;
          }

          // 3. Hoàn trả biến
          variables.forEach((v, index) => {
            // Regex fix lỗi khoảng trắng do API dịch tự thêm vào
            const pattern = new RegExp(
              `__\\s?VAR\\s?_\\s?${index}\\s?__`,
              "gi"
            );
            translatedText = translatedText.replace(pattern, v);
          });

          return translatedText;
        } catch (err) {
          console.error("Lỗi gọi API Backend:", err);
          return text; // Trả về text gốc nếu lỗi mạng
        }
      };

      // Thực hiện dịch
      const [newSubject, newContent] = await Promise.all([
        translateTextSafe(currentTemplate.subject),
        translateTextSafe(currentTemplate.content),
      ]);

      // Cập nhật State
      setRawTemplates((prev) => {
        const exists = prev.find((t) => t.id === targetId);
        const updatedData = {
          id: targetId,
          name: currentTemplate.name, // Giữ nguyên tên
          subject: newSubject,
          content: newContent,
        };

        if (exists) {
          return prev.map((t) =>
            t.id === targetId ? { ...t, ...updatedData } : t
          );
        } else {
          return [...prev, updatedData];
        }
      });
      setCurrentLang(targetLang);
      alert(`Đã dịch xong! Vui lòng kiểm tra và Lưu.`);
    } catch (error) {
      console.error("System Error:", error);
      alert("Có lỗi xảy ra trong quá trình xử lý.");
    } finally {
      setIsTranslating(false);
    }
  };

  if (isLoading)
    return (
      <div className="loading-screen">
        <Loader2 className="spin" /> Đang tải dữ liệu...
      </div>
    );

  return (
    <div
      className="fade-in"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2 className="panel-title">Quản lý Mẫu Email (Email Templates)</h2>
      </div>

      <div className="email-layout">
        {/* LEFT: LIST (Đã gom nhóm) */}
        <div className="template-list custom-scrollbar">
          {groupedTemplates.map((group) => (
            <div
              key={group.baseId}
              className={`template-item ${group.baseId === selectedBaseId ? "active" : ""}`}
              onClick={() => setSelectedBaseId(group.baseId)}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "5px",
                }}
              >
                <Mail
                  size={16}
                  color={
                    group.baseId === selectedBaseId ? "#60a5fa" : "#94a3b8"
                  }
                />
                <strong
                  style={{
                    fontSize: "14px",
                    color:
                      group.baseId === selectedBaseId ? "white" : "#ffffff",
                  }}
                >
                  {group.name}
                </strong>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  display: "flex",
                  gap: "5px",
                }}
              >
                {group.hasVi && <span className="lang-tag vi">VI</span>}
                {group.hasEn && <span className="lang-tag en">EN</span>}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: EDITOR */}
        <div className="glass-panel editor-container">
          {currentTemplate ? (
            <>
              {/* Toolbar Ngôn ngữ & Dịch */}
              <div className="editor-toolbar">
                <div className="lang-toggle">
                  <button
                    className={`lang-btn ${currentLang === "vi" ? "active" : ""}`}
                    onClick={() => setCurrentLang("vi")}
                  >
                    🇻🇳 Tiếng Việt
                  </button>
                  <button
                    className={`lang-btn ${currentLang === "en" ? "active" : ""}`}
                    onClick={() => setCurrentLang("en")}
                  >
                    🇬🇧 English
                  </button>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  {/* NÚT FORMAT CODE */}
                  <button
                    className="utility-btn"
                    onClick={handleFormatCode}
                    title="Tự động format HTML cho dễ nhìn"
                  >
                    <Wand2 size={14} /> Làm đẹp Code
                  </button>

                  <button
                    className="translate-btn"
                    onClick={handleAutoTranslate}
                    disabled={isTranslating}
                  >
                    {isTranslating ? (
                      <Loader2 className="spin" size={14} />
                    ) : (
                      <ArrowRightLeft size={14} />
                    )}
                    Dịch sang {currentLang === "vi" ? "EN" : "VI"}
                  </button>
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <label className="input-label">
                  Tiêu đề Email (Subject) - [{currentLang.toUpperCase()}]
                </label>
                <input
                  className="glass-input"
                  style={{ width: "100%" }}
                  value={currentTemplate.subject}
                  onChange={(e) => handleUpdate("subject", e.target.value)}
                />
              </div>

              {/* Variables Helper */}
              <div>
                <label className="input-label" style={{ marginRight: "10px" }}>
                  Biến có sẵn (Click để copy):
                </label>
                {currentTemplate.variables &&
                  currentTemplate.variables.map((v) => (
                    <span
                      key={v}
                      className="variable-tag"
                      title="Copy"
                      onClick={() => navigator.clipboard.writeText(v)}
                    >
                      {v}
                    </span>
                  ))}
              </div>

              {/* HTML Content */}
              <div
                style={{ flex: 1, display: "flex", flexDirection: "column" }}
              >
                <label className="input-label">
                  Nội dung HTML - [{currentLang.toUpperCase()}]
                </label>
                <textarea
                  className="glass-input custom-scrollbar"
                  style={{
                    flex: 1,
                    width: "100%",
                    fontFamily: "monospace",
                    lineHeight: "1.5",
                    resize: "none",
                  }}
                  value={currentTemplate.content}
                  onChange={(e) => handleUpdate("content", e.target.value)}
                />
              </div>

              {/* Footer Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "10px",
                }}
              >
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  * Lưu ý: Thay đổi chỉ áp dụng cho phiên bản{" "}
                  <strong>{currentLang.toUpperCase()}</strong>.
                </span>
                <button
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    "Đang lưu..."
                  ) : (
                    <>
                      <Save size={18} /> Lưu thay đổi (
                      {currentLang.toUpperCase()})
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Vui lòng chọn một mẫu email để chỉnh sửa.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateManager;
