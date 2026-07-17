import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Cpu,
  Brain,
  Bell,
  BarChart3,
  History,
  FileText,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useSocket } from "../../context/SocketContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: Cpu, label: "Machines", key: "machines" },
  { icon: Brain, label: "AI Prediction", key: "prediction" },
  { icon: Bell, label: "Alerts", key: "alerts" },
  { icon: BarChart3, label: "Analytics", key: "analytics" },
  { icon: History, label: "History", key: "history" },
  { icon: FileText, label: "Reports", key: "reports" },
];

const bottomItems = [
  { icon: User, label: "Profile", key: "profile" },
  { icon: Settings, label: "Settings", key: "settings" },
  { icon: HelpCircle, label: "Help", key: "help" },
];

export default function Sidebar() {
  const { activePage, setActivePage, sidebarCollapsed, toggleSidebar } = useApp();
  const { alerts } = useSocket();
  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass-sidebar h-screen flex flex-col fixed left-0 top-0 z-40"
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/[0.06] shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, var(--accent), var(--accent-light))`,
            boxShadow: `0 0 16px rgba(var(--accent-rgb), 0.3)`,
          }}
        >
          <Shield className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="text-sm font-display font-bold gradient-text">SmartFactory</div>
              <div className="text-[10px] text-white/30">Guardian AI</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.key;
          const Icon = item.icon;
          return (
            <motion.button
              key={item.key}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePage(item.key)}
              className={`relative w-full flex items-center gap-3 rounded-xl transition-all duration-200 group ${
                sidebarCollapsed ? "px-0 justify-center h-10" : "px-3 h-10"
              }`}
              style={{
                background: isActive ? `rgba(var(--accent-rgb), 0.1)` : undefined,
                color: isActive ? `var(--accent-light)` : undefined,
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: `var(--accent)` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              {!isActive && (
                <style>{`
                  [data-nav="${item.key}"]:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.04); }
                `}</style>
              )}
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-[13px] font-medium overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.key === "alerts" && unreadCount > 0 && (
                <span
                  className={`absolute ${
                    sidebarCollapsed ? "top-1 right-1" : "right-2"
                  } bg-danger-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-glow-red`}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="px-2 pb-1 space-y-0.5 border-t border-white/[0.06] pt-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.key;
          return (
            <motion.button
              key={item.key}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActivePage(item.key)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 h-10 transition-all duration-200 ${
                sidebarCollapsed ? "justify-center px-0" : ""
              }`}
              style={{
                background: isActive ? `rgba(var(--accent-rgb), 0.1)` : undefined,
                color: isActive ? `var(--accent-light)` : undefined,
              }}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[13px] font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className="px-2 pb-3 pt-2 border-t border-white/[0.06]">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center h-8 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
