import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { people } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: .3 } } };

export default function People() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [followingIds, setFollowingIds] = useState(new Set(user?.following?.map(String) || []));

  useEffect(() => {
    people.getAll()
      .then((d) => setUsers(d.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleFollow(id) {
    try {
      const data = await people.follow(id);
      const newSet = new Set(data.following.map(String));
      setFollowingIds(newSet);
      setUser((prev) => ({ ...prev, following: data.following }));
    } catch {
      toast("Failed to update follow", "error");
    }
  }

  const filtered = users.filter((u) =>
    String(u._id) !== String(user?._id) &&
    (q === "" || u.Fullname.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-white">People</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
          Connect with other students on PopulousHR
        </p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search people…"
        className="input"
      />

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((u) => {
            const isFollowing = followingIds.has(String(u._id));
            return (
              <motion.div key={u._id} variants={fadeUp} whileHover={{ y: -4, scale: 1.01 }} className="card p-5 flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-orange-500/20 text-sm font-extrabold text-orange-400">
                  {u.Fullname?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-white text-sm">{u.Fullname}</p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>
                    {u.role === "admin" ? "👑 Admin" : "🎓 Student"}
                    {u.following?.length > 0 && ` · ${u.following.length} following`}
                  </p>
                  {u.bio && <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-3)" }}>{u.bio}</p>}
                </div>
                <button
                  onClick={() => handleFollow(u._id)}
                  className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                    isFollowing
                      ? "border-white/10 bg-white/5 text-white/50 hover:border-red-500/30 hover:text-red-400"
                      : "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                  }`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full card p-10 text-center">
              <p className="text-sm font-bold text-white">No people found</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
