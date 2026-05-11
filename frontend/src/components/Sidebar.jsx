import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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

function NavItem({ to, label, icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
    >
      <span className="text-base leading-none">{icon}</span>
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const links = isAdmin ? adminLinks : studentLinks;
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  const closeMobile = () => setMobileOpen(false);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // even if the API call fails, clear local state and redirect
    } finally {
      navigate("/login", { replace: true });
    }
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-4">
        <motion.div
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-base font-black text-white shadow-md shadow-orange-500/30"
        >
          P
        </motion.div>
        <div className="leading-tight">
          <div className="text-base font-extrabold text-white">PopulousHR</div>
          <div className="flex items-center gap-1.5">
            <span className={["inline-block h-2 w-2 rounded-full", isAdmin ? "bg-orange-400" : "bg-emerald-400"].join(" ")} />
            <span className="text-sm font-semibold text-white/40">{isAdmin ? "Administrator" : "Student"}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {isAdmin && (
          <div className="mb-3 px-3 text-xs font-extrabold uppercase tracking-widest text-white/20">Admin Panel</div>
        )}
        {links.map((l, i) => (
          <motion.div
            key={l.to}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
          >
            <NavItem {...l} onClick={closeMobile} />
          </motion.div>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-white/8 p-3 space-y-2">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-500/20 text-sm font-extrabold text-orange-400">
            {user?.Fullname?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-bold text-white">{user?.Fullname || "User"}</div>
            <div className="truncate text-sm text-white/40">{user?.email || ""}</div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white/60 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
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
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 text-base font-black text-white">P</div>
          <span className="text-lg font-extrabold text-white">PopulousHR</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white transition"
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              onClick={closeMobile}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 flex h-dvh w-72 flex-col border-r border-white/8 bg-[#0c0c0f] lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex h-dvh w-72 flex-col border-r border-white/8 bg-[#0c0c0f] fixed top-0 left-0">
        {sidebarContent}
      </aside>
    </>
  );
}
