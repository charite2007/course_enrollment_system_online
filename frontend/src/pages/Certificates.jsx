import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { enrollments } from "../api/api";
import { useAuth } from "../context/AuthContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

export default function Certificates() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollments.getCertificates()
      .then((d) => setItems(d.certificates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="h-8 w-8 rounded-full border-2 border-white/10 border-t-orange-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">My Certificates</h1>
        <p className="mt-1 text-sm text-white/40">{items.length} certificate{items.length !== 1 ? "s" : ""} earned</p>
      </motion.div>

      {items.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-white/8 bg-white/3 p-12 text-center">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-4xl mb-3">🏆</motion.div>
          <div className="text-sm font-extrabold text-white">No certificates yet</div>
          <div className="mt-1 text-sm text-white/40">Complete a course to earn your first certificate.</div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={() => navigate("/find-courses")} className="btn-brand mt-5 rounded-xl px-6 py-2.5 text-sm">Browse Courses</motion.button>
        </motion.div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-2">
        {items.map((c) => (
          <motion.div
            key={c._id}
            variants={item}
            whileHover={{ scale: 1.02, boxShadow: "0 0 40px -10px hsla(24,95%,53%,.25)" }}
            className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5 p-6 relative overflow-hidden transition"
          >
            {/* Decorative orbs */}
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/5" />
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-amber-500/5" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <motion.div whileHover={{ rotate: 10 }} className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/20 text-xl">🏆</motion.div>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-widest text-orange-400/70">Certificate of Completion</div>
                  <div className="text-[10px] text-white/30">PopulousHR · Online Course Enrollment</div>
                </div>
              </div>

              <div className="text-xs text-white/40 mb-1">This certifies that</div>
              <div className="text-lg font-extrabold text-white">{user?.Fullname}</div>
              <div className="text-xs text-white/40 mt-2 mb-1">has successfully completed</div>
              <div className="text-base font-extrabold text-orange-400">{c.courseId?.title || "Course"}</div>

              <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs text-white/30">
                  Issued: {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                </div>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate(`/lesson/${c.courseId?._id}`)}
                  className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition"
                >
                  Review Course
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
