"use client";
import { useState } from "react";
import { Flag, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Part = "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7";

const PARTS: { id: Part; count: number; type: "listening" | "reading" }[] = [
  { id: "P1", count: 6,  type: "listening" },
  { id: "P2", count: 25, type: "listening" },
  { id: "P3", count: 39, type: "listening" },
  { id: "P4", count: 30, type: "listening" },
  { id: "P5", count: 30, type: "reading" },
  { id: "P6", count: 16, type: "reading" },
  { id: "P7", count: 54, type: "reading" },
];

type Q = { id: number; question?: string; options: string[]; correct: number; image?: string; audio?: string; passage?: string };

// Static sample questions per part
const QUESTIONS: Record<Part, Q[]> = {
  P1: [
    { id: 1, options: ["A woman is walking down a street.", "A man is riding a bicycle.", "Two people are sitting on a bench.", "A car is parked on the road."], correct: 0, image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80" },
    { id: 2, options: ["Workers are repairing a building.", "A train is arriving at the station.", "People are waiting on the platform.", "A bus is parked near the entrance."], correct: 2, image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80" },
    { id: 3, options: ["A chef is cooking in the kitchen.", "Customers are ordering food.", "Tables are being set for dinner.", "A waiter is serving drinks."], correct: 2, image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80" },
    { id: 4, options: ["A man is using a laptop.", "Two colleagues are having a meeting.", "An office is empty.", "Papers are stacked on a desk."], correct: 1, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80" },
    { id: 5, options: ["A woman is reading a book.", "Children are playing in a park.", "A dog is running on the grass.", "People are having a picnic."], correct: 1, image: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=400&q=80" },
    { id: 6, options: ["A ship is docked at the port.", "Fishermen are casting their nets.", "Waves are crashing on the shore.", "A lighthouse stands on the cliff."], correct: 0, image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=80" },
  ],
  P2: [
    { id: 1, question: "Where is the nearest post office?", options: ["It's on Main Street.", "I went there yesterday.", "The mail arrived late."], correct: 0 },
    { id: 2, question: "When does the meeting start?", options: ["In the conference room.", "At 3 o'clock.", "With the manager."], correct: 1 },
    { id: 3, question: "Who is responsible for this project?", options: ["It's due next Friday.", "Sarah from marketing.", "We finished it last week."], correct: 1 },
    { id: 4, question: "Have you submitted the report yet?", options: ["Yes, I sent it this morning.", "The report is very long.", "It was written by Tom."], correct: 0 },
    { id: 5, question: "Why was the event cancelled?", options: ["It was very popular.", "Due to bad weather.", "Next Saturday."], correct: 1 },
    { id: 6, question: "Could you help me with this form?", options: ["Sure, I'd be happy to.", "The form is on the table.", "I filled it out yesterday."], correct: 0 },
  ],
  P3: [
    { id: 1, question: "What are the speakers mainly discussing?", options: ["A new product launch", "A business trip schedule", "An office renovation", "A client complaint"], correct: 1, passage: "M: Have you booked the flights for the Tokyo conference?\nW: Not yet. I'm waiting for the manager's approval on the budget.\nM: We should do it soon — prices go up closer to the date." },
    { id: 2, question: "What does the woman suggest?", options: ["Hiring more staff", "Changing the deadline", "Moving the meeting online", "Contacting the client directly"], correct: 2, passage: "W: The traffic is terrible today. I don't think we'll make it to the office in time.\nM: Should we postpone the meeting?\nW: Let's just do it online instead. Everyone has the link." },
    { id: 3, question: "What problem does the man mention?", options: ["The printer is broken.", "The file is missing.", "The internet is slow.", "The room is booked."], correct: 0, passage: "M: I tried to print the presentation but the printer keeps jamming.\nW: Did you try restarting it?\nM: Three times already. I think we need to call IT." },
  ],
  P4: [
    { id: 1, question: "What is the announcement about?", options: ["A store sale", "A flight delay", "A new service", "A schedule change"], correct: 1, passage: "Attention passengers: Flight KA205 to Singapore has been delayed by approximately two hours due to technical maintenance. We apologize for the inconvenience and ask passengers to remain in the departure lounge." },
    { id: 2, question: "Who is the message intended for?", options: ["Hotel guests", "Restaurant customers", "Office employees", "Store shoppers"], correct: 2, passage: "Good morning, everyone. This is a reminder that the quarterly performance review will be held this Friday at 2 PM in Conference Room B. Please bring your project summaries and be prepared to present your team's progress." },
    { id: 3, question: "What does the speaker ask listeners to do?", options: ["Call a number", "Visit a website", "Fill out a form", "Attend a meeting"], correct: 0, passage: "Thank you for calling City Bank customer service. For account inquiries, press 1. To report a lost card, press 2. To speak with a representative, please stay on the line or call us back at 1-800-555-0199." },
  ],
  P5: [
    { id: 1, question: "The manager asked all employees to _____ the new safety guidelines.", options: ["follow", "following", "followed", "follows"], correct: 0 },
    { id: 2, question: "The conference will be held _____ the Grand Hotel next month.", options: ["in", "at", "on", "by"], correct: 1 },
    { id: 3, question: "She has been working at this company _____ five years.", options: ["since", "for", "during", "while"], correct: 1 },
    { id: 4, question: "The new policy _____ effective starting next Monday.", options: ["become", "becomes", "became", "becoming"], correct: 1 },
    { id: 5, question: "Please submit your application _____ the deadline.", options: ["before", "after", "during", "since"], correct: 0 },
    { id: 6, question: "The report must be _____ by the end of the week.", options: ["complete", "completed", "completing", "completion"], correct: 1 },
  ],
  P6: [
    { id: 1, question: "Choose the best word to complete the email: 'We are writing to inform you that your order _____ been shipped.'", options: ["have", "has", "had", "having"], correct: 1, passage: "Dear Mr. Johnson,\nWe are writing to inform you that your order _____ been shipped and is expected to arrive within 3-5 business days. Please keep your tracking number for reference." },
    { id: 2, question: "Choose the best word: 'The meeting has been _____ to next Tuesday.'", options: ["postponed", "cancelled", "scheduled", "confirmed"], correct: 0, passage: "Dear Team,\nDue to a scheduling conflict, the weekly meeting has been _____ to next Tuesday at the same time. Please update your calendars accordingly." },
    { id: 3, question: "Choose the best word: 'Applicants must _____ a cover letter with their resume.'", options: ["include", "including", "included", "includes"], correct: 0, passage: "Job Application Requirements:\nAll applicants must _____ a cover letter with their resume. Applications without a cover letter will not be considered for the position." },
  ],
  P7: [
    { id: 1, question: "What is the main purpose of this notice?", options: ["To announce a new product", "To inform about office closure", "To invite staff to a party", "To request budget approval"], correct: 1, passage: "NOTICE\nPlease be advised that our office will be closed on December 25th and 26th for the Christmas holiday. Normal business hours will resume on December 27th. For urgent matters, please contact our emergency line at ext. 999." },
    { id: 2, question: "According to the article, what caused the delay?", options: ["Bad weather conditions", "Technical problems", "Staff shortage", "Budget cuts"], correct: 0, passage: "The annual technology conference, originally scheduled for March 15th, has been postponed to April 20th. Organizers cited severe weather forecasts as the primary reason for the change. All registered participants will be notified by email." },
    { id: 3, question: "What benefit is mentioned for premium members?", options: ["Free shipping", "Priority customer service", "Discount on all products", "Early access to new items"], correct: 3, passage: "Upgrade to Premium Membership today and enjoy exclusive benefits including early access to new product launches, a 15% discount on selected items, free standard shipping on orders over $50, and dedicated customer support available 24/7." },
  ],
};

export default function ToeicPractice() {
  const [open, setOpen] = useState(false);
  const [activePart, setActivePart] = useState<Part>("P1");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);

  const questions = QUESTIONS[activePart];
  const partInfo = PARTS.find(p => p.id === activePart)!;

  const switchPart = (part: Part) => {
    setActivePart(part);
    setAnswers({});
    setFlagged(new Set());
    setChecked(false);
  };

  const key = (partId: Part, qId: number) => `${partId}-${qId}`;
  const answered = Object.keys(answers).length;
  const score = questions.filter(q => answers[key(activePart, q.id)] === q.correct).length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(10,6,24,0.95)", border: "1px solid rgba(59,130,246,0.2)" }}>
      {/* Header - always visible */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm">📝 Luyện tập TOEIC — 200 câu</span>
          <span className="text-gray-500 text-xs">· 7 parts · 120 phút</span>
        </div>
        <span className="text-blue-400 text-xs font-semibold">{open ? "Thu gọn ▲" : "Bắt đầu ▼"}</span>
      </button>

      {!open ? null : (<>

      {/* Part tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 overflow-x-auto scrollbar-hide">
        <span className="text-blue-400 text-[10px] font-bold mr-1 shrink-0">LISTENING</span>
        {PARTS.filter(p => p.type === "listening").map(p => (
          <button key={p.id} onClick={() => switchPart(p.id)}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1",
              activePart === p.id ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700")}>
            {p.id} <span className="text-[10px] opacity-60">{p.count}</span>
          </button>
        ))}
        <span className="text-blue-400 text-[10px] font-bold mx-1 shrink-0">READING</span>
        {PARTS.filter(p => p.type === "reading").map(p => (
          <button key={p.id} onClick={() => switchPart(p.id)}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all flex items-center gap-1",
              activePart === p.id ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700")}>
            {p.id} <span className="text-[10px] opacity-60">{p.count}</span>
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="px-4 py-3 flex flex-col gap-4 max-h-[480px] overflow-y-auto scrollbar-hide">
        {questions.map((q, i) => {
          const qKey = key(activePart, q.id);
          const picked = answers[qKey];
          const isFlagged = flagged.has(qKey);
          const isCorrect = checked && picked === q.correct;
          const isWrong = checked && picked !== undefined && picked !== q.correct;

          return (
            <div key={q.id} className={cn("rounded-xl border transition-colors",
              checked ? isCorrect ? "border-green-600/30" : isWrong ? "border-red-600/30" : "border-white/5" : "border-white/5"
            )} style={{ background: "rgba(18,12,36,0.8)" }}>

              {/* P1: image + audio */}
              {activePart === "P1" && q.image && (
                <div className="flex gap-3 p-3">
                  <div className="w-1/2">
                    <img src={q.image} alt="" className="w-full rounded-lg object-cover" style={{ maxHeight: 160 }} />
                    <audio controls className="w-full mt-2 h-8" style={{ filter: "invert(0.8)" }}>
                      <source src="" type="audio/mpeg" />
                    </audio>
                  </div>
                  <div className="w-1/2 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-xs font-semibold">Câu {i + 1}</span>
                      <button onClick={() => setFlagged(prev => { const n = new Set(prev); n.has(qKey) ? n.delete(qKey) : n.add(qKey); return n; })}
                        className={cn("transition-colors", isFlagged ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400")}>
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {q.options.map((opt, j) => {
                        const isRight = j === q.correct;
                        const isPicked = picked === j;
                        return (
                          <button key={j} onClick={() => !checked && setAnswers(p => ({ ...p, [qKey]: j }))}
                            disabled={checked}
                            className={cn("px-2.5 py-1.5 rounded-lg border text-xs text-left transition-all flex items-center gap-2",
                              checked ? isRight ? "border-green-500 bg-green-900/30 text-green-300" : isPicked ? "border-red-500 bg-red-900/30 text-red-300" : "border-gray-700 text-gray-600 opacity-40"
                              : isPicked ? "border-blue-500 bg-blue-900/30 text-white" : "border-gray-700 bg-gray-800 text-gray-300 hover:border-blue-500")}>
                            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                              checked ? isRight ? "bg-green-600 text-white" : isPicked ? "bg-red-600 text-white" : "bg-gray-800 text-gray-500"
                              : isPicked ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400")}>
                              {["A","B","C","D"][j]}
                            </span>
                            <span className="line-clamp-2">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* P2: audio + A/B/C */}
              {activePart === "P2" && (
                <div className="p-3">
                  <audio controls className="w-full h-8 mb-2" style={{ filter: "invert(0.8)" }}>
                    <source src="" type="audio/mpeg" />
                  </audio>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm font-medium">Câu {i + 1}. {q.question}</span>
                    <button onClick={() => setFlagged(prev => { const n = new Set(prev); n.has(qKey) ? n.delete(qKey) : n.add(qKey); return n; })}
                      className={cn("shrink-0 ml-2 transition-colors", isFlagged ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400")}>
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {q.options.map((opt, j) => {
                      const isRight = j === q.correct;
                      const isPicked = picked === j;
                      return (
                        <button key={j} onClick={() => !checked && setAnswers(p => ({ ...p, [qKey]: j }))}
                          disabled={checked}
                          className={cn("px-3 py-1.5 rounded-lg border text-xs font-bold transition-all",
                            checked ? isRight ? "border-green-500 bg-green-900/30 text-green-300" : isPicked ? "border-red-500 bg-red-900/30 text-red-300" : "border-gray-700 text-gray-600 opacity-40"
                            : isPicked ? "border-blue-500 bg-blue-900/30 text-white" : "border-gray-700 bg-gray-800 text-gray-300 hover:border-blue-500")}>
                          {["A","B","C"][j]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* P3/P4: passage + audio + question + A/B/C/D */}
              {(activePart === "P3" || activePart === "P4") && (
                <div className="p-3">
                  {q.passage && (
                    <div className="mb-2 px-3 py-2 rounded-lg text-xs text-gray-400 italic whitespace-pre-line"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      🎧 {q.passage}
                    </div>
                  )}
                  <audio controls className="w-full h-8 mb-2" style={{ filter: "invert(0.8)" }}>
                    <source src="" type="audio/mpeg" />
                  </audio>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white text-sm">Câu {i + 1}. {q.question}</p>
                    <button onClick={() => setFlagged(prev => { const n = new Set(prev); n.has(qKey) ? n.delete(qKey) : n.add(qKey); return n; })}
                      className={cn("shrink-0 transition-colors", isFlagged ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400")}>
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {q.options.map((opt, j) => {
                      const isRight = j === q.correct; const isPicked = picked === j;
                      return (
                        <button key={j} onClick={() => !checked && setAnswers(p => ({ ...p, [qKey]: j }))} disabled={checked}
                          className={cn("px-3 py-2 rounded-xl border text-sm text-left flex items-center gap-2 transition-all",
                            checked ? isRight ? "border-green-500 bg-green-900/30 text-green-300" : isPicked ? "border-red-500 bg-red-900/30 text-red-300" : "border-gray-700 text-gray-600 opacity-40"
                            : isPicked ? "border-blue-500 bg-blue-900/30 text-white" : "border-gray-700 bg-gray-800 text-gray-300 hover:border-blue-500")}>
                          <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                            checked ? isRight ? "bg-green-600 text-white" : isPicked ? "bg-red-600 text-white" : "bg-gray-800 text-gray-500"
                            : isPicked ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400")}>
                            {["A","B","C","D"][j]}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* P5/P6/P7: reading */}
              {(activePart === "P5" || activePart === "P6" || activePart === "P7") && (
                <div className="p-3">
                  {q.passage && (
                    <div className="mb-3 px-3 py-2.5 rounded-lg text-xs text-gray-300 leading-relaxed"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      {q.passage}
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white text-sm">Câu {i + 1}. {q.question}</p>
                    <button onClick={() => setFlagged(prev => { const n = new Set(prev); n.has(qKey) ? n.delete(qKey) : n.add(qKey); return n; })}
                      className={cn("shrink-0 transition-colors", isFlagged ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400")}>
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {q.options.map((opt, j) => {
                      const isRight = j === q.correct; const isPicked = picked === j;
                      return (
                        <button key={j} onClick={() => !checked && setAnswers(p => ({ ...p, [qKey]: j }))} disabled={checked}
                          className={cn("px-3 py-2 rounded-xl border text-sm text-left flex items-center gap-2 transition-all",
                            checked ? isRight ? "border-green-500 bg-green-900/30 text-green-300" : isPicked ? "border-red-500 bg-red-900/30 text-red-300" : "border-gray-700 text-gray-600 opacity-40"
                            : isPicked ? "border-blue-500 bg-blue-900/30 text-white" : "border-gray-700 bg-gray-800 text-gray-300 hover:border-blue-500")}>
                          <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                            checked ? isRight ? "bg-green-600 text-white" : isPicked ? "bg-red-600 text-white" : "bg-gray-800 text-gray-500"
                            : isPicked ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400")}>
                            {["A","B","C","D"][j]}
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Check button */}
        {!checked ? (
          <button onClick={() => setChecked(true)} disabled={answered < questions.length}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-bold transition-colors">
            Kiểm tra ({answered}/{questions.length} câu)
          </button>
        ) : (
          <div className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="flex items-center gap-2">
              {score === questions.length ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-blue-400" />}
              <span className="text-white text-sm font-bold">{score}/{questions.length} đúng</span>
            </div>
            <button onClick={() => { setAnswers({}); setChecked(false); setFlagged(new Set()); }}
              className="text-xs text-gray-400 hover:text-white transition-colors">Làm lại</button>
          </div>
        )}
      </div>
      </>)}
    </div>
  );
}
