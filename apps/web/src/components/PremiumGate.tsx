"use client";
import { useRouter } from "next/navigation";
import { Crown, Lock } from "lucide-react";

interface Props {
  title: string;
  desc?: string;
  alwaysLocked?: boolean; // true = luôn lock dù còn trial
}

export default function PremiumGate({ title, desc, alwaysLocked }: Props) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-5">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
        <Lock className="w-10 h-10 text-yellow-400" />
      </div>
      <div>
        <h2 className="text-white font-black text-xl mb-2">{title}</h2>
        <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
          {desc || "Tính năng này yêu cầu gói Premium để sử dụng."}
        </p>
      </div>
      <button onClick={() => router.push("/premium")}
        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}>
        <Crown className="w-5 h-5" /> Nâng cấp Premium
      </button>
      <button onClick={() => router.back()} className="text-gray-600 text-sm hover:text-gray-400 transition-colors">
        Quay lại
      </button>
    </div>
  );
}
