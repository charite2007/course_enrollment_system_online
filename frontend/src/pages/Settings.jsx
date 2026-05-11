import { useEffect, useState } from "react";
import { users } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";

const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15 transition disabled:opacity-40";

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({ Fullname: "", phone: "", bio: "", photo: "" });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [busyProfile, setBusyProfile] = useState(false);
  const [busyPwd, setBusyPwd] = useState(false);

  useEffect(() => {
    users.getProfile().then((d) => {
      setProfile({ Fullname: d.user?.Fullname || "", phone: d.user?.phone || "", bio: d.user?.bio || "", photo: d.user?.photo || "" });
    }).catch(() => {});
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setBusyProfile(true);
    try {
      const d = await users.updateProfile(profile);
      setUser(d.user);
      toast("Profile updated successfully", "success");
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setBusyProfile(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmNew) {
      toast("New passwords do not match", "error");
      return;
    }
    if (pwd.newPassword.length < 6) {
      toast("New password must be at least 6 characters", "warning");
      return;
    }
    setBusyPwd(true);
    try {
      await users.updatePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setPwd({ currentPassword: "", newPassword: "", confirmNew: "" });
      toast("Password changed successfully", "success");
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to update password", "error");
    } finally {
      setBusyPwd(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-sm text-white/40">Manage your profile and account security.</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-orange-500/20 text-xl font-extrabold text-orange-400">
            {user?.Fullname?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="font-extrabold text-white">{user?.Fullname}</div>
            <div className="text-sm text-white/40">{user?.email}</div>
            <span className={["mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold", user?.role === "admin" ? "border border-orange-500/30 bg-orange-500/10 text-orange-400" : "border border-white/10 bg-white/5 text-white/50"].join(" ")}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <input value={profile.Fullname} onChange={(e) => setProfile((p) => ({ ...p, Fullname: e.target.value }))} className={inputCls} placeholder="Your full name" />
          </Field>
          <Field label="Email">
            <input value={user?.email || ""} disabled className={inputCls} />
          </Field>
          <Field label="Phone">
            <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+1 234 567 8900" />
          </Field>
          <Field label="Photo URL">
            <input value={profile.photo} onChange={(e) => setProfile((p) => ({ ...p, photo: e.target.value }))} className={inputCls} placeholder="https://..." />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Bio">
              <textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} rows={3} className={inputCls + " resize-none"} placeholder="Tell us about yourself..." />
            </Field>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={busyProfile} className="btn-brand rounded-xl px-6 py-2.5 text-sm">
              {busyProfile ? "Saving…" : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Theme card */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-4 sm:p-6">
        <div className="mb-5">
          <div className="font-extrabold text-white">Appearance</div>
          <div className="mt-1 text-sm text-white/40">Choose your preferred theme.</div>
        </div>
        <div className="flex gap-3">
          {[
            { value: "dark", label: "Dark", icon: "🌙" },
            { value: "light", label: "Light", icon: "☀️" },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={[
                "flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition",
                theme === t.value
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                  : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10",
              ].join(" ")}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Password card */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-4 sm:p-6">
        <div className="mb-5">
          <div className="font-extrabold text-white">Change Password</div>
          <div className="mt-1 text-sm text-white/40">Use a strong password with at least 6 characters.</div>
        </div>
        <form onSubmit={savePassword} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Current Password">
              <input type="password" value={pwd.currentPassword} onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))} className={inputCls} placeholder="Enter current password" />
            </Field>
          </div>
          <Field label="New Password">
            <input type="password" value={pwd.newPassword} onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))} className={inputCls} placeholder="Min. 6 characters" />
          </Field>
          <Field label="Confirm New Password">
            <input type="password" value={pwd.confirmNew} onChange={(e) => setPwd((p) => ({ ...p, confirmNew: e.target.value }))} className={inputCls} placeholder="Repeat new password" />
          </Field>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={busyPwd} className="btn-brand rounded-xl px-6 py-2.5 text-sm">
              {busyPwd ? "Updating…" : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
