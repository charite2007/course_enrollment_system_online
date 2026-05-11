import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { courses, enrollments } from "../api/api";
import { useToast } from "../context/ToastContext";

const item = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: "easeOut" },
});

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([courses.getOne(id), enrollments.getMy()])
      .then(([c, my]) => {
        if (!alive) return;
        setCourse(c.course);
        setLessons(c.lessons || []);
        const mine = (my.enrollments || []).find((e) => String(e.courseId?._id) === String(id));
        setEnrollment(mine || null);
      })
      .catch(() => toast("Failed to load course", "error"))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, toast]);

  async function onEnroll() {
    setBusy(true);
    try {
      await enrollments.enroll(id);
      toast(`Enrolled in "${course?.title}"!`, "success");
      setTimeout(() => navigate(`/enrollment-confirmation/${id}`), 600);
    } catch (err) {
      toast(err?.response?.data?.message || "Enrollment failed", "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="h-8 w-8 rounded-full border-2 border-white/10 border-t-orange-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div {...item(0)} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">{course?.title || "Course"}</h1>
          <p className="mt-1 text-sm text-white/40">👤 {course?.instructor} · {course?.category} · {course?.level}</p>
        </div>
        <div className="shrink-0">
          {enrollment ? (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(`/lesson/${id}`)} className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-bold text-emerald-400 hover:bg-emerald-500/20 transition">
              {enrollment.progress === 100 ? "✓ Completed" : `Continue (${enrollment.progress}%)`}
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} disabled={busy} onClick={onEnroll} className="btn-brand rounded-xl px-5 py-2.5 text-sm">
              {busy ? "Enrolling…" : `Enroll Now${course?.price ? ` · $${course.price}` : " · Free"}`}
            </motion.button>
          )}
        </div>
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <motion.div {...item(0.1)} className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-white/30 mb-2">About this course</div>
            <p className="text-sm text-white/70 leading-relaxed">{course?.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Level", value: course?.level },
              { label: "Category", value: course?.category },
              { label: "Duration", value: course?.durationHours ? `${course.durationHours}h` : "—" },
              { label: "Price", value: course?.price ? `$${course.price}` : "Free" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.06 }} className="rounded-xl border border-white/8 bg-white/3 p-3 text-center">
                <div className="text-xs text-white/30">{s.label}</div>
                <div className="mt-1 text-sm font-extrabold text-white">{s.value || "—"}</div>
              </motion.div>
            ))}
          </div>
          {enrollment && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <div className="flex justify-between text-xs text-white/40 mb-1.5"><span>Your progress</span><span>{enrollment.progress}%</span></div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${enrollment.progress}%` }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
                  className={["h-2 rounded-full", enrollment.progress === 100 ? "bg-emerald-400" : "bg-orange-400"].join(" ")}
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div {...item(0.18)} className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <div className="mb-3 text-xs font-extrabold uppercase tracking-widest text-white/30">Lessons · {lessons.length}</div>
          <div className="space-y-2">
            {lessons.map((l, i) => (
              <motion.div key={l._id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-extrabold text-white/40">{i + 1}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{l.title}</div>
                  {l.videoUrl && <div className="text-[10px] text-white/30">▶ has video</div>}
                </div>
              </motion.div>
            ))}
            {lessons.length === 0 && <div className="text-sm text-white/30 py-4 text-center">No lessons yet.</div>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
