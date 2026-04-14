"use client";

interface Props {
  confidence: number; // 0-1
  transcript: string;
}

export default function PronunciationScore({ confidence, transcript }: Props) {
  const pct = Math.round(confidence * 100);
  const color =
    pct >= 80 ? "text-green-400 border-green-500/40 bg-green-900/20"
    : pct >= 50 ? "text-yellow-400 border-yellow-500/40 bg-yellow-900/20"
    : "text-red-400 border-red-500/40 bg-red-900/20";
  const label =
    pct >= 80 ? "Great pronunciation! 🎉"
    : pct >= 50 ? "Good, keep practicing 👍"
    : "Try again, speak clearly 🎤";

  return (
    <div className={`flex items-center gap-3 border rounded-xl px-3 py-2 text-xs ${color}`}>
      <div className="flex flex-col items-center shrink-0">
        <span className="text-lg font-bold leading-none">{pct}%</span>
        <span className="opacity-70">score</span>
      </div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="opacity-70 mt-0.5">"{transcript}"</p>
      </div>
    </div>
  );
}
