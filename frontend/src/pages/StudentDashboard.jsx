import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { enrollments, users } from "../api/api";
import { useAuth } from "../context/AuthContext";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const fadeUp  = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } } };

const STAT_META = [
  { key: "enrolledCount",    label: "Enrolled",    icon: "📚", accent: "hsla(217,91%,60%,.14)", glow: "hsla(217,91%,60%,.3)",  text: "text-blue-400"    },
  { key: "inProgressCount",  label: "In Progress", icon: "⚡", accent: "hsla(24,95%,53%,.14)",  glow: "hsla(24,95%,53%,.3)",   text: "text-orange-400"  },
  { key: "certificatesCount",label: "Certificates",icon: "🏆", accent: "hsla(152,69%,50%,.14)", glow: "hsla(152,69%,50%,.3)",  text: "text-emerald-400" },
];

function StatCard({ label, value, icon, accent, glow, text }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, boxShadow: `0 16px 40px -12px ${glow}` }}
      className="stat-card"
      style={{ "--accent-glow": accent }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label mb-2">{label}</p>
          <motion.p
            initial={{ opacity: 0, scale: .8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: .35, type: "spring", stiffness: 200 }}
            className={`text-3xl font-black tracking-tight ${text}`}
          >
            {value ?? <span className="skeleton inline-block h-8 w-10 rounded-lg" />}
          </motion.p>
        </div>
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: .25, type: "spring", stiffness: 260 }}
          className="text-3xl"
        >
          {icon}
        </motion.span>
      </div>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [my, setMy] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.all([users.getStudentStats(), enrollments.getMy()])
      .then(([s, e]) => { if (!alive) return; setStats(s.stats); setMy(e.enrollments || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const inProgress = my.filter((e) => e.progress > 0 && e.progress < 100);
  const notStarted  = my.filter((e) => e.progress === 0);

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .32 }}>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Welcome back, <span className="text-orange-400">{user?.Fullname?.split(" ")[0]}</span> 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>Here's your learning overview for today.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-3 gap-2 sm:gap-3">
        {STAT_META.map((s) => <StatCard key={s.key} {...s} value={stats?.[s.key]} />)}
      </motion.div>

      {/* Continue Learning */}
      {inProgress.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}>
          <div className="mb-3 flex items-center justify-between">
            <span className="section-label">Continue Learning</span>
            <button onClick={() => navigate("/my-courses")} className="text-xs font-bold text-orange-400 hover:text-orange-300 transition">View all →</button>
          </div>
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-3 md:grid-cols-2">
            {inProgress.slice(0, 4).map((en) => (
              <motion.div
                key={en._id}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                className="card p-4 flex flex-col gap-2 cursor-pointer"
                onClick={() => navigate(`/lesson/${en.courseId?._id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-lg">📖</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-white">{en.courseId?.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>👤 {en.courseId?.instructor}</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5" style={{ color: "var(--text-3)" }}>
                    <span>Progress</span><span className="font-bold text-orange-400">{en.progress}%</span>
                  </div>
                  <div className="progress-track">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${en.progress}%` }}
                      transition={{ duration: .9, ease: "easeOut", delay: .3 }}
                    />
                  </div>
                </div>
                <button className="btn-brand rounded-xl py-2 text-xs mt-auto" onClick={(e) => { e.stopPropagation(); navigate(`/lesson/${en.courseId?._id}`); }}>
                  Continue →
                </button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Not Started */}
      {notStarted.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .3 }}>
          <p className="section-label mb-3">Not Started Yet</p>
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-2 md:grid-cols-2">
            {notStarted.slice(0, 2).map((en) => (
              <motion.div
                key={en._id}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                className="card flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{en.courseId?.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{en.courseId?.level} · {en.courseId?.category}</p>
                </div>
                <button
                  onClick={() => navigate(`/lesson/${en.courseId?._id}`)}
                  className="shrink-0 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition"
                >
                  Start
                </button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Empty state */}
      {my.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: .97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: .2 }}
          className="card p-10 text-center"
        >
          <div className="animate-float text-5xl mb-4">🎓</div>
          <p className="text-base font-extrabold text-white">Start your learning journey</p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>Browse courses and enroll to get started.</p>
          <button onClick={() => navigate("/find-courses")} className="btn-brand mt-6 rounded-xl px-8 py-2.5 text-sm">
            Browse Courses
          </button>
        </motion.div>
      )}
    </div>
  );
}
