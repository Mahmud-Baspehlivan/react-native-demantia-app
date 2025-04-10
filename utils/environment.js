/**
 * Uygulama modunu kontrol eden yardımcı fonksiyonlar
 */
import { config } from "../config/api";

/**
 * Uygulamanın development modunda çalışıp çalışmadığını kontrol eder
 * @returns {boolean} Development modunda mı?
 */
export const isDevelopmentMode = () => {
  return config.devMode === true || __DEV__ === true;
};

/**
 * Uygulamanın production modunda çalışıp çalışmadığını kontrol eder
 * @returns {boolean} Production modunda mı?
 */
export const isProductionMode = () => {
  return !isDevelopmentMode();
};

/**
 * Sadece development modunda çalışacak kodlar için kullanılır
 * @param {Function} callback Çalıştırılacak fonksiyon
 */
export const runInDevMode = (callback) => {
  if (isDevelopmentMode() && typeof callback === "function") {
    callback();
  }
};

/**
 * Sadece production modunda çalışacak kodlar için kullanılır
 * @param {Function} callback Çalıştırılacak fonksiyon
 */
export const runInProdMode = (callback) => {
  if (isProductionMode() && typeof callback === "function") {
    callback();
  }
};

/**
 * Geçerli mod için uygun değeri döndürür
 * @param {*} devValue Development modunda dönecek değer
 * @param {*} prodValue Production modunda dönecek değer
 * @returns {*} Moda göre uygun değer
 */
export const getValueByMode = (devValue, prodValue) => {
  return isDevelopmentMode() ? devValue : prodValue;
};
