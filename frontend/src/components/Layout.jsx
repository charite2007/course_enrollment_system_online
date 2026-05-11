import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex min-h-dvh" style={{ background: "var(--bg-base)" }}>
      <Sidebar />
      {/* lg:pl-64 offsets content from the fixed sidebar */}
      <main className="flex-1 min-w-0 overflow-y-auto p-3 pt-14 sm:p-5 lg:pt-5 lg:pl-68" style={{ background: "var(--bg-surface)" }}>
        <div className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
