"use client";

interface Props {
  onContinue: () => void;
  onExit: () => void;
  message?: string;
  exitLabel?: string;
}

export default function ExitConfirmPopup({ onContinue, onExit, message, exitLabel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-3xl p-6 text-center"
        style={{ background: "rgba(20,12,40,0.98)", border: "1px solid rgba(139,92,246,0.3)" }}>
        <p className="text-white font-bold text-lg mb-5">
          {message ?? "Bạn có chắc chắn muốn thoát không?"}
        </p>
        <button onClick={onContinue}
          className="w-full py-4 rounded-2xl font-bold text-white mb-3 text-base transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>
          Tiếp tục học
        </button>
        <button onClick={onExit}
          className="w-full py-2 text-white font-bold text-base hover:text-gray-300 transition-colors">
          {exitLabel ?? "Thoát Bài Học"}
        </button>
      </div>
    </div>
  );
}
