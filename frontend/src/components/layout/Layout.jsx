import { useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { useApp } from "../../context/AppContext";
import ToastContainer from "../ui/ToastContainer";

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "59, 130, 246";
}

function lightenHex(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0xff) + Math.round(2.55 * percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function darkenHex(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0xff) - Math.round(2.55 * percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function applySavedSettings() {
  try {
    const saved = localStorage.getItem("sg-settings");
    if (!saved) return;
    const s = JSON.parse(saved);
    const root = document.documentElement;

    root.classList.remove("compact-mode", "no-anim-bg");
    if (s.compactMode) root.classList.add("compact-mode");
    if (!s.animatedBackground) root.classList.add("no-anim-bg");

    root.classList.remove("theme-dark", "theme-midnight", "theme-deep-navy");
    const themeMap = { "Dark": "theme-dark", "Midnight": "theme-midnight", "Deep Navy": "theme-deep-navy" };
    root.classList.add(themeMap[s.theme] || "theme-dark");

    if (s.accentColor) {
      const rgb = hexToRgb(s.accentColor);
      root.style.setProperty("--accent", s.accentColor);
      root.style.setProperty("--accent-rgb", rgb);
      root.style.setProperty("--accent-light", lightenHex(s.accentColor, 30));
      root.style.setProperty("--accent-dark", darkenHex(s.accentColor, 20));
    }
  } catch {}
}

export default function Layout({ children }) {
  const { sidebarCollapsed } = useApp();

  useEffect(() => {
    applySavedSettings();
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="animated-grid fixed inset-0 pointer-events-none opacity-50" />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(var(--accent-rgb), 0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(var(--accent-rgb), 0.03) 0%, transparent 50%)",
        }}
      />
      <Sidebar />
      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="min-h-screen flex flex-col relative z-10"
      >
        <TopNavbar />
        <main className="flex-1 overflow-auto">{children}</main>
      </motion.div>
      <ToastContainer />
    </div>
  );
}
