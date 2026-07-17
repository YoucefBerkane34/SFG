import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit3,
  Check,
  Camera,
  Activity,
  Bell,
  Clock,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { useApp } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";

export default function ProfilePage() {
  const { user, setFactory } = useApp();
  const { history, alerts } = useSocket();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "Admin");
  const [email, setEmail] = useState(user?.email || "admin@smartfactory.com");
  const [saved, setSaved] = useState(false);

  const normalCount = history.filter((h) => h.predicted_label === "Normal").length;
  const failureCount = history.filter((h) => h.predicted_label === "Failure").length;

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const stats = [
    { label: "Total Readings", value: history.length, icon: Activity, color: "#3B82F6" },
    { label: "Alerts Received", value: alerts.length, icon: AlertTriangle, color: "#EF4444" },
    { label: "Normal Predictions", value: normalCount, icon: Check, color: "#10B981" },
    { label: "Failure Predictions", value: failureCount, icon: AlertTriangle, color: "#F59E0B" },
  ];

  const activityLog = [
    { action: "Signed in", time: "Just now", icon: User },
    { action: "Started simulation", time: "Session start", icon: Activity },
    { action: "Viewed Dashboard", time: "Session start", icon: BarChart3 },
    { action: "Account created", time: "Jan 15, 2024", icon: Calendar },
  ];

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-4xl">
      <div>
        <h1 className="text-lg md:text-xl font-display font-bold text-white">Profile</h1>
        <p className="text-[10px] md:text-xs text-white/40 mt-1">Manage your account information</p>
      </div>

      <GlassCard className="overflow-hidden" hover={false}>
        <div className="h-16 md:h-24 bg-gradient-to-r from-electric-500/20 via-cyan-500/10 to-electric-500/20 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg1OSwxMzAsMjQ2LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZ3JpZCkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-50" />
        </div>

        <div className="px-3 md:px-6 pb-4 md:pb-6">
          <div className="flex items-end gap-3 md:gap-4 -mt-6 md:-mt-8">
            <div className="relative group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-electric-500 to-cyan-500 flex items-center justify-center border-4 border-navy-800 shadow-glow-blue">
                <User className="w-7 h-7 md:w-9 md:h-9 text-white" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-base md:text-lg font-display font-bold text-white">{user?.name || "Admin"}</h2>
              <p className="text-[10px] md:text-xs text-white/40">{user?.role || "Operator"}</p>
            </div>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="btn-primary flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs mb-1 shrink-0"
            >
              {editing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              {editing ? "Save" : "Edit Profile"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Full Name</label>
                {editing ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input text-sm w-full"
                  />
                ) : (
                  <p className="text-sm text-white/80">{name}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Email</label>
                {editing ? (
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input text-sm w-full"
                  />
                ) : (
                  <p className="text-sm text-white/80">{email}</p>
                )}
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Role</label>
                <p className="text-sm text-white/80">{user?.role || "Operator"}</p>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Factory</label>
                <p className="text-sm text-white/80">Factory 1 — Main Plant</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Username</label>
                <p className="text-sm text-white/80 font-mono">{user?.username || "admin"}</p>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Member Since</label>
                <p className="text-sm text-white/80">January 15, 2024</p>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Account Status</label>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                  Active
                </span>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">Last Login</label>
                <p className="text-sm text-white/80">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <h3 className="text-[10px] md:text-xs font-semibold text-white/40 uppercase tracking-wider">Session Statistics</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {stats.map((s, i) => (
          <GlassCard key={i} className="p-4" delay={i * 0.05}>
            <s.icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
            <div className="text-xl font-display font-bold text-white">{s.value}</div>
            <div className="text-[10px] text-white/35 mt-0.5">{s.label}</div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5" hover={false} delay={0.2}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-white/40" />
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {activityLog.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                <item.icon className="w-3.5 h-3.5 text-white/30" />
              </div>
              <span className="text-xs text-white/60 flex-1">{item.action}</span>
              <span className="text-[10px] text-white/25">{item.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card border border-emerald-500/20 px-5 py-3 shadow-glow-emerald flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Profile updated successfully</span>
        </motion.div>
      )}
    </div>
  );
}
