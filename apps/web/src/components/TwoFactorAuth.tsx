"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Shield, Loader2, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TwoFactorAuth() {
  const supabase = createClient();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  const enable2FA = async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (err: any) {
      setError(err.message || "Không thể bật 2FA");
    } finally { setLoading(false); }
  };

  const verify = async () => {
    if (!verifyCode || verifyCode.length !== 6) { setError("Nhập mã 6 số"); return; }
    setLoading(true); setError("");
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const factor = factors?.totp?.[0];
      if (!factor) throw new Error("Factor not found");
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code: verifyCode,
      });
      if (error) throw error;
      setEnabled(true);
      setSuccess("2FA đã được kích hoạt!");
      setQrCode("");
    } catch (err: any) {
      setError(err.message || "Mã không đúng");
    } finally { setLoading(false); }
  };

  const disable2FA = async () => {
    setLoading(true); setError("");
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const factor = factors?.totp?.[0];
      if (!factor) throw new Error("No factor found");
      const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
      if (error) throw error;
      setEnabled(false);
      setSuccess("2FA đã được tắt");
    } catch (err: any) {
      setError(err.message || "Không thể tắt 2FA");
    } finally { setLoading(false); }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.25)" }}>
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-purple-400" />
        <p className="text-sm font-semibold text-white">Xác thực 2 lớp (2FA)</p>
        {enabled && <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">Đã bật</span>}
      </div>
      <p className="text-xs text-gray-400 mb-4">Bảo vệ tài khoản với Google Authenticator hoặc app TOTP tương tự</p>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-red-400 text-xs">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
          <span className="text-green-400 text-xs">{success}</span>
        </div>
      )}

      {qrCode && (
        <div className="flex flex-col gap-3 mb-4">
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.95)" }}>
            <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs text-gray-500 mb-1">Hoặc nhập mã thủ công:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-white font-mono bg-black/30 px-2 py-1.5 rounded">{secret}</code>
              <button onClick={copySecret}
                className="p-1.5 rounded text-gray-400 hover:text-white transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <input value={verifyCode} onChange={e => setVerifyCode(e.target.value)}
            placeholder="Nhập mã 6 số từ app" maxLength={6}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 focus:outline-none focus:border-purple-500"
            style={{ background: "rgba(255,255,255,0.05)" }} />
          <button onClick={verify} disabled={loading || verifyCode.length !== 6}
            className="w-full py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
            Xác nhận & Kích hoạt
          </button>
        </div>
      )}

      {!enabled && !qrCode && (
        <button onClick={enable2FA} disabled={loading}
          className="w-full py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
          Bật 2FA
        </button>
      )}

      {enabled && !qrCode && (
        <button onClick={disable2FA} disabled={loading}
          className="w-full py-2.5 rounded-xl border border-red-600/40 text-red-400 hover:bg-red-900/20 font-medium text-sm transition-all disabled:opacity-40">
          {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
          Tắt 2FA
        </button>
      )}
    </div>
  );
}
