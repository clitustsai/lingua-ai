"use client";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/lib/supabase";
import { Heart, MessageCircle, Send, Plus, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Post = {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  topic: string;
  content: string;
  likes: string[]; // array of user_ids
  created_at: string;
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
};

const TOPICS = ["Tất cả","Góc Chia Sẻ","Học Tiếng Anh","Du Học","Du Lịch","Dịch Thuật","Tìm Bạn Học","Tìm Gia Sư Tiếng Anh","Việc Làm Tiếng Anh","Khác"];

function timeAgo(ts: string) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return Math.floor(diff / 60) + " phút trước";
  if (diff < 86400) return Math.floor(diff / 3600) + " giờ trước";
  return Math.floor(diff / 86400) + " ngày trước";
}

function Avatar({ name, avatar, size = 9 }: { name: string; avatar?: string; size?: number }) {
  const initials = name ? name[0].toUpperCase() : "?";
  if (avatar?.startsWith("http")) {
    return <img src={avatar} alt={name} className={`w-${size} h-${size} rounded-full object-cover`} />;
  }
  const colors = ["bg-purple-600","bg-blue-600","bg-green-600","bg-pink-600","bg-orange-600"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
      {avatar && !avatar.startsWith("http") ? avatar : initials}
    </div>
  );
}

