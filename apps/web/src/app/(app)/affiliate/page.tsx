"use client";
import { Wrench } from "lucide-react";

export default function AffiliatePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-5">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
        <Wrench className="w-10 h-10 text-purple-400" />
      </div>
      <div>
        <h2 className="text-white font-black text-xl mb-2">Đang phát triển</h2>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">
          Tính năng Tiếp thị liên kết đang được xây dựng. Vui lòng quay lại sau!
        </p>
      </div>
      <span className="text-xs text-gray-600">🚧 Coming soon</span>
    </div>
  );
}
