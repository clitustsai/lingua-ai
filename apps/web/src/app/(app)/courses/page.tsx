"use client";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { COURSES } from "@ai-lang/shared";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, Star, Flame, Trophy, Crown, Lock } from "lucide-react";
import Toeic200Practice from "@/components/Toeic200Practice";

// Courses under development (language courses)
const COMING_SOON_CATEGORIES = ["Ngôn ngữ"];
import { cn } from "@/lib/utils";

const CATEGORIES = ["Tất cả", "Chứng chỉ", "Kỹ năng", "Giao tiếp", "Ngôn ngữ"];

export default function CoursesPage() {
  const { courseProgress, totalXp, streak, enrollCourse } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const isPremium = user?.isPremium ?? false;

  const enrolledCourses = COURSES.filter(c => courseProgress.find(p => p.courseId === c.id));
  const suggestedCourses = COURSES.filter(c => !courseProgress.find(p => p.courseId === c.id));

  const getProgress = (courseId: string) => {
    const prog = courseProgress.find(p => p.courseId === courseId);
    if (!prog) return 0;
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return 0;
    const total = course.units.reduce((sum, u) => sum + u.lessons.length, 0);
    return total > 0 ? Math.round((prog.completedLessons.length / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen" style={{ background: "#0f0a1e" }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-white">Khám phá</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-orange-500/20 px-2.5 py-1 rounded-full">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-purple-500/20 px-2.5 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-bold text-purple-400">{totalXp}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-500/20 px-2.5 py-1 rounded-full">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400">{enrolledCourses.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-8 pb-6">
        {/* TOEIC 200 Practice */}
        <Toeic200Practice />

        {/* Free notice */}
        {!isPremium && (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <p className="text-xs text-yellow-300">1 khóa học miễn phí · Nâng cấp để mở tất cả</p>
            <button onClick={() => router.push("/premium")}
              className="flex items-center gap-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-2.5 py-1 rounded-lg transition-colors shrink-0">
              <Crown className="w-3 h-3" /> Premium
            </button>
          </div>
        )}
        {/* My courses */}
        {enrolledCourses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">KHÓA HỌC CỦA TÔI</h2>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {enrolledCourses.map(course => {
                const pct = getProgress(course.id);
                return (
                  <button key={course.id} onClick={() => router.push(`/courses/${course.id}`)}
                    className="shrink-0 w-44 rounded-2xl overflow-hidden text-left"
                    style={{ background: course.color }}>
                    <div className="p-4">
                      <div className="text-3xl mb-2">{course.emoji}</div>
                      <p className="text-white font-bold text-sm leading-tight">{course.title}</p>
                      <p className="text-white/60 text-xs mt-0.5">{course.totalUnits} units</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-white/60 mb-1">
                          <span>Tiến độ</span><span>{pct}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1.5">
                          <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Recommended courses */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">CÁC KHÓA HỌC DÀNH CHO BẠN</h2>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {COURSES.map((course, idx) => {
              const enrolled = !!courseProgress.find(p => p.courseId === course.id);
              const pct = getProgress(course.id);
              const isLocked = !isPremium && idx >= 1;
              const isComingSoon = COMING_SOON_CATEGORIES.includes(course.category);
              return (
                <button key={course.id} onClick={() => {
                  if (isComingSoon) return;
                  isLocked ? router.push("/premium") : router.push(`/courses/${course.id}`);
                }}
                  className="shrink-0 w-44 rounded-2xl overflow-hidden text-left relative"
                  style={{ background: course.color }}>
                  {isComingSoon && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 rounded-2xl gap-1">
                      <Lock className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-300 font-semibold">Đang phát triển</span>
                    </div>
                  )}
                  {!isComingSoon && isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-2xl">
                      <Crown className="w-7 h-7 text-yellow-400" />
                    </div>
                  )}
                  <div className="p-4 pb-3">
                    <div className="text-4xl mb-3">{course.emoji}</div>
                    <p className="text-white font-bold text-sm leading-tight">{course.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{course.totalUnits} units</p>
                    {enrolled && (
                      <div className="mt-2">
                        <div className="w-full bg-white/20 rounded-full h-1">
                          <div className="bg-white h-1 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}
                    {!enrolled && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                        <span className="text-xs text-white font-medium">{course.level}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* By category */}
        {CATEGORIES.slice(1).map(cat => {
          const catCourses = COURSES.filter(c => c.category === cat);
          if (catCourses.length === 0) return null;
          return (
            <section key={cat}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cat.toUpperCase()}</h2>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex flex-col gap-3">
                {catCourses.map(course => {
                  const enrolled = !!courseProgress.find(p => p.courseId === course.id);
                  const pct = getProgress(course.id);
                  const courseIdx = COURSES.findIndex(c => c.id === course.id);
                  const isLocked = !isPremium && courseIdx >= 1;
                  const isComingSoon = COMING_SOON_CATEGORIES.includes(course.category);
                  return (
                    <button key={course.id} onClick={() => {
                      if (isComingSoon) return;
                      isLocked ? router.push("/premium") : router.push(`/courses/${course.id}`);
                    }}
                      className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:opacity-90 relative overflow-hidden"
                      style={{ background: course.color }}>
                      {isComingSoon && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 gap-1">
                          <Lock className="w-5 h-5 text-gray-400" />
                          <span className="text-xs text-gray-300 font-semibold">Đang phát triển</span>
                        </div>
                      )}
                      {!isComingSoon && isLocked && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <Crown className="w-6 h-6 text-yellow-400" />
                        </div>
                      )}
                      <div className="text-4xl shrink-0">{course.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{course.title}</p>
                        <p className="text-white/60 text-xs mt-0.5">{course.subtitle}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-white/50">{course.totalUnits} units · {course.totalLessons} bài</span>
                          <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full">{course.level}</span>
                        </div>
                        {enrolled && (
                          <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                            <div className="bg-white h-1 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