export default function CommunityPage() {
  const { user } = useAuthStore();
  const { settings } = useAppStore();
  const supabase = createClient();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("Tất cả");
  const [showNew, setShowNew] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newTopic, setNewTopic] = useState("Góc Chia Sẻ");
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [myStats, setMyStats] = useState({ posts: 0, comments: 0, likes: 0 });

  const myName = user?.name || user?.email?.split("@")[0] || "Ẩn danh";
  const myAvatar = user?.avatar || "";

  useEffect(() => {
    fetchPosts();
    // Realtime subscription
    const channel = supabase
      .channel("community_posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => fetchPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user?.id && posts.length > 0) {
      const myPosts = posts.filter(p => p.user_id === user.id).length;
      const myLikes = posts.reduce((acc, p) => acc + (p.likes?.includes(user.id) ? 1 : 0), 0);
      setMyStats(s => ({ ...s, posts: myPosts, likes: myLikes }));
    }
  }, [posts, user?.id]);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts(data || []);
    setLoading(false);
  }

  async function fetchComments(postId: string) {
    const { data } = await supabase
      .from("community_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    setComments(prev => ({ ...prev, [postId]: data || [] }));
    if (user?.id) {
      const myComments = (data || []).filter((c: Comment) => c.user_id === user.id).length;
      setMyStats(s => ({ ...s, comments: s.comments + myComments }));
    }
  }

  async function submitPost() {
    if (!newContent.trim() || !user) return;
    setPosting(true);
    await supabase.from("community_posts").insert({
      user_id: user.id,
      user_name: myName,
      user_avatar: myAvatar,
      topic: newTopic,
      content: newContent.trim(),
      likes: [],
    });
    setNewContent("");
    setShowNew(false);
    setPosting(false);
    fetchPosts();
  }

  async function toggleLike(post: Post) {
    if (!user) return;
    const liked = post.likes?.includes(user.id);
    const newLikes = liked
      ? post.likes.filter(id => id !== user.id)
      : [...(post.likes || []), user.id];
    await supabase.from("community_posts").update({ likes: newLikes }).eq("id", post.id);
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
  }

  async function submitComment(postId: string) {
    const text = commentInput[postId]?.trim();
    if (!text || !user) return;
    await supabase.from("community_comments").insert({
      post_id: postId,
      user_id: user.id,
      user_name: myName,
      user_avatar: myAvatar,
      content: text,
    });
    setCommentInput(prev => ({ ...prev, [postId]: "" }));
    fetchComments(postId);
  }

  function toggleComments(postId: string) {
    setExpandedComments(prev => {
      const next = new Set(prev);
      if (next.has(postId)) { next.delete(postId); }
      else { next.add(postId); fetchComments(postId); }
      return next;
    });
  }

  const filtered = topic === "Tất cả" ? posts : posts.filter(p => p.topic === topic);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <MessageCircle className="w-16 h-16 text-gray-600" />
        <p className="text-white font-semibold text-lg">Đăng nhập để tham gia cộng đồng</p>
        <a href="/auth" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors">
          Đăng nhập
        </a>
      </div>
    );
  }

  return (
    <div className="flex gap-4 max-w-5xl p-5">
      {/* Left: Topics */}
      <div className="w-52 shrink-0 hidden md:block">
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(18,12,36,0.9)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide border-b border-white/5">Chủ đề</p>
          <div className="flex flex-col py-1">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)}
                className={cn("flex items-center gap-2 px-4 py-2.5 text-sm transition-colors text-left",
                  topic === t ? "bg-blue-600/20 text-blue-300 font-semibold" : "text-gray-400 hover:text-white hover:bg-white/5")}>
                <span className="text-gray-500">#</span> {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Feed */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* New post box */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(18,12,36,0.9)", border: "1px solid rgba(139,92,246,0.15)" }}>
          {!showNew ? (
            <button onClick={() => setShowNew(true)}
              className="w-full flex items-center gap-3 text-gray-500 hover:text-gray-300 transition-colors">
              <Avatar name={myName} avatar={myAvatar} size={8} />
              <span className="flex-1 text-left text-sm px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                Bạn đang thắc mắc điều gì?
              </span>
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <select value={newTopic} onChange={e => setNewTopic(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800 text-gray-300 focus:outline-none">
                  {TOPICS.slice(1).map(t => <option key={t}>{t}</option>)}
                </select>
                <button onClick={() => setShowNew(false)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)}
                placeholder="Chia sẻ điều gì đó với cộng đồng..."
                rows={3}
                className="w-full bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none resize-none px-1"
              />
              <div className="flex justify-end">
                <button onClick={submitPost} disabled={!newContent.trim() || posting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-sm font-semibold transition-colors">
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Đăng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "rgba(15,10,30,0.6)" }}>
          {["Tất cả","Yêu thích"].map(f => (
            <button key={f} className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
              f === "Tất cả" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200")}>
              {f}
            </button>
          ))}
          <button className="flex-1 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-200 transition-all">
            Lựa chọn của Ban Biên Tập
          </button>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-gray-600">
            <MessageCircle className="w-12 h-12 opacity-30" />
            <p className="text-sm">Chưa có bài viết nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          filtered.map(post => {
            const liked = post.likes?.includes(user.id);
            const showCmt = expandedComments.has(post.id);
            const postComments = comments[post.id] || [];
            return (
              <div key={post.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(18,12,36,0.9)", border: "1px solid rgba(139,92,246,0.15)" }}>
                {/* Post header */}
                <div className="flex items-start gap-3 p-4">
                  <Avatar name={post.user_name} avatar={post.user_avatar} size={10} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold text-sm">{post.user_name}</span>
                      <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        # {post.topic}
                      </span>
                      <span className="text-xs text-gray-600">{timeAgo(post.created_at)}</span>
                    </div>
                    <p className="text-gray-200 text-sm mt-2 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 px-4 pb-3 border-t border-white/5 pt-3">
                  <button onClick={() => toggleLike(post)}
                    className={cn("flex items-center gap-1.5 text-sm transition-colors",
                      liked ? "text-red-400" : "text-gray-500 hover:text-red-400")}>
                    <Heart className={cn("w-4 h-4", liked && "fill-red-400")} />
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <button onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-400 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{showCmt ? "Ẩn" : "Bình luận"}</span>
                    {showCmt ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                {/* Comments */}
                {showCmt && (
                  <div className="border-t border-white/5 px-4 py-3 flex flex-col gap-3">
                    {postComments.map(c => (
                      <div key={c.id} className="flex gap-2">
                        <Avatar name={c.user_name} avatar={c.user_avatar} size={7} />
                        <div className="flex-1 rounded-xl px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <span className="text-white font-semibold mr-2">{c.user_name}</span>
                          <span className="text-gray-300">{c.content}</span>
                          <p className="text-xs text-gray-600 mt-0.5">{timeAgo(c.created_at)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 items-center">
                      <Avatar name={myName} avatar={myAvatar} size={7} />
                      <input
                        value={commentInput[post.id] || ""}
                        onChange={e => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && submitComment(post.id)}
                        placeholder="Viết bình luận..."
                        className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none px-3 py-2 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      />
                      <button onClick={() => submitComment(post.id)} disabled={!commentInput[post.id]?.trim()}
                        className="p-2 text-blue-400 hover:text-blue-300 disabled:opacity-30 transition-colors">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Right: My stats */}
      <div className="w-52 shrink-0 hidden lg:block">
        <div className="rounded-2xl p-4" style={{ background: "rgba(18,12,36,0.9)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Thống kê của tôi</p>
          {[
            { icon: "📝", label: "Bài viết đã tạo", value: myStats.posts },
            { icon: "💬", label: "Bình luận đã tạo", value: myStats.comments },
            { icon: "❤️", label: "Lượt vote nhận được", value: myStats.likes },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
              <span className="text-lg">{s.icon}</span>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-white font-bold text-lg leading-none mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
