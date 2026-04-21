"use client";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase";
import { Send, Users, MessageCircle, Globe, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  text: string;
  lang: string;
  ts: number;
};

type OnlineUser = {
  userId: string;
  userName: string;
  avatar: string;
  lang: string;
};

const EMOJIS = ["😊","👍","🔥","💪","🎉","❤️","😂","🤔"];
const ROOMS = [
  { id: "general", label: "Chung", emoji: "🌐" },
  { id: "english", label: "English", emoji: "🇬🇧" },
  { id: "japanese", label: "日本語", emoji: "��" },
  { id: "korean", label: "한국어", emoji: "🇰🇷" },
];

function avatar(name: string) {
  return name ? name[0].toUpperCase() : "?";
}

function timeStr(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function CommunityPage() {
  const { user } = useAuthStore();
  const { settings } = useAppStore();
  const [tab, setTab] = useState<"chat" | "friends">("chat");
  const [room, setRoom] = useState("general");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const supabase = createClient();

  const myName = user?.name || user?.email?.split("@")[0] || "Ẩn danh";
  const myLang = settings.targetLanguage.flag + " " + settings.targetLanguage.name;

  useEffect(() => {
    // Leave old channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    setMessages([]);
    setOnlineUsers([]);

    const channel = supabase.channel(`community:${room}`, {
      config: { presence: { key: user?.id || "anon" } },
    });

    // Presence: track online users
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<OnlineUser>();
      const users: OnlineUser[] = [];
      Object.values(state).forEach((arr: any) => {
        arr.forEach((u: OnlineUser) => users.push(u));
      });
      setOnlineUsers(users);
    });

    // Broadcast: receive messages
    channel.on("broadcast", { event: "msg" }, ({ payload }: any) => {
      setMessages(prev => {
        if (prev.find(m => m.id === payload.id)) return prev;
        return [...prev.slice(-99), payload as Msg];
      });
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          userId: user?.id || "anon",
          userName: myName,
          avatar: avatar(myName),
          lang: myLang,
        });
      }
    });

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || !channelRef.current) return;
    const msg: Msg = {
      id: Date.now() + Math.random().toString(36).slice(2),
      userId: user?.id || "anon",
      userName: myName,
      avatar: avatar(myName),
      text,
      lang: myLang,
      ts: Date.now(),
    };
    setInput("");
    setShowEmoji(false);
    // Optimistic
    setMessages(prev => [...prev.slice(-99), msg]);
    await channelRef.current.send({ type: "broadcast", event: "msg", payload: msg });
  };

  const isMe = (msg: Msg) => msg.userId === (user?.id || "anon");

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 shrink-0">
        <h1 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-blue-400" /> Cộng đồng
        </h1>
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl mb-3" style={{ background: "rgba(15,10,30,0.6)" }}>
          <button onClick={() => setTab("chat")}
            className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
              tab === "chat" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200")}>
            <MessageCircle className="w-3.5 h-3.5" /> Chat cộng đồng
          </button>
          <button onClick={() => setTab("friends")}
            className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
              tab === "friends" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200")}>
            <Users className="w-3.5 h-3.5" /> Bạn bè ({onlineUsers.length})
          </button>
        </div>
        {/* Room selector (chat tab only) */}
        {tab === "chat" && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {ROOMS.map(r => (
              <button key={r.id} onClick={() => setRoom(r.id)}
                className={cn("flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition-all",
                  room === r.id ? "border-blue-500 bg-blue-900/30 text-white" : "border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-600")}>
                {r.emoji} {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CHAT TAB */}
      {tab === "chat" && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-2">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600">
                <MessageCircle className="w-10 h-10 opacity-30" />
                <p className="text-sm">Chưa có tin nhắn. Hãy bắt đầu trò chuyện!</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={cn("flex gap-2 items-end", isMe(msg) && "flex-row-reverse")}>
                {/* Avatar */}
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mb-0.5",
                  isMe(msg) ? "bg-blue-600" : "bg-gray-700")}>
                  {msg.avatar}
                </div>
                <div className={cn("max-w-[72%]", isMe(msg) && "items-end flex flex-col")}>
                  {!isMe(msg) && (
                    <p className="text-xs text-gray-500 mb-0.5 px-1">{msg.userName} · {msg.lang}</p>
                  )}
                  <div className={cn("px-3 py-2 rounded-2xl text-sm break-words",
                    isMe(msg)
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "text-white rounded-bl-sm"
                  )} style={!isMe(msg) ? { background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.2)" } : {}}>
                    {msg.text}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 px-1">{timeStr(msg.ts)}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 pb-4 pt-2 shrink-0 relative">
            {showEmoji && (
              <div className="absolute bottom-16 left-5 flex gap-1.5 p-2 rounded-2xl z-10"
                style={{ background: "rgba(20,12,40,0.98)", border: "1px solid rgba(139,92,246,0.3)" }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => { setInput(p => p + e); setShowEmoji(false); }}
                    className="text-xl hover:scale-125 transition-transform">{e}</button>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-center p-1 rounded-2xl" style={{ background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <button onClick={() => setShowEmoji(p => !p)}
                className="p-2 text-gray-500 hover:text-yellow-400 transition-colors shrink-0">
                <Smile className="w-5 h-5" />
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                placeholder="Nhắn tin..."
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
              />
              <button onClick={send} disabled={!input.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* FRIENDS TAB */}
      {tab === "friends" && (
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {onlineUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600">
              <Users className="w-10 h-10 opacity-30" />
              <p className="text-sm">Chưa có ai online trong phòng này</p>
              <p className="text-xs text-gray-700">Mời bạn bè vào học cùng!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                {onlineUsers.length} người đang online
              </p>
              {onlineUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.12)" }}>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-600/40 flex items-center justify-center text-sm font-bold text-white">
                      {u.avatar}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{u.userName}</p>
                    <p className="text-gray-500 text-xs">{u.lang}</p>
                  </div>
                  {u.userId === (user?.id || "anon") && (
                    <span className="text-xs text-blue-400 font-medium">Bạn</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
