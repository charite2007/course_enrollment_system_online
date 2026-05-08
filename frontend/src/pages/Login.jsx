import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" },
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = useMemo(() => location.state?.from || "/dashboard", [location.state]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-bg min-h-dvh flex items-center justify-center px-4 py-12">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl"
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <motion.div {...fadeUp(0)} className="mb-8 flex flex-col items-center gap-3 text-center">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-2xl font-black text-white shadow-lg shadow-orange-500/30"
          >
            P
          </motion.div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-white">PopulousHR</div>
            <div className="text-xs font-medium text-white/40">Online Course Enrollment</div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div {...fadeUp(0.1)} className="glow-card p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-white/50">Sign in to continue your learning journey.</p>

          <form className="mt-7 space-y-5" onSubmit={onSubmit}>
            <motion.div {...fadeUp(0.18)}>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/40">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="input-glow w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 transition"
              />
            </motion.div>

            <motion.div {...fadeUp(0.24)}>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/40">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-glow w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/25 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40 hover:text-white/70"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                <span className="text-base">⚠</span> {error}
              </motion.div>
            )}

            <motion.div {...fadeUp(0.3)}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={busy}
                className="btn-brand w-full py-3 text-sm"
              >
                {busy ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </span>
                ) : "Sign In"}
              </motion.button>
            </motion.div>
          </form>

          <motion.div {...fadeUp(0.36)} className="mt-6 text-center text-sm text-white/40">
            Don't have an account?{" "}
            <Link className="font-bold text-orange-400 hover:text-orange-300" to="/register">Create one</Link>
          </motion.div>
        </motion.div>

        <motion.p {...fadeUp(0.42)} className="mt-6 text-center text-xs text-white/20">
          © {new Date().getFullYear()} PopulousHR · All rights reserved
        </motion.p>
      </div>
    </div>
  );
}
