"use client";
import { useState, useRef, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Camera, Loader2, Volume2, Plus, RefreshCw, Zap, X, Focus } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

export default function CameraPage() {
  const { settings, addFlashcard } = useAppStore();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"scan" | "live">("scan");
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const analyze = async (base64: string) => {
    setLoading(true); setResult(null); setSelectedWord(null);
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
      setResult(data);
    } finally { setLoading(false); }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      const b64 = e.target?.result as string;
      setImage(b64);
      analyze(b64);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setStreaming(true);
    } catch { alert("Không thể mở camera. Hãy cấp quyền camera."); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setStreaming(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d")!;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const b64 = canvasRef.current.toDataURL("image/jpeg", 0.8);
    setImage(b64);
    stopCamera();
    analyze(b64);
  };

  const save = (word: string, translation: string, example: string) => {
    addFlashcard({ id: Date.now().toString(), word, translation, example, language: settings.targetLanguage.code });
    setSavedWords(p => new Set([...p, word]));
  };

  const reset = () => { setImage(null); setResult(null); setSelectedWord(null); setSavedWords(new Set()); };

  return (
    <div className="p-5 max-w-xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Camera className="w-5 h-5 text-green-400" /> Camera AI
        </h1>
        <p className="text-sm text-gray-500 mt-1">Mở camera → AI đọc chữ → dịch + phát âm · dùng ngoài đời thực</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <button onClick={() => { setMode("scan"); stopCamera(); }}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
            mode === "scan" ? "bg-primary-600 text-white" : "text-gray-400 hover:text-gray-200")}>
          <Camera className="w-4 h-4" /> Chụp ảnh
        </button>
        <button onClick={() => setMode("live")}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
            mode === "live" ? "bg-green-600 text-white" : "text-gray-400 hover:text-gray-200")}>
          <Zap className="w-4 h-4" /> Camera trực tiếp
        </button>
      </div>

      {/* Scan mode */}
      {mode === "scan" && !image && (
        <div className="rounded-2xl border-2 border-dashed border-gray-700 hover:border-primary-500 transition-colors p-8 flex flex-col items-center gap-4 cursor-pointer mb-5"
          style={{ background: "rgba(26,16,53,0.5)" }}
          onClick={() => cameraRef.current?.click()}>
          <div className="w-20 h-20 rounded-2xl bg-green-600/20 flex items-center justify-center">
            <Camera className="w-10 h-10 text-green-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">Chụp ảnh để dịch</p>
            <p className="text-gray-500 text-sm mt-1">Menu nhà hàng · Biển hiệu · Sách · Tài liệu</p>
          </div>
          <div className="flex gap-3">
            <button onClick={e => { e.stopPropagation(); cameraRef.current?.click(); }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors">
              <Camera className="w-4 h-4" /> Chụp ảnh
            </button>
            <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors">
              📁 Chọn file
            </button>
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      )}

      {/* Live camera mode */}
      {mode === "live" && (
        <div className="mb-5">
          {!streaming ? (
            <button onClick={startCamera}
              className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold flex items-center justify-center gap-2 transition-colors">
              <Camera className="w-5 h-5" /> Mở camera
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden">
              <video ref={videoRef} className="w-full rounded-2xl" playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-green-400 rounded-2xl opacity-70">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400 rounded-tl-xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400 rounded-tr-xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400 rounded-bl-xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400 rounded-br-xl" />
                </div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <button onClick={captureFrame}
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
                  <Focus className="w-8 h-8 text-gray-900" />
                </button>
                <button onClick={stopCamera}
                  className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image preview */}
      {image && (
        <div className="relative mb-4 rounded-2xl overflow-hidden">
          <img src={image} alt="captured" className="w-full max-h-56 object-contain rounded-2xl" />
          {loading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 rounded-2xl">
              <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
              <p className="text-white text-sm">AI đang đọc ảnh...</p>
            </div>
          )}
          <button onClick={reset} className="absolute top-2 right-2 p-2 rounded-xl bg-black/60 text-white hover:bg-red-600/80 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-4">
          {/* Summary */}
          {result.summary && (
            <div className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <span className="text-xl shrink-0">🔍</span>
              <div>
                <p className="text-xs text-green-400 font-semibold mb-1">{result.detectedLanguage}</p>
                <p className="text-gray-200 text-sm">{result.summary}</p>
              </div>
            </div>
          )}

          {/* Extracted text + translation */}
          {result.extractedText && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-semibold uppercase">Văn bản</p>
                <button onClick={() => speakText(result.extractedText, settings.targetLanguage.code)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 transition-colors">
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-white text-sm leading-relaxed mb-3">{result.extractedText}</p>
              {result.translation && (
                <>
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Dịch nghĩa</p>
                    <p className="text-gray-300 text-sm italic">{result.translation}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Vocabulary - clickable words */}
          {result.vocabulary?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-xs text-primary-400 font-semibold mb-3">📚 Từ vựng ({result.vocabulary.length} từ)</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {result.vocabulary.map((v: any, i: number) => (
                  <button key={i} onClick={() => setSelectedWord(selectedWord?.word === v.word ? null : v)}
                    className={cn("px-3 py-1.5 rounded-xl border text-sm font-medium transition-all",
                      selectedWord?.word === v.word
                        ? "border-primary-500 bg-primary-900/30 text-white"
                        : "border-gray-700 bg-gray-800 text-gray-300 hover:border-primary-500/50")}>
                    {v.word}
                  </button>
                ))}
              </div>

              {/* Selected word detail */}
              {selectedWord && (
                <div className="rounded-xl p-3 mt-2" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold">{selectedWord.word}</span>
                        {selectedWord.partOfSpeech && <span className="text-xs bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded">{selectedWord.partOfSpeech}</span>}
                      </div>
                      <p className="text-primary-300 text-sm">{selectedWord.translation}</p>
                      {selectedWord.example && <p className="text-gray-400 text-xs mt-1 italic">{selectedWord.example}</p>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => speakText(selectedWord.word, settings.targetLanguage.code)}
                        className="p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:text-primary-400 transition-colors">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => save(selectedWord.word, selectedWord.translation, selectedWord.example ?? "")}
                        disabled={savedWords.has(selectedWord.word)}
                        className={cn("p-1.5 rounded-lg transition-colors",
                          savedWords.has(selectedWord.word) ? "bg-green-900/30 text-green-400" : "bg-accent-600/20 hover:bg-accent-600/40 text-accent-400")}>
                        {savedWords.has(selectedWord.word) ? "✓" : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Grammar structures */}
          {result.grammarStructures?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(234,179,8,0.2)" }}>
              <p className="text-xs text-yellow-400 font-semibold mb-3">📐 Ngữ pháp</p>
              {result.grammarStructures.map((g: any, i: number) => (
                <div key={i} className="mb-3 last:mb-0">
                  <p className="text-yellow-300 text-sm font-medium">{g.structure}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{g.explanation}</p>
                </div>
              ))}
            </div>
          )}

          <button onClick={reset}
            className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 text-sm transition-colors flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Quét ảnh mới
          </button>
        </div>
      )}
    </div>
  );
}
