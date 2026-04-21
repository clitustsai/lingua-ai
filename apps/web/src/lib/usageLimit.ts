// Centralized daily usage limits for free vs premium users

export const FREE_LIMITS = {
  chat: 30,          // tin nhắn chat/ngày
  homework: 5,       // bài tập AI/ngày
  translate: 20,     // lần dịch/ngày
  solve: 80,         // giải bài tập/ngày
  generateLesson: 20, // tạo bài học/ngày
  grammar: 10,       // kiểm tra ngữ pháp/ngày
  lesson: 20,        // tạo bài học (lessons page)/ngày
};

export type LimitKey = keyof typeof FREE_LIMITS;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getUserId(): string {
  if (typeof window === "undefined") return "anon";
  try {
    const auth = localStorage.getItem("lingua-auth");
    if (auth) {
      const parsed = JSON.parse(auth);
      return parsed?.state?.user?.id ?? "anon";
    }
  } catch {}
  return "anon";
}

function storageKey(feature: LimitKey) {
  const uid = getUserId();
  return `lingua_usage_${uid}_${feature}`;
}

export function getUsageCount(feature: LimitKey): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(storageKey(feature));
    if (!raw) return 0;
    const { date, count } = JSON.parse(raw);
    return date === todayStr() ? count : 0;
  } catch { return 0; }
}

export function incrementUsage(feature: LimitKey): number {
  const today = todayStr();
  const current = getUsageCount(feature);
  const newCount = current + 1;
  localStorage.setItem(storageKey(feature), JSON.stringify({ date: today, count: newCount }));
  return newCount;
}

export function getRemainingUses(feature: LimitKey, isPremium: boolean): number {
  if (isPremium) return Infinity;
  return Math.max(0, FREE_LIMITS[feature] - getUsageCount(feature));
}

export function canUseFeature(feature: LimitKey, isPremium: boolean): boolean {
  if (isPremium) return true;
  return getUsageCount(feature) < FREE_LIMITS[feature];
}

export function getUsagePercent(feature: LimitKey): number {
  const used = getUsageCount(feature);
  const limit = FREE_LIMITS[feature];
  return Math.min(100, Math.round((used / limit) * 100));
}
