"use client";
import { useState, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2, ChevronRight, CheckCircle2, XCircle, Target, Map, Clock, Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakText } from "@/components/VoiceButton";

const QUESTIONS: any[] = [
  // Grammar
  { id:1, skill:"grammar", type:"multiple-choice", level:"A1", question:"Choose the correct sentence:", options:["She don't like coffee.","She doesn't like coffee.","She not like coffee.","She isn't like coffee."], correct:1 },
  { id:2, skill:"grammar", type:"multiple-choice", level:"A1", question:"'I ___ to the gym every day.'", options:["am going","go","goes","gone"], correct:1 },
  { id:3, skill:"grammar", type:"multiple-choice", level:"A2", question:"'She ___ TV when I called her.'", options:["watched","was watching","is watching","watches"], correct:1 },
  { id:4, skill:"grammar", type:"multiple-choice", level:"B1", question:"'If I ___ rich, I would travel the world.'", options:["am","was","were","be"], correct:2 },
  { id:5, skill:"grammar", type:"multiple-choice", level:"B2", question:"'Despite ___ tired, she finished the project.'", options:["be","being","been","to be"], correct:1 },
  { id:6, skill:"grammar", type:"multiple-choice", level:"C1", question:"'Had I known earlier, I ___ differently.'", options:["would act","would have acted","will act","acted"], correct:1 },
  // Vocabulary
  { id:7, skill:"vocabulary", type:"multiple-choice", level:"A1", question:"What does 'happy' mean?", options:["Buồn","Vui vẻ","Tức giận","Mệt mỏi"], correct:1 },
  { id:8, skill:"vocabulary", type:"multiple-choice", level:"A2", question:"Choose the word meaning 'very big':", options:["tiny","huge","narrow","shallow"], correct:1 },
  { id:9, skill:"vocabulary", type:"multiple-choice", level:"B1", question:"'Ambitious' means:", options:["lazy","having strong desire to succeed","very friendly","easily frightened"], correct:1 },
  { id:10, skill:"vocabulary", type:"multiple-choice", level:"C1", question:"'Ubiquitous' means:", options:["rare","present everywhere","extremely large","very old"], correct:1 },
  // Reading
  { id:11, skill:"reading", type:"multiple-choice", level:"A2", passage:"Tom wakes up at 7am every day. He eats breakfast, then walks to school. He likes math and science.", question:"What time does Tom wake up?", options:["6am","7am","8am","9am"], correct:1 },
  { id:12, skill:"reading", type:"multiple-choice", level:"B1", passage:"Climate change is causing temperatures to rise worldwide. Scientists warn that without action, sea levels could rise by 1 meter by 2100.", question:"What do scientists warn about?", options:["Temperatures will fall","Sea levels could rise by 1 meter","Climate change is not real","Action is not needed"], correct:1 },
  { id:13, skill:"reading", type:"fill-blank", level:"B2", question:"'The experiment was conducted by a team of researchers.' → The subject of this passive sentence is ___.", correct:"the experiment", hint:"What is being conducted?" },
  // Listening
  { id:14, skill:"listening", type:"listen-choice", level:"A1", listenText:"Hello, my name is Sarah. I am from England.", question:"Where is Sarah from?", options:["America","Australia","England","Ireland"], correct:2 },
  { id:15, skill:"listening", type:"listen-choice", level:"A2", listenText:"The train to London departs at half past three from platform five.", question:"What time does the train depart?", options:["3:00","3:15","3:30","3:45"], correct:2 },
  { id:16, skill:"listening", type:"listen-choice", level:"B1", listenText:"Despite the heavy rain, the outdoor concert was not cancelled. The organizers decided to continue because most tickets had already been sold.", question:"Why was the concert not cancelled?", options:["The rain stopped","Most tickets were sold","The venue was indoors","The artists refused to cancel"], correct:1 },
  // Writing
  { id:17, skill:"writing", type:"fill-blank", level:"A2", question:"Fill in: 'There ___ many students in the classroom.' (to be)", correct:"are", hint:"plural subject" },
  { id:18, skill:"writing", type:"fill-blank", level:"B1", question:"Fill in: 'The report ___ (write) by the team last week.' (passive)", correct:"was written", hint:"Passive voice, past simple" },
  // Speaking
  { id:19, skill:"speaking", type:"speak", level:"A2", listenText:"I would like to order a coffee, please.", question:"Say this sentence aloud: 'I would like to order a coffee, please.'", correct:"i would like to order a coffee please" },
  { id:20, skill:"speaking", type:"speak", level:"B1", listenText:"She has been working here for five years.", question:"Say this sentence aloud: 'She has been working here for five years.'", correct:"she has been working here for five years" },
];

