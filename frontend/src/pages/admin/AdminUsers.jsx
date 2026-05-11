import { useEffect, useState } from "react";
import { users } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111116] p-6 shadow-2xl">
        <div className="text-base font-extrabold text-white">Are you sure?</div>
        <div className="mt-2 text-sm text-white/50">{message}</div>
        <div className="mt-5 flex gap-3 justify-end">
          <button onClick={onCancel} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/60 hover:bg-white/10">Cancel</button>
          <button onClick={onConfirm} className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/25">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function refresh() {
    const d = await users.getAll();
    setItems(d.users || []);
  }

  useEffect(() => { refresh().catch(() => {}); }, []);

  const filtered = q.trim()
    ? items.filter((u) => u.Fullname.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))
    : items;

  const adminCount = items.filter((u) => u.role === "admin").length;
  const studentCount = items.filter((u) => u.role === "student").length;

  async function handleDelete() {
    const id = confirm.id;
    setConfirm(null);
    setBusy(id + "_del");
    try {
      await users.deleteUser(id);
      toast("User deleted successfully", "success");
      await refresh();
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to delete user", "error");
    } finally {
      setBusy(null);
    }
  }

  async function handlePromote(u) {
    setBusy(u._id + "_promo");
    try {
      await users.promoteUser(u._id);
      const newRole = u.role === "admin" ? "student" : "admin";
      toast(`${u.Fullname} is now a ${newRole}`, "success");
      await refresh();
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to change role", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!confirm}
        message={`This will permanently delete ${confirm?.name} and all their enrollment data.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Users</h1>
          <p className="mt-1 text-sm text-white/40">
            {items.length} total · <span className="text-orange-400">{adminCount} admin{adminCount !== 1 ? "s" : ""}</span> · {studentCount} student{studentCount !== 1 ? "s" : ""}
          </p>
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email..." className="w-full sm:w-64 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-orange-500/60 transition" />
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/8 bg-black/20">
              <tr>
                {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-xs font-extrabold uppercase tracking-widest text-white/30">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => {
                const isMe = String(u._id) === String(me?._id);
                return (
                  <tr key={u._id} className="hover:bg-white/2 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500/15 text-xs font-extrabold text-orange-400">
                          {u.Fullname?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="font-semibold text-white">
                          {u.Fullname}
                          {isMe && <span className="ml-2 rounded-full bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-bold text-orange-400">You</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/50">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={["rounded-full px-2.5 py-1 text-xs font-bold", u.role === "admin" ? "border border-orange-500/30 bg-orange-500/10 text-orange-400" : "border border-white/10 bg-white/5 text-white/50"].join(" ")}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/30">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-3.5">
                      {isMe ? (
                        <span className="text-xs text-white/20">—</span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            disabled={!!busy}
                            onClick={() => handlePromote(u)}
                            className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-500/20 disabled:opacity-40 transition"
                          >
                            {busy === u._id + "_promo" ? "…" : u.role === "admin" ? "→ Student" : "→ Admin"}
                          </button>
                          <button
                            disabled={!!busy}
                            onClick={() => setConfirm({ id: u._id, name: u.Fullname })}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition"
                          >
                            {busy === u._id + "_del" ? "…" : "Delete"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-white/30">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
