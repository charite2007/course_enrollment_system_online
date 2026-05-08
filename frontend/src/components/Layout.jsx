import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./Sidebar";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="flex min-h-dvh bg-[#0b0b0b]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#0f0f10] p-4 pt-16 sm:p-6 lg:pt-6">
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

