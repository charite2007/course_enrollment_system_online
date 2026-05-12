import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { users, enrollments, courses } from "../api/api";
import { useAuth } from "../context/AuthContext";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp  = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: .35, ease: "easeOut" } } };

const STATS_META = [
  { key: "usersCount",        label: "Total Users",   icon: "👥", accent: "hsla(217,91%,60%,.14)", glow: "hsla(217,91%,60%,.3)",  text: "text-blue-400"    },
  { key: "coursesCount",      label: "Courses",       icon: "📖", accent: "hsla(24,95%,53%,.14)",  glow: "hsla(24,95%,53%,.3)",   text: "text-orange-400"  },
  { key: "enrollmentsCount",  label: "Enrollments",   icon: "📋", accent: "hsla(263,70%,60%,.14)", glow: "hsla(263,70%,60%,.3)",  text: "text-violet-400"  },
  { key: "certificatesCount", label: "Certificates",  icon: "🏆", accent: "hsla(152,69%,50%,.14)", glow: "hsla(152,69%,50%,.3)",  text: "text-emerald-400" },
];

const QUICK = [
  { to: "/admin/courses",     title: "Manage Courses",    desc: "Create, edit & delete courses and lessons.", icon: "📖", border: "border-orange-500/20", bg: "bg-orange-500/5", hover: "hover:border-orange-500/40" },
  { to: "/admin/users",       title: "Manage Users",      desc: "View, promote or remove users.",             icon: "👥", border: "border-blue-500/20",   bg: "bg-blue-500/5",   hover: "hover:border-blue-500/40"   },
  { to: "/admin/enrollments", title: "View Enrollments",  desc: "Monitor all student enrollments.",           icon: "📋", border: "border-violet-500/20", bg: "bg-violet-500/5", hover: "hover:border-violet-500/40" },
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
            transition={{ delay: .3, type: "spring", stiffness: 200 }}
            className={`text-3xl font-black tracking-tight ${text}`}
          >
            {value ?? <span className="skeleton inline-block h-8 w-10 rounded-lg" />}
          </motion.p>
        </div>
        <motion.span
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: .2, type: "spring", stiffness: 260 }}
          className="text-3xl"
        >
          {icon}
        </motion.span>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    let alive = true;
    Promise.all([users.getAdminStats(), enrollments.getAll(), courses.getAll()])
      .then(([s, e, c]) => {
        if (!alive) return;
        setStats(s.stats);
        setRecentEnrollments((e.enrollments || []).slice(0, 5));
        setRecentCourses((c.courses || []).slice(0, 5));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .32 }}>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Admin Dashboard</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>
          Welcome back, <span className="text-orange-400 font-bold">{user?.Fullname}</span>. Here's what's happening.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
        {STATS_META.map((s) => <StatCard key={s.key} {...s} value={stats?.[s.key]} />)}
      </motion.div>

      {/* Quick Actions */}
      <div>
        <p className="section-label mb-4">Quick Actions</p>
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
          {QUICK.map((q) => (
            <motion.button
              key={q.to}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              whileTap={{ scale: .97 }}
              onClick={() => navigate(q.to)}
              className={`group w-full rounded-2xl border p-5 text-left transition ${q.border} ${q.bg} ${q.hover}`}
            >
              <div className="text-3xl mb-3">{q.icon}</div>
              <p className="text-sm font-extrabold text-white">{q.title}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-3)" }}>{q.desc}</p>
              <p className="mt-4 text-xs font-bold text-orange-400 group-hover:underline">Open →</p>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: .3, duration: .35 }}
        className="grid gap-6 lg:grid-cols-2"
      >
        {/* Recent Enrollments */}
        <div className="card p-5">
          <p className="section-label mb-4">Recent Enrollments</p>
          <div className="space-y-2">
            {recentEnrollments.length === 0 && (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-3)" }}>No enrollments yet.</p>
            )}
            {recentEnrollments.map((e, i) => (
              <motion.div
                key={e._id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: .35 + i * .06 }}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition"
                style={{ background: "var(--bg-card-hover)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-orange-500/15 text-xs font-extrabold text-orange-400">
                    {e.studentId?.Fullname?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{e.studentId?.Fullname || "—"}</p>
                    <p className="truncate text-xs" style={{ color: "var(--text-3)" }}>{e.courseId?.title || "—"}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold text-orange-400">{e.progress ?? 0}%</p>
                  <p className="text-[10px]" style={{ color: "var(--text-3)" }}>{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ""}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Courses */}
        <div className="card p-5">
          <p className="section-label mb-4">Recent Courses</p>
          <div className="space-y-2">
            {recentCourses.length === 0 && (
              <p className="text-sm py-4 text-center" style={{ color: "var(--text-3)" }}>No courses yet.</p>
            )}
            {recentCourses.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: .35 + i * .06 }}
                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition"
                style={{ background: "var(--bg-card-hover)" }}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{c.title}</p>
                  <p className="truncate text-xs" style={{ color: "var(--text-3)" }}>{c.instructor}</p>
                </div>
                <div className="shrink-0 flex gap-1.5">
                  <span className="badge badge-muted">{c.level}</span>
                  <span className="badge badge-orange">{c.price ? `$${c.price}` : "Free"}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
