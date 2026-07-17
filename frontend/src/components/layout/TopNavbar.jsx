import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  Factory,
  Clock,
  Wifi,
  WifiOff,
  X,
  Play,
  Square,
  Settings,
  LogOut,
  UserCircle,
  Menu,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useSocket } from "../../context/SocketContext";

export default function TopNavbar() {
  const {
    factory,
    searchOpen,
    setSearchOpen,
    setActivePage,
    user,
    logout,
    toggleMobileSidebar,
  } = useApp();
  const { connected, simulating, startSimulation, stopSimulation, alerts } = useSocket();
  const [time, setTime] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unreadCount = alerts.filter((a) => !a.acknowledged).length;
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setActivePage("profile");
    setProfileOpen(false);
  };

  const handleSettingsClick = () => {
    setActivePage("settings");
    setProfileOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  return (
    <header className="glass-navbar h-14 md:h-16 flex items-center justify-between px-3 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden btn-ghost p-2 -ml-1"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-white/60">
          <Factory className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium hidden lg:block">{factory}</span>
        </div>
        <div className="h-4 w-px bg-white/10 hidden lg:block" />
        <div className="flex items-center gap-2">
          <button
            onClick={simulating ? stopSimulation : () => startSimulation("M001")}
            disabled={!connected}
            className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-lg text-[11px] md:text-xs font-medium transition-all duration-300 disabled:opacity-40 ${
              simulating
                ? "bg-danger-500/15 text-danger-400 hover:bg-danger-500/25 border border-danger-500/20"
                : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20"
            }`}
          >
            {simulating ? (
              <><Square className="w-3 h-3" /> <span className="hidden sm:inline">Stop</span></>
            ) : (
              <><Play className="w-3 h-3" /> <span className="hidden sm:inline">Start</span></>
            )}
          </button>
          {simulating && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-status-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <div className="flex items-center gap-1.5 text-xs text-white/40 mr-1 md:mr-2 hidden md:flex">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono tabular-nums">
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </span>
        </div>

        <div className="h-4 w-px bg-white/10 hidden md:block" />

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs hidden lg:flex">
          {connected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-danger-400" />
              <span className="text-danger-400">Offline</span>
            </>
          )}
        </div>

        <div className="h-4 w-px bg-white/10 hidden md:block" />

        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="btn-ghost p-1.5 md:p-2"
        >
          <Search className="w-4 h-4" />
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="btn-ghost p-1.5 md:p-2 relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-danger-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="absolute right-0 top-12 w-72 md:w-80 glass-card p-4 shadow-premium"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  <span className="text-[10px] text-white/40">{unreadCount} unread</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {alerts.length === 0 && (
                    <p className="text-xs text-white/30 text-center py-4">No notifications</p>
                  )}
                  {alerts.slice(0, 10).map((a, i) => (
                    <div
                      key={a.id || i}
                      className={`p-2 rounded-lg text-xs ${
                        a.acknowledged ? "bg-white/[0.02]" : "bg-danger-500/5 border border-danger-500/10"
                      }`}
                    >
                      <p className="text-white/80">{a.message}</p>
                      <p className="text-white/30 mt-1">
                        {new Date(a.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-1.5 md:gap-2 btn-ghost py-1.5 px-1.5 md:px-2"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric-500 to-cyan-500 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-medium text-white">{user?.name || "Admin"}</div>
              <div className="text-[10px] text-white/40">{user?.role || "Operator"}</div>
            </div>
            <ChevronDown className={`w-3 h-3 text-white/40 hidden md:block transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-56 glass-card p-2 shadow-premium"
              >
                <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
                  <p className="text-xs font-semibold text-white">{user?.name || "Admin"}</p>
                  <p className="text-[10px] text-white/35">{user?.email || "admin@smartfactory.com"}</p>
                </div>
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                >
                  <UserCircle className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={handleSettingsClick}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <div className="border-t border-white/[0.06] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs text-danger-400/70 hover:text-danger-400 hover:bg-danger-500/5 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 md:top-16 left-0 right-0 px-3 md:px-6 pb-4"
          >
            <div className="glass-input flex items-center gap-3">
              <Search className="w-4 h-4 text-white/40" />
              <input
                autoFocus
                placeholder="Search machines, alerts, predictions..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30"
              />
              <button onClick={() => setSearchOpen(false)}>
                <X className="w-4 h-4 text-white/40 hover:text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
