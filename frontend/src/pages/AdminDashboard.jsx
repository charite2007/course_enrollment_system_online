import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { users, enrollments, courses } from "../api/api";
import { useAuth } from "../context/AuthContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };

function StatCard({ label, value, icon, color }) {
  return (
    <motion.div variants={item} className={`rounded-2xl border p-5 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</div>
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.3 }} className="text-2xl">{icon}</motion.span>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-3 text-3xl font-extrabold text-white">{value ?? "—"}</motion.div>
    </motion.div>
  );
}

function QuickCard({ title, desc, icon, to, color }) {
  const navigate = useNavigate();
  return (
    <motion.button
      variants={item}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(to)}
      className={`group w-full rounded-2xl border p-5 text-left transition ${color}`}
    >
      <div className="text-3xl">{icon}</div>
      <div className="mt-3 text-sm font-extrabold text-white">{title}</div>
      <div className="mt-1 text-xs text-white/50">{desc}</div>
      <div className="mt-4 text-xs font-bold text-orange-400 group-hover:underline">Open →</div>
    </motion.button>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
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
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-white/40">Welcome back, <span className="text-orange-400">{user?.Fullname}</span>. Here's what's happening.</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats?.usersCount} icon="👥" color="border-blue-500/20 bg-blue-500/5" />
        <StatCard label="Courses" value={stats?.coursesCount} icon="📖" color="border-orange-500/20 bg-orange-500/5" />
        <StatCard label="Enrollments" value={stats?.enrollmentsCount} icon="📋" color="border-violet-500/20 bg-violet-500/5" />
        <StatCard label="Certificates" value={stats?.certificatesCount} icon="🏆" color="border-emerald-500/20 bg-emerald-500/5" />
      </motion.div>

      <div>
        <div className="mb-3 text-xs font-extrabold uppercase tracking-widest text-white/30">Quick Actions</div>
        <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
          <QuickCard to="/admin/courses" title="Manage Courses" desc="Create, edit, delete courses and lessons." icon="📖" color="border-orange-500/20 bg-orange-500/5 hover:border-orange-500/40" />
          <QuickCard to="/admin/users" title="Manage Users" desc="View, promote, or remove users." icon="👥" color="border-blue-500/20 bg-blue-500/5 hover:border-blue-500/40" />
          <QuickCard to="/admin/enrollments" title="View Enrollments" desc="Monitor all student enrollments." icon="📋" color="border-violet-500/20 bg-violet-500/5 hover:border-violet-500/40" />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.35 }} className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <div className="mb-4 text-xs font-extrabold uppercase tracking-widest text-white/30">Recent Enrollments</div>
          <div className="space-y-2">
            {recentEnrollments.length === 0 && <div className="text-sm text-white/30">No enrollments yet.</div>}
            {recentEnrollments.map((e, i) => (
              <motion.div key={e._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.06 }} className="flex items-center justify-between rounded-xl bg-white/4 px-3 py-2.5">
                <div>
                  <div className="text-sm font-semibold text-white">{e.studentId?.Fullname || "—"}</div>
                  <div className="text-xs text-white/40">{e.courseId?.title || "—"}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-orange-400">{e.progress ?? 0}%</div>
                  <div className="text-[10px] text-white/30">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ""}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <div className="mb-4 text-xs font-extrabold uppercase tracking-widest text-white/30">Recent Courses</div>
          <div className="space-y-2">
            {recentCourses.length === 0 && <div className="text-sm text-white/30">No courses yet.</div>}
            {recentCourses.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.06 }} className="flex items-center justify-between rounded-xl bg-white/4 px-3 py-2.5">
                <div>
                  <div className="text-sm font-semibold text-white">{c.title}</div>
                  <div className="text-xs text-white/40">{c.instructor}</div>
                </div>
                <div className="flex gap-1.5">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">{c.level}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">{c.price ? `$${c.price}` : "Free"}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
