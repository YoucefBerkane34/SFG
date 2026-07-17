import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  XCircle,
  Info,
  Check,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import AlertDetail from "../components/dashboard/AlertDetail";

const severityConfig = {
  critical: { icon: XCircle, color: "text-danger-400", bg: "bg-danger-500/5", border: "border-danger-500/15", label: "Critical" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/15", label: "Warning" },
  info: { icon: Info, color: "text-electric-400", bg: "bg-electric-500/5", border: "border-electric-500/15", label: "Info" },
};

export default function AlertsPage({ alerts, onAcknowledge }) {
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (filter !== "all" && a.severity !== filter) return false;
      if (search && !a.message?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [alerts, filter, search]);

  const counts = useMemo(() => ({
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical").length,
    warning: alerts.filter((a) => a.severity === "warning").length,
    info: alerts.filter((a) => a.severity === "info").length,
  }), [alerts]);

  if (selectedAlert) {
    return (
      <div className="p-6">
        <AlertDetail
          alert={selectedAlert}
          onBack={() => setSelectedAlert(null)}
          onAcknowledge={onAcknowledge}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-white">Alert Center</h1>
        <p className="text-xs text-white/40 mt-1">Monitor and manage system alerts</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="glass-input flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {["all", "critical", "warning", "info"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? f === "critical"
                    ? "bg-danger-500/15 text-danger-400 border border-danger-500/20"
                    : f === "warning"
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                    : f === "info"
                    ? "bg-electric-500/15 text-electric-400 border border-electric-500/20"
                    : "bg-white/10 text-white border border-white/10"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 text-[10px] opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <GlassCard className="p-12">
              <div className="text-center">
                <Bell className="w-10 h-10 text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/30">No alerts found</p>
              </div>
            </GlassCard>
          ) : (
            filtered.map((alert, i) => {
              const cfg = severityConfig[alert.severity] || severityConfig.info;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={alert.id || i}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                >
                  <div
                    className={`glass-card p-4 cursor-pointer transition-all hover:-translate-y-0.5 ${
                      alert.acknowledged
                        ? "opacity-50"
                        : alert.severity === "critical"
                        ? "border-danger-500/15 animate-glow-pulse"
                        : ""
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-white/25">{alert.machine_id}</span>
                        </div>
                        <p className="text-sm text-white/80 mt-1.5 truncate">{alert.message}</p>
                        <p className="text-[10px] text-white/25 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!alert.acknowledged && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id); }}
                            className="p-2 rounded-lg text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <ExternalLink className="w-4 h-4 text-white/15" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
