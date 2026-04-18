"use client";
import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { COURSES } from "@ai-lang/shared";
import { ArrowLeft, CheckCircle2, Lock, Play, BookOpen, Headphones, Mic, FileText, HelpCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<string, any> = {
  vocabulary: BookOpen,
  grammar: FileText,
  listening: Headphones,
  reading: FileText,
  speaking: Mic,
  quiz: HelpCircle,
};

const TYPE_COLOR: Record<string, string> = {
  vocabulary: "text-blue-400",
  grammar: "text-yellow-400",
  listening: "text-green-400",
  reading: "text-purple-400",
  speaking: "text-pink-400",
  quiz: "text-orange-400",
};

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const { courseProgress, enrollCourse, totalXp } = useAppStore();

  const course = COURSES.find(c => c.id === courseId);
  if (!course) return <div className="p-6 text-white">Course not found</div>;

  const prog = courseProgress.find(p => p.courseId === courseId);
  const isEnrolled = !!prog;
  const completedLessons = prog?.completedLessons ?? [];
  const totalLessons = course.units.reduce((s, u) => s + u.lessons.length, 0);
  const pct = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  const handleEnroll = () => {
    enrollCourse(courseId);
  };

  // Find first incomplete lesson
  const nextLesson = (() => {
    for (const unit of course.units) {
      for (const lesson of unit.lessons) {
        if (!completedLessons.includes(lesson.id)) return { unitId: unit.id, lessonId: lesson.id };
      }
    }
    return null;
  })();

  return (
    <div className="min-h-screen" style={{ background: "#0f0a1e" }}>
      {/* Hero */}
      <div className="relative px-5 pt-12 pb-6" style={{ background: course.color }}>
        <button onClick={() => router.back()} className="mb-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-5xl mb-3">{course.emoji}</div>
        <h1 className="text-2xl font-bold text-white">{course.title}</h1>
        <p className="text-white/70 text-sm mt-1">{course.subtitle}</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full font-medium">{course.level}</span>
          <span className="text-xs text-white/60">{course.totalUnits} units · {totalLessons} bài học</span>
        </div>
        {isEnrolled && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/70 mb-1.5">
              <span>Tiến độ</span><span>{completedLessons.length}/{totalLessons} bài · {pct}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* CTA */}
        {!isEnrolled ? (
          <button onClick={handleEnroll}
            className="w-full py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-base transition-colors">
            Bắt đầu học miễn phí
          </button>
        ) : nextLesson ? (
          <button onClick={() => router.push(`/courses/${courseId}/${nextLesson.unitId}/${nextLesson.lessonId}`)}
            className="w-full py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-base transition-colors flex items-center justify-center gap-2">
            <Play className="w-5 h-5" /> Tiếp tục học
          </button>
        ) : (
          <div className="w-full py-3.5 rounded-2xl bg-green-700/30 border border-green-600/40 text-green-300 font-bold text-base text-center">
            🎉 Hoàn thành khóa học!
          </div>
        )}

        {/* Units */}
        {course.units.map((unit, ui) => {
          const unitDone = unit.lessons.every(l => completedLessons.includes(l.id));
          const unitStarted = unit.lessons.some(l => completedLessons.includes(l.id));
          // unlock first unit always, others unlock when previous is done
          const isLocked = !isEnrolled || (ui > 0 && !course.units[ui - 1].lessons.every(l => completedLessons.includes(l.id)));

          return (
            <div key={unit.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              {/* Unit header */}
              <div className="px-4 py-3 flex items-center gap-3" style={{ background: "rgba(139,92,246,0.1)" }}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  unitDone ? "bg-green-600" : unitStarted ? "bg-primary-600" : "bg-gray-700")}>
                  {unitDone ? "✓" : ui + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{unit.title}</p>
                  <p className="text-gray-400 text-xs">{unit.description}</p>
                </div>
                {isLocked && <Lock className="w-4 h-4 text-gray-600" />}
              </div>

              {/* Lessons */}
              <div className="divide-y divide-white/5">
                {unit.lessons.map((lesson, li) => {
                  const done = completedLessons.includes(lesson.id);
                  const Icon = TYPE_ICON[lesson.type] ?? BookOpen;
                  // Bài đầu tiên của unit đầu tiên luôn mở nếu đã enroll
                  // Bài tiếp theo chỉ mở khi bài trước đã hoàn thành
                  const allLessonsFlat: string[] = [];
                  course.units.forEach(u => u.lessons.forEach(l => allLessonsFlat.push(l.id)));
                  const lessonIdx = allLessonsFlat.indexOf(lesson.id);
                  const prevLessonId = lessonIdx > 0 ? allLessonsFlat[lessonIdx - 1] : null;
                  const canAccess = isEnrolled && !isLocked && (lessonIdx === 0 || prevLessonId === null || completedLessons.includes(prevLessonId));

                  return (
                    <button key={lesson.id}
                      disabled={!canAccess}
                      onClick={() => canAccess && router.push(`/courses/${courseId}/${unit.id}/${lesson.id}`)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                        canAccess ? "hover:bg-white/5" : "opacity-40 cursor-not-allowed"
                      )}>
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                        done ? "bg-green-600/20" : canAccess ? "bg-gray-800" : "bg-gray-900")}>
                        {done
                          ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                          : canAccess
                            ? <Icon className={cn("w-4 h-4", TYPE_COLOR[lesson.type])} />
                            : <Lock className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", done ? "text-gray-400" : canAccess ? "text-white" : "text-gray-600")}>{lesson.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">{lesson.type} · {lesson.durationMin} phút</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-yellow-400 font-medium">{lesson.xp}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
