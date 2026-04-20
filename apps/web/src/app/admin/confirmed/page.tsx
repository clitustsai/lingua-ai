"use client";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Crown } from "lucide-react";
import { Suspense } from "react";

function Content() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const plan = params.get("plan") ?? "monthly";
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#050210" }}>
      <div className="text-center max-w-sm">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h1 className="text-white font-black text-2xl mb-2">Da kich hoat VIP!</h1>
        <p className="text-gray-400 text-sm mb-4">
          Tai khoan <span className="text-white font-semibold">{email}</span> da duoc nang cap VIP {plan === "yearly" ? "1 nam" : "1 thang"}.
        </p>
        <div className="flex items-center justify-center gap-2 text-yellow-400">
          <Crown className="w-5 h-5" />
          <span className="font-bold">VIP da duoc kich hoat thanh cong</span>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmedPage() {
  return <Suspense><Content /></Suspense>;
}
