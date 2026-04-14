"use client";
import { useAppStore } from "@/store/useAppStore";
import { COURSES } from "@ai-lang/shared";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, Star, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Tất cả", "Chứng chỉ", "Kỹ năng", "Giao tiếp", "Ngôn ngữ"];

export default function CoursesPage() {
  const { courseProgress, totalXp, streak, enrollCourse } = useAppStore();
  const router = useRouter();

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
            {COURSES.map(course => {
              const enrolled = !!courseProgress.find(p => p.courseId === course.id);
              const pct = getProgress(course.id);
              return (
                <button key={course.id} onClick={() => router.push(`/courses/${course.id}`)}
                  className="shrink-0 w-44 rounded-2xl overflow-hidden text-left relative"
                  style={{ background: course.color }}>
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
                  return (
                    <button key={course.id} onClick={() => router.push(`/courses/${course.id}`)}
                      className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:opacity-90"
                      style={{ background: course.color }}>
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
