import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const toast = useToast();
  const userId = location.state?.userId;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const data = await auth.verifyEmail({ userId, code });
      setUser(data.user);
      toast("Email verified! Welcome to PopulousHR 🎉", "success");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast(err?.response?.data?.message || "Invalid code", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await auth.resendVerify({ userId });
      toast("New code sent to your email", "success");
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to resend", "error");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="auth-bg min-h-dvh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glow-card w-full max-w-md p-8"
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">📧</div>
          <h1 className="text-2xl font-black text-white">Verify your email</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-3)" }}>
            We sent a 6-digit code to your email. Enter it below.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="input text-center text-2xl tracking-widest font-bold"
            autoFocus
          />
          <button disabled={loading} className="btn-brand w-full py-3">
            {loading ? "Verifying…" : "Verify Email"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm" style={{ color: "var(--text-3)" }}>
          Didn't receive it?{" "}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-orange-400 font-bold hover:underline"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
