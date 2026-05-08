import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { enrollments, users } from "../api/api";
import { useAuth } from "../context/AuthContext";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function StatCard({ label, value, icon, color }) {
  return (
    <motion.div variants={item} className={`rounded-2xl border p-5 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</div>
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.3 }} className="text-2xl">
          {icon}
        </motion.span>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-3 text-3xl font-extrabold text-white">
        {value ?? "—"}
      </motion.div>
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
  const notStarted = my.filter((e) => e.progress === 0);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Welcome back, <span className="text-orange-400">{user?.Fullname?.split(" ")[0]}</span> 👋
        </h1>
        <p className="mt-1 text-sm text-white/40">Here's your learning overview.</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Enrolled" value={stats?.enrolledCount} icon="📚" color="border-blue-500/20 bg-blue-500/5" />
        <StatCard label="In Progress" value={stats?.inProgressCount} icon="⚡" color="border-orange-500/20 bg-orange-500/5" />
        <StatCard label="Certificates" value={stats?.certificatesCount} icon="🏆" color="border-emerald-500/20 bg-emerald-500/5" />
      </motion.div>

      {inProgress.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-extrabold uppercase tracking-widest text-white/30">Continue Learning</div>
            <button onClick={() => navigate("/my-courses")} className="text-xs font-bold text-orange-400 hover:underline">View all →</button>
          </div>
          <motion.div variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
            {inProgress.slice(0, 4).map((en) => (
              <motion.div key={en._id} variants={item} whileHover={{ scale: 1.02 }} className="rounded-2xl border border-white/8 bg-white/3 p-5 flex flex-col gap-3 transition">
                <div className="text-sm font-extrabold text-white">{en.courseId?.title}</div>
                <div className="text-xs text-white/40">👤 {en.courseId?.instructor}</div>
                <div>
                  <div className="flex justify-between text-[10px] text-white/30 mb-1"><span>Progress</span><span>{en.progress}%</span></div>
                  <div className="h-1.5 w-full rounded-full bg-white/10">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${en.progress}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }} className="h-1.5 rounded-full bg-orange-400" />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(`/lesson/${en.courseId?._id}`)} className="btn-brand rounded-xl py-2 text-xs">Continue →</motion.button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {notStarted.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="mb-3 text-xs font-extrabold uppercase tracking-widest text-white/30">Not Started Yet</div>
          <motion.div variants={container} initial="hidden" animate="show" className="grid gap-3 md:grid-cols-2">
            {notStarted.slice(0, 2).map((en) => (
              <motion.div key={en._id} variants={item} whileHover={{ scale: 1.02 }} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/3 px-5 py-4 transition">
                <div>
                  <div className="text-sm font-semibold text-white">{en.courseId?.title}</div>
                  <div className="text-xs text-white/40">{en.courseId?.level} · {en.courseId?.category}</div>
                </div>
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/lesson/${en.courseId?._id}`)} className="shrink-0 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition">Start</motion.button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {my.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-white/8 bg-white/3 p-12 text-center">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-4xl mb-3">🎓</motion.div>
          <div className="text-sm font-extrabold text-white">Start your learning journey</div>
          <div className="mt-1 text-sm text-white/40">Browse courses and enroll to get started.</div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/find-courses")} className="btn-brand mt-5 rounded-xl px-6 py-2.5 text-sm">Find Courses</motion.button>
        </motion.div>
      )}
    </div>
  );
}
