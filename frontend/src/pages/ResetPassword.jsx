import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../api/api";
import { useToast } from "../context/ToastContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const toast = useToast();
  const token = params.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword.length < 6) return toast("Password must be at least 6 characters", "error");
    setLoading(true);
    try {
      await auth.resetPassword({ token, newPassword });
      toast("Password reset! Please log in.", "success");
      navigate("/login", { replace: true });
    } catch (err) {
      toast(err?.response?.data?.message || "Invalid or expired link", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!token) return (
    <div className="auth-bg min-h-dvh flex items-center justify-center p-4">
      <div className="glow-card p-8 text-center">
        <p className="text-white font-bold">Invalid reset link.</p>
        <Link to="/login" className="text-orange-400 mt-4 inline-block hover:underline">Back to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="auth-bg min-h-dvh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glow-card w-full max-w-md p-8"
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="text-2xl font-black text-white">Set new password</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min 6 chars)"
            required
            className="input"
            autoFocus
          />
          <button disabled={loading} className="btn-brand w-full py-3">
            {loading ? "Saving…" : "Reset Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
