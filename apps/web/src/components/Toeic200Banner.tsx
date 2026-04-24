"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PARTS = [
  { section: "LISTENING", items: [
    { id: "p1", label: "P1 — Photos", count: 6 },
    { id: "p2", label: "P2 — Question-Response", count: 25 },
    { id: "p3", label: "P3 — Conversations", count: 39 },
    { id: "p4", label: "P4 — Talks", count: 30 },
  ]},
  { section: "READING", items: [
    { id: "p5", label: "P5 — Incomplete Sentences", count: 30 },
    { id: "p6", label: "P6 — Text Completion", count: 16 },
    { id: "p7", label: "P7 — Reading Comprehension", count: 54 },
  ]},
];

export default function Toeic200Banner({ className }: { className?: string }) {
  const router = useRouter();
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setChecked(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className={cn("rounded-2xl overflow-hidden", className)}
      style={{ background: "rgba(18,12,36,0.95)", border: "1px solid rgba(59,130,246,0.25)" }}>
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">🎯 TOEIC Full Test — 200 câu</p>
          <p className="text-gray-500 text-xs mt-0.5">Toàn bộ 7 parts · 120 phút</p>
        </div>
        <button onClick={() => router.push("/courses/toeic-700")}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors shrink-0">
          Xem khóa học →
        </button>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-3">
        {PARTS.map(section => (
          <div key={section.section}>
            <p className="text-xs font-bold text-blue-400 mb-1.5 tracking-wide">{section.section}</p>
            <div className="flex flex-col gap-1">
              {section.items.map(item => (
                <button key={item.id} onClick={() => toggle(item.id)}
                  className="flex items-center gap-2.5 text-left hover:bg-white/5 px-2 py-1.5 rounded-lg transition-colors">
                  <div className={cn("w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                    checked.has(item.id) ? "bg-blue-500 border-blue-500" : "border-gray-600")}>
                    {checked.has(item.id) && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-gray-300 text-sm flex-1">{item.label}</span>
                  <span className="text-blue-400 text-xs">({item.count})</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <p className="text-xs text-gray-500">Toàn bộ 7 parts — 200 câu — 120 phút</p>
          <button onClick={() => router.push("/exam")}
            className="text-xs px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors">
            Thi thử
          </button>
        </div>
      </div>
    </div>
  );
}
