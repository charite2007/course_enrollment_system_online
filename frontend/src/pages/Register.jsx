import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import OAuthButtons from "../components/OAuthButtons";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" },
});

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [Fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [adminSecret, setAdminSecret] = useState("");
  const [showAdminField, setShowAdminField] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setBusy(true);
    try {
      const payload = { Fullname, email, password };
      if (adminSecret.trim()) payload.adminSecret = adminSecret.trim();
      await register(payload);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-bg min-h-dvh flex items-center justify-center px-4 py-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <motion.div {...fadeUp(0)} className="mb-3 flex flex-col items-center gap-1.5 text-center">
          <motion.div whileHover={{ rotate: 8, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }} className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-lg font-black text-white shadow-lg shadow-orange-500/30">
            P
          </motion.div>
          <div>
            <div className="text-base font-extrabold tracking-tight text-white">PopulousHR</div>
            <div className="text-xs font-medium text-white/40">Online Course Enrollment</div>
          </div>
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="glow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white">Create an account</h1>
              <p className="mt-0.5 text-xs text-white/50">Join thousands of learners today.</p>
            </div>
            <Link to="/" className="flex items-center gap-1 text-xs font-bold text-white/30 hover:text-orange-400 transition">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Home
            </Link>
          </div>

          <form className="mt-3 space-y-2.5" onSubmit={onSubmit}>
            {[
              { label: "Full name", value: Fullname, set: setFullname, placeholder: "Jane Doe", type: "text" },
              { label: "Email address", value: email, set: setEmail, placeholder: "you@example.com", type: "email" },
            ].map(({ label, value, set, placeholder, type }, i) => (
              <motion.div key={label} {...fadeUp(0.16 + i * 0.06)}>
                <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
                <input type={type} value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder} required className="input-glow w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 transition" />
              </motion.div>
            ))}

            <motion.div {...fadeUp(0.28)}>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-white/40">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required className="input-glow w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-12 text-sm text-white placeholder:text-white/25 transition" />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40 hover:text-white/70">{showPwd ? "Hide" : "Show"}</button>
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.34)}>
              <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-white/40">Confirm password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" required className="input-glow w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 transition" />
            </motion.div>

            <motion.div {...fadeUp(0.4)}>
              <button type="button" onClick={() => setShowAdminField((v) => !v)} className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-orange-400 transition">
                <span className="leading-none">{showAdminField ? "▾" : "▸"}</span>
                Registering as admin?
              </button>
              {showAdminField && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-orange-400/70">Admin secret key</label>
                  <input type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} placeholder="Enter admin secret" className="input-glow w-full rounded-xl border border-orange-500/30 bg-orange-500/5 px-3 py-2 text-sm text-white placeholder:text-white/25 transition" />
                  <p className="mt-1 text-xs text-white/30">Leave blank to register as a student.</p>
                </motion.div>
              )}
            </motion.div>

            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                <span>⚠</span> {error}
              </motion.div>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={busy} className="btn-brand w-full py-2.5 text-sm">
              {busy ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Creating account…</span> : "Create Account"}
            </motion.button>
          </form>

          <div className="mt-3 text-center text-xs text-white/40">
            Already have an account?{" "}
            <Link className="font-bold text-orange-400 hover:text-orange-300" to="/login">Sign in</Link>
          </div>
          <OAuthButtons />
        </motion.div>

        <p className="mt-3 text-center text-xs text-white/20">
          © {new Date().getFullYear()} PopulousHR · All rights reserved
        </p>
      </div>
    </div>
  );
}
