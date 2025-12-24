import JSEncrypt from "jsencrypt";
import CryptoJS from "crypto-js";

// 1. Tạo cặp khóa (Private/Public)
export const generateKeys = () => {
  const crypt = new JSEncrypt({ default_key_size: 2048 });
  const privateKey = crypt.getPrivateKey();
  const publicKey = crypt.getPublicKey();
  return { privateKey, publicKey };
};

// 2. Mã hóa (Dùng Public Key của người nhận)
export const encrypt = (text, publicKey) => {
  if (!publicKey || !text) return null;
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  return encryptor.encrypt(text); // Trả về chuỗi Base64
};

// 3. Giải mã (Dùng Private Key của mình)
export const decrypt = (encryptedText, privateKey) => {
    console.log("🛠️ Đang giải mã:");
  console.log("- Text (50 ký tự đầu):", encryptedText ? encryptedText.substring(0, 50) : "NULL");
  console.log("- Private Key có tồn tại không?", !!privateKey);
  if (!privateKey || !encryptedText) return "---";
  const decryptor = new JSEncrypt();
  decryptor.setPrivateKey(privateKey);
  const result = decryptor.decrypt(encryptedText);
  console.log("Result : ",result );
  return result ? result : "[Không thể giải mã]";
};

// 4. Ký tên (Dùng Private Key người gửi)
export const sign = (text, privateKey) => {
  const signer = new JSEncrypt();
  signer.setPrivateKey(privateKey);
  return signer.sign(text, CryptoJS.SHA256, "sha256");
};

export const encryptPrivateKeyPayload = (privateKey, secretKey) => {
  return CryptoJS.AES.encrypt(privateKey, secretKey).toString();
};
export const decryptPrivateKeyPayload = (encryptedPrivateKey, secretKey) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (e) {
    console.error("Sai secret key hoặc dữ liệu lỗi", e);
    return null;
  }
};