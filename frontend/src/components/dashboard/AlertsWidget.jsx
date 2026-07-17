import { motion, AnimatePresence } from "framer-motion";
import { Bell, AlertTriangle, XCircle, Info, Check, ChevronRight, ExternalLink } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const severityConfig = {
  critical: { icon: XCircle, color: "text-danger-400", bg: "bg-danger-500/5", border: "border-danger-500/15" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/15" },
  info: { icon: Info, color: "text-electric-400", bg: "bg-electric-500/5", border: "border-electric-500/15" },
};

export default function AlertsWidget({ alerts = [], onViewDetail, onAcknowledge, maxItems = 6 }) {
  const displayAlerts = alerts.slice(0, maxItems);
  const unreadCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <GlassCard className="p-3 md:p-5" delay={0.2}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-white/60" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Recent Alerts</span>
        </div>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-danger-500/15 border border-danger-500/20 text-[10px] text-danger-400 font-medium">
            {unreadCount} unread
          </span>
        )}
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {displayAlerts.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-2">
                <Bell className="w-5 h-5 text-white/10" />
              </div>
              <p className="text-xs text-white/25">No alerts</p>
            </div>
          ) : (
            displayAlerts.map((alert, i) => {
              const cfg = severityConfig[alert.severity] || severityConfig.info;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={alert.id || i}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer group ${
                    alert.acknowledged
                      ? "bg-white/[0.01] opacity-50"
                      : `${cfg.bg} border ${cfg.border} ${alert.severity === "critical" ? "animate-glow-pulse" : ""}`
                  }`}
                  onClick={() => onViewDetail?.(alert)}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 truncate">{alert.message}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {alert.machine_id && `${alert.machine_id} · `}
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!alert.acknowledged && onAcknowledge && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onAcknowledge(alert.id); }}
                        className="p-1 rounded-md text-white/20 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                        title="Acknowledge"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                    <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
