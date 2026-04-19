// Centralized error messages for AI API failures

export const API_ERRORS = {
  timeout: "AI đang bận, vui lòng thử lại sau vài giây.",
  rateLimit: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ 1 phút.",
  noResponse: "Không nhận được phản hồi từ AI. Kiểm tra kết nối mạng.",
  generic: "Có lỗi xảy ra. Vui lòng thử lại.",
  groqDown: "Dịch vụ AI tạm thời không khả dụng. Thử lại sau ít phút.",
};

export function getErrorMessage(error: any): string {
  const msg = String(error?.message ?? error ?? "");
  if (msg.includes("timeout") || msg.includes("ETIMEDOUT")) return API_ERRORS.timeout;
  if (msg.includes("429") || msg.includes("rate")) return API_ERRORS.rateLimit;
  if (msg.includes("503") || msg.includes("502")) return API_ERRORS.groqDown;
  if (msg.includes("network") || msg.includes("fetch")) return API_ERRORS.noResponse;
  return API_ERRORS.generic;
}

export function withTimeout<T>(promise: Promise<T>, ms = 25000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}
