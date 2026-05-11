import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { courses as coursesApi } from "../api/api";
import { useTheme } from "../context/ThemeContext";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: "easeOut" },
});

const FEATURES = [
  { icon: "🎓", title: "Expert-Led Courses",     desc: "Learn from industry professionals with real-world experience across development, design, data science, and more." },
  { icon: "📈", title: "Track Your Progress",    desc: "Visual progress bars and lesson completion tracking keep you motivated and on course every step of the way." },
  { icon: "🏆", title: "Earn Certificates",      desc: "Complete a course and instantly receive a verified digital certificate to showcase your new skills." },
  { icon: "📱", title: "Learn Anywhere",         desc: "Fully responsive on mobile, tablet, and desktop. Pick up exactly where you left off on any device." },
  { icon: "⚡", title: "Instant Enrollment",     desc: "One click to enroll. No waiting, no approval process. Start learning the moment you decide to." },
  { icon: "🔒", title: "Secure & Private",       desc: "Your data is protected with JWT authentication, encrypted passwords, and HttpOnly cookies." },
];

const LEVEL_COLOR = {
  Beginner:     "badge-green",
  Intermediate: "badge-orange",
  Advanced:     "badge-violet",
};

function CountUp({ target, duration = 1800 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{val.toLocaleString()}</>;
}

export default function Home() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [allCourses, setAllCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi.getPublic()
      .then((d) => { setAllCourses(d.courses || []); setStats(d.stats || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = allCourses.slice(0, 6);

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg-base)", color: "var(--text-1)" }}>

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl transition-colors" style={{ background: "var(--bg-sidebar)", borderColor: "var(--border)", opacity: 0.97 }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-sm font-black text-white shadow-md shadow-orange-500/30">P</div>
            <span className="text-sm font-extrabold" style={{ color: "var(--text-1)" }}>PopulousHR</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-semibold" style={{ color: "var(--text-2)" }}>
            <a href="#courses" className="hover:text-orange-400 transition" style={{ color: "var(--text-2)" }}>Courses</a>
            <a href="#features" className="hover:text-orange-400 transition" style={{ color: "var(--text-2)" }}>Features</a>
            <a href="#stats" className="hover:text-orange-400 transition" style={{ color: "var(--text-2)" }}>Stats</a>
          </nav>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="grid h-8 w-8 place-items-center rounded-xl border text-sm transition"
              style={{ background: "var(--bg-input)", borderColor: "var(--border-input)", color: "var(--text-2)" }}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </motion.button>
            <Link to="/login" className="btn-ghost rounded-xl px-4 py-2 text-xs">Sign In</Link>
            <Link to="/register" className="btn-brand rounded-xl px-4 py-2 text-xs">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-16 text-center">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div animate={{ scale: [1, 1.15, 1], opacity: [.5, .9, .5] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, hsla(24,95%,53%,.18) 0%, transparent 70%)" }} />
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [.3, .7, .3] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, hsla(263,70%,60%,.15) 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-4xl">
          <motion.div {...fadeUp(0)} className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-400">
            🚀 Online Learning Platform
          </motion.div>

          <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Learn New Skills,<br />
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Earn Certificates
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)} className="mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-2)" }}>
            PopulousHR offers expert-led courses in development, design, data science, cloud, and more.
            Track your progress, complete lessons, and earn verified certificates — all in one place.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn-brand rounded-2xl px-8 py-3.5 text-sm">
              Start Learning Free →
            </Link>
            <a href="#courses" className="btn-ghost rounded-2xl px-8 py-3.5 text-sm">
              Browse Courses
            </a>
          </motion.div>

          <motion.div {...fadeUp(0.4)} className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: "var(--text-3)" }}>
            {["✓ No credit card required", "✓ Free courses available", "✓ Certificate on completion"].map((t) => (
              <span key={t} className="font-semibold">{t}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section id="stats" className="border-y border-white/8 py-14" style={{ background: "var(--bg-surface)" }}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}
            className="grid grid-cols-2 gap-6 sm:grid-cols-4"
          >
            {[
              { label: "Courses",          value: stats?.totalCourses,      icon: "📖", color: "text-orange-400"  },
              { label: "Students",         value: stats?.totalStudents,     icon: "👥", color: "text-blue-400"    },
              { label: "Enrollments",      value: stats?.totalEnrollments,  icon: "📋", color: "text-violet-400"  },
              { label: "Certificates Issued", value: stats?.totalCertificates, icon: "🏆", color: "text-emerald-400" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .08, duration: .4 }}
                className="text-center"
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className={`text-3xl sm:text-4xl font-black ${s.color}`}>
                  {loading ? "—" : <CountUp target={s.value ?? 0} />}
                </div>
                <div className="mt-1 text-xs font-bold" style={{ color: "var(--text-3)" }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── COURSES ── */}
      <section id="courses" className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .45 }} className="mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Featured Courses</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--text-3)" }}>
              {allCourses.length} courses available across multiple categories
            </p>
          </motion.div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-5 space-y-3">
                  <div className="skeleton h-5 w-3/4 rounded-lg" />
                  <div className="skeleton h-3 w-full rounded-lg" />
                  <div className="skeleton h-3 w-2/3 rounded-lg" />
                  <div className="skeleton h-9 w-full rounded-xl mt-3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((c, i) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .07, duration: .38 }}
                  whileHover={{ y: -4 }}
                  className="card p-5 flex flex-col gap-3"
                >
                  {/* Thumbnail or gradient placeholder */}
                  <div className="h-36 w-full rounded-xl overflow-hidden bg-gradient-to-br from-orange-500/10 to-violet-500/10 flex items-center justify-center border border-white/8">
                    {c.thumbnail
                      ? <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                      : <span className="text-4xl">{c.category === "Development" ? "💻" : c.category === "Design" ? "🎨" : c.category === "Data Science" ? "📊" : c.category === "Cloud" ? "☁️" : c.category === "Security" ? "🔒" : c.category === "Marketing" ? "📣" : "📖"}</span>
                    }
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-extrabold text-white leading-snug">{c.title}</p>
                    <span className={`badge shrink-0 ${c.price ? "badge-orange" : "badge-green"}`}>{c.price ? `$${c.price}` : "Free"}</span>
                  </div>

                  <p className="text-xs line-clamp-2" style={{ color: "var(--text-3)" }}>{c.description}</p>

                  <div className="flex flex-wrap gap-1.5">
                    <span className="badge badge-muted">{c.category}</span>
                    <span className={`badge ${LEVEL_COLOR[c.level] || "badge-muted"}`}>{c.level}</span>
                    <span className="badge badge-muted">👤 {c.instructor}</span>
                    {c.durationHours > 0 && <span className="badge badge-muted">⏱ {c.durationHours}h</span>}
                  </div>

                  <button
                    onClick={() => navigate("/register")}
                    className="btn-brand mt-auto rounded-xl py-2.5 text-xs w-full"
                  >
                    Enroll Now →
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {allCourses.length > 6 && (
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-10 text-center">
              <Link to="/register" className="btn-ghost rounded-2xl px-8 py-3 text-sm inline-flex">
                View all {allCourses.length} courses →
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-4 sm:px-6 border-t border-white/8" style={{ background: "var(--bg-surface)" }}>
        <div className="mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .45 }} className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Everything You Need</h2>
            <p className="mt-3 text-sm" style={{ color: "var(--text-3)" }}>A complete learning experience from enrollment to certification</p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * .07, duration: .38 }}
                whileHover={{ y: -3 }}
                className="card p-6"
              >
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-orange-500/10 text-2xl border border-orange-500/15">
                  {f.icon}
                </div>
                <p className="text-sm font-extrabold text-white mb-2">{f.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, hsla(24,95%,53%,.1) 0%, transparent 70%)" }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}
          className="relative mx-auto max-w-2xl text-center"
        >
          <div className="animate-float text-5xl mb-6">🎓</div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Ready to Start Learning?</h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
            Join thousands of students already learning on PopulousHR. Create your free account today and start your first course in minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn-brand rounded-2xl px-10 py-3.5 text-sm">
              Create Free Account
            </Link>
            <Link to="/login" className="btn-ghost rounded-2xl px-8 py-3.5 text-sm">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/8 py-8 px-4 sm:px-6" style={{ background: "var(--bg-surface)" }}>
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 text-xs font-black text-white">P</div>
            <span className="text-sm font-extrabold text-white">PopulousHR</span>
          </div>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>
            © {new Date().getFullYear()} PopulousHR · Online Course Enrollment · All rights reserved
          </p>
          <div className="flex gap-4 text-xs font-semibold" style={{ color: "var(--text-3)" }}>
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
