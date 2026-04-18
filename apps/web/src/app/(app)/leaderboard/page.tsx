"use client";
import { FlaskConical } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-5">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}>
        <FlaskConical className="w-10 h-10 text-indigo-400" />
      </div>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
          style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}>
          🧪 Đang thử nghiệm
        </div>
        <h2 className="text-white font-black text-xl mb-2">Bảng xếp hạng</h2>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          Tính năng này đang trong giai đoạn thử nghiệm. Chưa mua được, chưa dùng được tính năng này.
        </p>
      </div>
      <span className="text-xs text-gray-600">🚧 Beta — Sắp ra mắt</span>
    </div>
  );
}