const SKILL_LABELS: Record<string,{label:string;color:string;emoji:string}> = {
  grammar:    {label:"Ngữ pháp", color:"#6366f1", emoji:"📐"},
  vocabulary: {label:"Từ vựng",  color:"#10b981", emoji:"📚"},
  reading:    {label:"Đọc hiểu", color:"#3b82f6", emoji:"📖"},
  listening:  {label:"Nghe",     color:"#f59e0b", emoji:"🎧"},
  writing:    {label:"Viết",     color:"#8b5cf6", emoji:"✍️"},
  speaking:   {label:"Nói",      color:"#ec4899", emoji:"🎤"},
};

type Answer = {question:string;userAnswer:string;correctAnswer:string;type:string;correct:boolean;skill:string};

export default function PlacementPage() {
  const { settings, setSettings } = useAppStore();
  const [step, setStep] = useState<"intro"|"test"|"analyzing"|"result">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<number|string|null>(null);
  const [fillInput, setFillInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const recRef = useRef<any>(null);

  const q = QUESTIONS[current];
  const score = answers.filter(a => a.correct).length;

  const submitAnswer = async (answer: string, isCorrect: boolean) => {
    const newAnswers = [...answers, {
      question: q.question,
      userAnswer: answer,
      correctAnswer: (q.type === "multiple-choice" || q.type === "listen-choice") ? q.options[q.correct] : q.correct,
      type: q.type, skill: q.skill, correct: isCorrect,
    }];
    setAnswers(newAnswers);
    if (current + 1 >= QUESTIONS.length) {
      setStep("analyzing");
      try {
        const res = await fetch("/api/placement-test", {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ answers: newAnswers, targetLanguage: settings.targetLanguage.name, nativeLanguage: settings.nativeLanguage.name }),
        });
        const data = await res.json();
        setResult(data);
        if (data.level) setSettings({ level: data.level });
        localStorage.setItem("lingua-placement-done", "1");
        setStep("result");
      } catch { setStep("result"); }
    } else {
      setTimeout(() => { setCurrent(c => c+1); setSelected(null); setFillInput(""); setSpokenText(""); }, 700);
    }
  };

  const handleMC = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => submitAnswer(q.options[idx], idx === q.correct), 700);
  };

  const handleFill = () => {
    const isCorrect = fillInput.trim().toLowerCase() === q.correct.toLowerCase();
    setSelected(fillInput);
    setTimeout(() => submitAnswer(fillInput, isCorrect), 700);
  };

  const startSpeaking = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Dùng Chrome để nhận diện giọng nói."); return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.toLowerCase().replace(/[.,!?]/g,"");
      setSpokenText(transcript); setIsRecording(false);
      const isCorrect = transcript.includes(q.correct.split(" ").slice(0,4).join(" "));
      setSelected(transcript);
      setTimeout(() => submitAnswer(transcript, isCorrect), 700);
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    recRef.current = rec; rec.start(); setIsRecording(true);
  };

  const pct = Math.round((score / QUESTIONS.length) * 100);

  if (step === "intro") return (
    <div className="p-5 max-w-lg">
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Target className="w-5 h-5 text-primary-400" /> Kiểm tra trình độ</h1>
        <p className="text-sm text-gray-500 mt-1">AI xác định level và tạo lộ trình học cá nhân</p>
      </div>
      <div className="rounded-2xl p-5 mb-5" style={{background:"linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.1))",border:"1px solid rgba(139,92,246,0.3)"}}>
        <div className="text-4xl mb-3">🎯</div>
        <h2 className="text-white font-bold text-lg mb-2">Placement Test</h2>
        <p className="text-gray-300 text-sm mb-4">{QUESTIONS.length} câu hỏi · ~10 phút · Kiểm tra 6 kỹ năng</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(SKILL_LABELS).map(([k,v]) => (
            <div key={k} className="flex items-center gap-1.5 text-xs text-gray-400"><span>{v.emoji}</span>{v.label}</div>
          ))}
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Xác định trình độ A1-C2</div>
          <div className="flex items-center gap-2"><Map className="w-4 h-4 text-blue-400" /> Tạo roadmap học 8 tuần</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-400" /> Kế hoạch học mỗi ngày</div>
        </div>
      </div>
      <button onClick={() => setStep("test")} className="w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors">
        Bắt đầu kiểm tra <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  if (step === "analyzing") return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      <p className="text-white font-semibold">AI đang phân tích kết quả...</p>
    </div>
  );

  if (step === "result") return (
    <div className="p-5 max-w-lg">
      <h1 className="text-xl font-bold text-white pt-2 mb-5">Kết quả kiểm tra</h1>
      <div className="rounded-2xl p-5 mb-4 text-center" style={{background:"linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.15))",border:"1px solid rgba(139,92,246,0.3)"}}>
        <div className="text-5xl font-black text-white mb-1">{result?.level ?? "B1"}</div>
        <p className="text-gray-300 text-sm">{score}/{QUESTIONS.length} câu đúng · {pct}%</p>
        {result?.motivationalMessage && <p className="text-primary-300 text-sm mt-3 italic">"{result.motivationalMessage}"</p>}
      </div>
      {/* Skill breakdown */}
      <div className="rounded-2xl p-4 mb-4" style={{background:"rgba(26,16,53,0.8)",border:"1px solid rgba(139,92,246,0.15)"}}>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Kết quả theo kỹ năng</p>
        {Object.entries(SKILL_LABELS).map(([skill,info]) => {
          const sa = answers.filter(a => a.skill === skill);
          if (!sa.length) return null;
          const c = sa.filter(a => a.correct).length;
          return (
            <div key={skill} className="flex items-center gap-3 mb-2">
              <span className="text-base w-6">{info.emoji}</span>
              <span className="text-xs text-gray-400 w-20">{info.label}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div className="h-2 rounded-full" style={{width:`${Math.round(c/sa.length*100)}%`,background:info.color}} />
              </div>
              <span className="text-xs text-gray-400 w-10 text-right">{c}/{sa.length}</span>
            </div>
          );
        })}
      </div>
      {result?.roadmap?.length > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{background:"rgba(26,16,53,0.8)",border:"1px solid rgba(139,92,246,0.15)"}}>
          <p className="text-xs text-yellow-400 font-semibold mb-3">🗺️ Lộ trình 8 tuần</p>
          {result.roadmap.slice(0,4).map((week: any) => (
            <div key={week.week} className="flex gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-primary-600/30 flex items-center justify-center text-xs font-bold text-primary-300 shrink-0">W{week.week}</div>
              <div><p className="text-sm text-white font-medium">{week.focus}</p><p className="text-xs text-gray-500">{week.estimatedHours}h · {week.goals?.[0]}</p></div>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => { setStep("intro"); setCurrent(0); setAnswers([]); setSelected(null); setResult(null); setSpokenText(""); }}
        className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 text-sm transition-colors">
        Làm lại bài test
      </button>
    </div>
  );

  // Test UI
  const skillInfo = SKILL_LABELS[q.skill];
  return (
    <div className="p-5 max-w-lg">
      <div className="pt-2 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">Câu {current+1}/{QUESTIONS.length}</p>
          <p className="text-sm text-primary-400 font-medium">{score} đúng</p>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className="bg-primary-500 h-2 rounded-full transition-all" style={{width:`${(current/QUESTIONS.length)*100}%`}} />
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{background:`${skillInfo.color}20`,color:skillInfo.color,border:`1px solid ${skillInfo.color}40`}}>
          {skillInfo.emoji} {skillInfo.label}
        </span>
        <span className="text-xs text-gray-600">{q.level}</span>
      </div>
      {q.passage && (
        <div className="rounded-xl p-3 mb-3" style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)"}}>
          <p className="text-xs text-blue-400 font-semibold mb-1">📖 Đọc đoạn văn:</p>
          <p className="text-gray-200 text-sm leading-relaxed">{q.passage}</p>
        </div>
      )}
      {(q.type === "listen-choice" || q.type === "speak") && q.listenText && (
        <div className="rounded-xl p-3 mb-3 flex items-center gap-3" style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)"}}>
          <button onClick={() => speakText(q.listenText, "en-US")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-300 text-xs font-medium transition-colors">
            <Volume2 className="w-4 h-4" /> Nghe
          </button>
          <p className="text-xs text-gray-400">{q.type === "speak" ? "Nghe rồi nói lại câu này" : "Nghe và chọn đáp án đúng"}</p>
        </div>
      )}
      <div className="rounded-2xl p-5 mb-5" style={{background:"rgba(26,16,53,0.9)",border:"1px solid rgba(139,92,246,0.2)"}}>
        <p className="text-white font-semibold text-base leading-relaxed">{q.question}</p>
        {q.hint && <p className="text-xs text-gray-500 mt-1">💡 {q.hint}</p>}
      </div>
      {(q.type === "multiple-choice" || q.type === "listen-choice") && (
        <div className="flex flex-col gap-2">
          {q.options.map((opt: string, i: number) => {
            const isCorrect = i === q.correct;
            const isSelected = selected === i;
            return (
              <button key={i} onClick={() => handleMC(i)} disabled={selected !== null}
                className={cn("px-4 py-3.5 rounded-xl border text-sm font-medium text-left transition-all flex items-center justify-between",
                  selected === null ? "border-gray-700 bg-gray-800 text-gray-200 hover:border-primary-500 hover:bg-primary-900/20"
                    : isCorrect ? "border-green-500 bg-green-900/30 text-green-300"
                    : isSelected ? "border-red-500 bg-red-900/30 text-red-300"
                    : "border-gray-700 bg-gray-800 text-gray-500 opacity-50")}>
                <span>{opt}</span>
                {selected !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {selected !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400" />}
              </button>
            );
          })}
        </div>
      )}
      {q.type === "fill-blank" && (
        <div className="flex flex-col gap-3">
          <input value={fillInput} onChange={e => setFillInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fillInput.trim() && handleFill()}
            placeholder="Nhập câu trả lời..." disabled={selected !== null}
            className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 text-sm"
            style={{background:"rgba(26,16,53,0.8)"}} />
          {selected && (
            <div className={cn("rounded-xl px-4 py-2 text-sm", fillInput.trim().toLowerCase() === q.correct.toLowerCase() ? "bg-green-900/20 text-green-300 border border-green-600/30" : "bg-red-900/20 text-red-300 border border-red-600/30")}>
              {fillInput.trim().toLowerCase() === q.correct.toLowerCase() ? "✅ Đúng!" : `❌ Đáp án đúng: ${q.correct}`}
            </div>
          )}
          <button onClick={handleFill} disabled={!fillInput.trim() || selected !== null}
            className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
            Xác nhận
          </button>
        </div>
      )}
      {q.type === "speak" && (
        <div className="flex flex-col gap-3">
          {spokenText && (
            <div className={cn("rounded-xl px-4 py-3 text-sm border", spokenText.includes(q.correct.split(" ").slice(0,4).join(" ")) ? "bg-green-900/20 text-green-300 border-green-600/30" : "bg-red-900/20 text-red-300 border-red-600/30")}>
              <p className="text-xs text-gray-500 mb-1">Bạn đã nói:</p>
              <p>"{spokenText}"</p>
            </div>
          )}
          <button onClick={isRecording ? () => { recRef.current?.stop(); setIsRecording(false); } : startSpeaking}
            disabled={selected !== null}
            className={cn("w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all", isRecording ? "bg-red-600 animate-pulse" : "bg-pink-600 hover:bg-pink-500", selected !== null && "opacity-50 cursor-not-allowed")}>
            {isRecording ? <><MicOff className="w-5 h-5" /> Dừng ghi âm</> : <><Mic className="w-5 h-5" /> Bắt đầu nói</>}
          </button>
          {!isRecording && !selected && (
            <button onClick={() => submitAnswer("(bỏ qua)", false)} className="text-center text-xs text-gray-600 hover:text-gray-400 transition-colors">Bỏ qua câu này</button>
          )}
        </div>
      )}
    </div>
  );
}
