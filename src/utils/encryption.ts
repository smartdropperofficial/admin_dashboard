import { AES, enc } from "crypto-js";
import Logger from "./logger";

/**
 * Verifica se una stringa è codificata con encodeURIComponent.
 */
const isURIComponentEncoded = (str: string): boolean => {
  try {
    const decoded = decodeURIComponent(str);
    return encodeURIComponent(decoded) === str;
  } catch {
    return false;
  }
};

/**
 * Verifica se una stringa è base64 valida.
 */
const isBase64 = (str: string): boolean => {
  const base64Regex = /^[A-Za-z0-9+/=]+={0,2}$/;
  return base64Regex.test(str);
};

/**
 * Cripta i dati in AES e li codifica con encodeURIComponent.
 */
export const encryptData = (data: string): string => {
  const ciphertext = AES.encrypt(data, process.env.API_ENCRYPTER!);
  return encodeURIComponent(ciphertext.toString());
};

/**
 * Decripta i dati codificati in AES + URI encoded.
 * Se il dato non è criptato, lo restituisce così com'è.
 */
export const decryptData = (data: string): string => {
  console.log("🚀 ~ decryptData ~ input data:", data);

  const encryptionKey = process.env.API_ENCRYPTER;
  if (!encryptionKey) {
    Logger.error("🚨 API_ENCRYPTER environment variable is not set");
    return "";
  }

  try {
    // Prova a decodificare
    const decoded = decodeURIComponent(data);
    console.log("🚀 ~ decryptData ~ decodedData:", decoded);

    // Se non sembra una stringa base64 valida, assumiamo che NON sia cifrata
    if (!isBase64(decoded)) {
      console.warn("⚠️ Dato non base64. Restituito come plain text.");
      return data;
    }

    const bytes = AES.decrypt(decoded, encryptionKey);
    const decryptedData = bytes.toString(enc.Utf8);

    if (!decryptedData) {
      throw new Error("❌ AES decryption fallita o vuota");
    }

    return decryptedData;
  } catch (error) {
    Logger.error("🚨 decryptData failed:", error);
    return data; // fallback sicuro: restituisce il dato originale
  }
};
