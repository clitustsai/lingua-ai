"use client";
import { FlaskConical, Crown } from "lucide-react";

export default function PremiumPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-5">
      <div className="w-20 h-20 rounded-3xl flex items-center justify-center"
        style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
        <Crown className="w-10 h-10 text-yellow-400" />
      </div>
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3"
          style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}>
          <FlaskConical className="w-3.5 h-3.5" /> Dang thu nghiem
        </div>
        <h2 className="text-white font-black text-xl mb-2">Premium</h2>
        <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
          Tinh nang mua Premium dang trong qua trinh thu nghiem. Chua the mua duoc, chua dung duoc tinh nang nay.
        </p>
      </div>
      <p className="text-xs text-gray-600">🚧 Beta — Sap ra mat chinh thuc</p>
    </div>
  );
}