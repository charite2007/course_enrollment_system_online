import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const studentLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "⊞", end: true },
  { to: "/find-courses", label: "Find Courses", icon: "🔍" },
  { to: "/my-courses", label: "My Courses", icon: "📚" },
  { to: "/certificates", label: "Certificates", icon: "🏆" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

const adminLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "⊞", end: true },
  { to: "/admin/courses", label: "Courses", icon: "📖" },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/enrollments", label: "Enrollments", icon: "📋" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

function NavItem({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
          isActive
            ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
            : "text-white/50 hover:bg-white/5 hover:text-white border border-transparent",
        ].join(" ")
      }
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const links = isAdmin ? adminLinks : studentLinks;
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/8 px-5 py-5">
        <motion.div
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-sm font-black text-white shadow-md shadow-orange-500/30"
        >
          P
        </motion.div>
        <div className="leading-tight">
          <div className="text-sm font-extrabold text-white">PopulousHR</div>
          <div className="flex items-center gap-1.5">
            <span className={["inline-block h-1.5 w-1.5 rounded-full", isAdmin ? "bg-orange-400" : "bg-emerald-400"].join(" ")} />
            <span className="text-xs font-semibold text-white/40">{isAdmin ? "Administrator" : "Student"}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {isAdmin && (
          <div className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-widest text-white/20">Admin Panel</div>
        )}
        {links.map((l, i) => (
          <motion.div
            key={l.to}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
          >
            <NavItem {...l} />
          </motion.div>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-white/8 p-3 space-y-2">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-500/20 text-xs font-extrabold text-orange-400">
            {user?.Fullname?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-bold text-white">{user?.Fullname || "User"}</div>
            <div className="truncate text-[10px] text-white/40">{user?.email || ""}</div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-extrabold text-white/60 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
        >
          Sign Out
        </motion.button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-white/8 bg-[#0c0c0f]/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 text-xs font-black text-white">P</div>
          <span className="text-sm font-extrabold text-white">PopulousHR</span>
        </div>
        <button onClick={() => setMobileOpen((v) => !v)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col border-r border-white/8 bg-[#0c0c0f] lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-dvh w-64 flex-col border-r border-white/8 bg-[#0c0c0f] sticky top-0">
        {sidebarContent}
      </aside>


    </>
  );
}
