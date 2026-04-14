"use client";
import { useState, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  Camera, Upload, Loader2, Volume2, Plus, Copy,
  BookOpen, FileText, Sparkles, X, ZoomIn,
} from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

interface OcrResult {
  extractedText: string;
  detectedLanguage: string;
  translation: string;
  grammarStructures: { structure: string; example: string; explanation: string }[];
  vocabulary: { word: string; translation: string; partOfSpeech: string; example: string }[];
  summary: string;
}

export default function OcrPage() {
  const { settings, addFlashcard } = useAppStore();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"text" | "grammar" | "vocab">("text");
  const [zoomImg, setZoomImg] = useState(false);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const processImage = async (base64: string) => {
    setLoading(true);
    setError("");
    setResult(null);
    setActiveTab("text");
    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Không thể đọc ảnh. Thử lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Chỉ hỗ trợ file ảnh."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Ảnh quá lớn (tối đa 10MB)."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImage(base64);
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const saveVocab = (word: string, translation: string, example: string) => {
    addFlashcard({
      id: Date.now().toString(),
      word, translation, example,
      language: settings.targetLanguage.code,
    });
    setSavedWords(prev => new Set([...prev, word]));
  };

  const copyText = (text: string) => navigator.clipboard.writeText(text);

  const TABS = [
    { id: "text", label: "Văn bản", icon: FileText },
    { id: "grammar", label: "Ngữ pháp", icon: Sparkles },
    { id: "vocab", label: "Từ vựng", icon: BookOpen },
  ] as const;

  return (
    <div className="p-5 max-w-2xl">
      <div className="mb-5 pt-2">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary-400" /> Quét văn bản (OCR)
        </h1>
        <p className="text-sm text-gray-500 mt-1">Chụp ảnh sách, menu, biển hiệu → AI dịch & giải thích ngữ pháp</p>
      </div>

      {/* Upload area */}
      {!image ? (
        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          className="rounded-2xl border-2 border-dashed border-gray-700 hover:border-primary-500 transition-colors p-8 flex flex-col items-center gap-4 cursor-pointer mb-5"
          style={{ background: "rgba(26,16,53,0.5)" }}
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-600/20 flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">Kéo thả ảnh vào đây</p>
            <p className="text-gray-500 text-sm mt-1">hoặc nhấn để chọn file</p>
            <p className="text-gray-600 text-xs mt-2">JPG, PNG, WEBP · Tối đa 10MB</p>
          </div>
          <div className="flex gap-3">
            <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors">
              <Upload className="w-4 h-4" /> Chọn ảnh
            </button>
            <button onClick={e => { e.stopPropagation(); cameraRef.current?.click(); }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors">
              <Camera className="w-4 h-4" /> Chụp ảnh
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div className="relative mb-5 rounded-2xl overflow-hidden group">
          <img src={image} alt="uploaded" className={cn("w-full object-contain rounded-2xl transition-all", zoomImg ? "max-h-none" : "max-h-64")} />
          <div className="absolute top-2 right-2 flex gap-2">
            <button onClick={() => setZoomImg(!zoomImg)} className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={() => { setImage(null); setResult(null); setError(""); }}
              className="p-2 rounded-xl bg-black/60 text-white hover:bg-red-600/80 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 rounded-2xl">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
              <p className="text-white text-sm font-medium">AI đang đọc ảnh...</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-900/20 border border-red-700/40 text-red-300 text-sm">{error}</div>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          {/* Summary */}
          {result.summary && (
            <div className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.1))", border: "1px solid rgba(139,92,246,0.3)" }}>
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-purple-400 font-semibold mb-1">Tóm tắt · {result.detectedLanguage}</p>
                <p className="text-gray-200 text-sm">{result.summary}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(26,16,53,0.8)" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
                  activeTab === tab.id ? "bg-primary-600 text-white" : "text-gray-400 hover:text-gray-200")}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.id === "grammar" && result.grammarStructures?.length > 0 && (
                  <span className="bg-white/20 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {result.grammarStructures.length}
                  </span>
                )}
                {tab.id === "vocab" && result.vocabulary?.length > 0 && (
                  <span className="bg-white/20 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {result.vocabulary.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab: Text */}
          {activeTab === "text" && (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Văn bản gốc</p>
                  <div className="flex gap-2">
                    <button onClick={() => speakText(result.extractedText, settings.targetLanguage.code)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-gray-700 transition-colors">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => copyText(result.extractedText)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 hover:bg-gray-700 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{result.extractedText}</p>
              </div>

              <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Bản dịch ({settings.nativeLanguage.name})</p>
                  <button onClick={() => copyText(result.translation)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 hover:bg-gray-700 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{result.translation}</p>
              </div>
            </div>
          )}

          {/* Tab: Grammar */}
          {activeTab === "grammar" && (
            <div className="flex flex-col gap-3">
              {result.grammarStructures?.length > 0 ? result.grammarStructures.map((g, i) => (
                <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(234,179,8,0.2)" }}>
                  <p className="text-yellow-400 font-semibold text-sm mb-2">📐 {g.structure}</p>
                  <button onClick={() => speakText(g.example, settings.targetLanguage.code)}
                    className="text-white text-sm italic hover:text-yellow-300 transition-colors text-left mb-2 block">
                    "{g.example}"
                  </button>
                  <p className="text-gray-400 text-sm">{g.explanation}</p>
                </div>
              )) : (
                <p className="text-gray-500 text-sm text-center py-8">Không tìm thấy cấu trúc ngữ pháp đặc biệt</p>
              )}
            </div>
          )}

          {/* Tab: Vocabulary */}
          {activeTab === "vocab" && (
            <div className="flex flex-col gap-2">
              {result.vocabulary?.length > 0 ? result.vocabulary.map((v, i) => {
                const saved = savedWords.has(v.word);
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                    <button onClick={() => speakText(v.word, settings.targetLanguage.code)}
                      className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-primary-400 shrink-0 mt-0.5 transition-colors">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{v.word}</span>
                        {v.partOfSpeech && (
                          <span className="text-xs bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded">{v.partOfSpeech}</span>
                        )}
                      </div>
                      <p className="text-primary-300 text-sm mt-0.5">{v.translation}</p>
                      {v.example && <p className="text-gray-500 text-xs mt-0.5 italic">{v.example}</p>}
                    </div>
                    <button onClick={() => saveVocab(v.word, v.translation, v.example)}
                      disabled={saved}
                      className={cn("p-1.5 rounded-lg transition-colors shrink-0",
                        saved ? "bg-green-900/30 text-green-400" : "bg-accent-600/20 hover:bg-accent-600/40 text-accent-400")}>
                      {saved ? "✓" : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              }) : (
                <p className="text-gray-500 text-sm text-center py-8">Không tìm thấy từ vựng đáng chú ý</p>
              )}
            </div>
          )}

          {/* Re-scan button */}
          <button onClick={() => { setImage(null); setResult(null); }}
            className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200 text-sm font-medium transition-colors">
            Quét ảnh khác
          </button>
        </div>
      )}
    </div>
  );
}
