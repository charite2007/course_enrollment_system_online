import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../api/api";
import { useToast } from "../context/ToastContext";

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.forgotPassword({ email });
      setSent(true);
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg min-h-dvh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glow-card w-full max-w-md p-8"
      >
        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-xl font-black text-white">Check your email</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>
              If that email exists, we sent a reset link. Check your inbox.
            </p>
            <Link to="/login" className="btn-brand inline-block mt-6 px-8 py-2.5 rounded-xl text-sm">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🔑</div>
              <h1 className="text-2xl font-black text-white">Forgot password?</h1>
              <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>
                Enter your email and we'll send you a reset link.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input"
                autoFocus
              />
              <button disabled={loading} className="btn-brand w-full py-3">
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
            <p className="mt-4 text-center text-sm" style={{ color: "var(--text-3)" }}>
              <Link to="/login" className="text-orange-400 font-bold hover:underline">Back to Login</Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
