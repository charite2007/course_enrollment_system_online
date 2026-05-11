import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { courses, enrollments } from "../api/api";
import { useToast } from "../context/ToastContext";

export default function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completed, setCompleted] = useState(new Set());
  const [active, setActive] = useState(null);
  const [progress, setProgress] = useState(0);
  const [busyLessonId, setBusyLessonId] = useState(null);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [showLessonList, setShowLessonList] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([courses.getOne(id), enrollments.getMy()])
      .then(([c, my]) => {
        if (!alive) return;
        setCourse(c.course);
        const sorted = (c.lessons || []).slice().sort((a, b) => a.order - b.order);
        setLessons(sorted);
        const mine = (my.enrollments || []).find((e) => String(e.courseId?._id) === String(id));
        if (!mine) { setNotEnrolled(true); return; }
        const doneSet = new Set((mine.completedLessons || []).map(String));
        setCompleted(doneSet);
        setProgress(mine.progress ?? 0);
        const firstIncomplete = sorted.find((l) => !doneSet.has(String(l._id)));
        setActive(firstIncomplete || sorted[0] || null);
      })
      .catch(() => toast("Failed to load course", "error"));
    return () => { alive = false; };
  }, [id, toast]);

  const ordered = useMemo(() => [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0)), [lessons]);

  async function markComplete(lessonId) {
    setBusyLessonId(lessonId);
    try {
      const d = await enrollments.completeLesson(id, lessonId);
      const newProgress = d.enrollment?.progress ?? 0;
      const newCompleted = new Set((d.enrollment?.completedLessons || []).map(String));
      setProgress(newProgress);
      setCompleted(newCompleted);
      if (newProgress === 100) {
        toast("🎉 Congratulations! You completed the course and earned a certificate!", "success");
      } else {
        const lesson = lessons.find((l) => String(l._id) === String(lessonId));
        toast(`"${lesson?.title}" marked as complete`, "success");
        const currentIdx = ordered.findIndex((l) => String(l._id) === String(lessonId));
        const next = ordered[currentIdx + 1];
        if (next) setActive(next);
      }
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to mark lesson complete", "error");
    } finally {
      setBusyLessonId(null);
    }
  }

  if (notEnrolled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="text-4xl mb-4">🔒</div>
        <div className="text-lg font-extrabold text-white">Not Enrolled</div>
        <div className="mt-2 text-sm text-white/50">You need to enroll in this course first.</div>
        <button onClick={() => navigate(`/courses/${id}`)} className="btn-brand mt-6 rounded-xl px-6 py-2.5 text-sm">View Course</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white truncate">{course?.title || "Loading…"}</h1>
          <p className="mt-1 text-sm text-white/40">👤 {course?.instructor} · {ordered.length} lessons</p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs text-white/40">Progress</div>
          <div className="text-xl sm:text-2xl font-extrabold text-orange-400">{progress}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className={["h-2 rounded-full transition-all duration-500", progress === 100 ? "bg-emerald-400" : "bg-orange-400"].join(" ")}
          style={{ width: `${progress}%` }}
        />
      </div>

      {progress === 100 && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-emerald-400">Course Completed!</div>
            <div className="text-xs text-white/50">Your certificate has been issued.</div>
          </div>
          <button onClick={() => navigate("/certificates")} className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20">
            View Certificate
          </button>
        </div>
      )}

      {/* Mobile lesson toggle */}
      <button
        onClick={() => setShowLessonList((v) => !v)}
        className="lg:hidden w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/70"
      >
        <span>📋 Lessons · {completed.size}/{ordered.length} done</span>
        <span>{showLessonList ? "▲ Hide" : "▼ Show"}</span>
      </button>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* Lesson list — hidden on mobile unless toggled */}
        <div className={["rounded-2xl border border-white/8 bg-white/3 p-4", showLessonList ? "block" : "hidden lg:block"].join(" ")}>
          <div className="mb-3 hidden lg:block text-xs font-extrabold uppercase tracking-widest text-white/30">
            Lessons · {completed.size}/{ordered.length} done
          </div>
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {ordered.map((l, i) => {
              const isDone = completed.has(String(l._id));
              const isActive = active?._id === l._id;
              return (
                <button
                  key={l._id}
                  onClick={() => { setActive(l); setShowLessonList(false); }}
                  className={["w-full rounded-xl border px-3 py-2.5 text-left transition", isActive ? "border-orange-500/40 bg-orange-500/10" : isDone ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/8 bg-white/3 hover:bg-white/6"].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    <div className={["grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-extrabold", isDone ? "bg-emerald-500/20 text-emerald-400" : isActive ? "bg-orange-500/20 text-orange-400" : "bg-white/10 text-white/40"].join(" ")}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <div className="min-w-0">
                      <div className={["truncate text-sm font-semibold", isActive ? "text-orange-400" : isDone ? "text-emerald-400" : "text-white/70"].join(" ")}>{l.title}</div>
                    </div>
                  </div>
                </button>
              );
            })}
            {ordered.length === 0 && <div className="text-sm text-white/30 py-4 text-center">No lessons yet.</div>}
          </div>
        </div>

        {/* Video player */}
        <div className="rounded-2xl border border-white/8 bg-white/3 p-4 sm:p-5 flex flex-col gap-4">
          <div>
            <div className="text-base sm:text-lg font-extrabold text-white">{active?.title || "Select a lesson"}</div>
            {active && <div className="text-xs text-white/40 mt-0.5">Lesson {active.order}</div>}
          </div>

          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60">
            {active?.videoUrl ? (
              <iframe
                title="lesson video"
                src={active.videoUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-center">
                <div>
                  <div className="text-4xl mb-3">🎬</div>
                  <div className="text-sm text-white/40">No video for this lesson</div>
                </div>
              </div>
            )}
          </div>

          {active && (
            <div className="flex flex-wrap gap-3">
              {completed.has(String(active._id)) ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-400">
                  ✓ Lesson Completed
                </div>
              ) : (
                <button
                  disabled={busyLessonId === active._id}
                  onClick={() => markComplete(active._id)}
                  className="btn-brand rounded-xl px-5 py-2.5 text-sm"
                >
                  {busyLessonId === active._id ? "Saving…" : "Mark as Complete"}
                </button>
              )}
              <button
                onClick={() => navigate("/my-courses")}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/60 hover:bg-white/10 transition"
              >
                ← My Courses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
