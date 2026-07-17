import { motion } from "framer-motion";
import { AlertTriangle, Thermometer, Gauge, Activity, Wind, Zap, Brain, ArrowLeft, Check } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const sensorIcons = {
  temperature: { icon: Thermometer, label: "Temperature", unit: "°C", color: "#EF4444", threshold: 90 },
  pressure: { icon: Gauge, label: "Pressure", unit: "kPa", color: "#3B82F6", threshold: 150 },
  vibration_level: { icon: Activity, label: "Vibration", unit: "mm/s", color: "#F59E0B", threshold: 6 },
  humidity: { icon: Wind, label: "Humidity", unit: "%", color: "#06B6D4", threshold: 85 },
  power_consumption: { icon: Zap, label: "Power", unit: "kW", color: "#8B5CF6", threshold: 130 },
};

export default function AlertDetail({ alert, onBack, onAcknowledge }) {
  if (!alert) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-sm text-white/30">No alert selected</p>
      </GlassCard>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Alerts
      </button>

      <GlassCard
        className={`p-6 ${
          alert.severity === "critical"
            ? "bg-gradient-to-br from-danger-500/10 to-transparent border-danger-500/20 animate-glow-pulse"
            : "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20"
        }`}
        hover={false}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-danger-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-danger-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-display font-bold text-white">{alert.message || "Failure Alert"}</h2>
            <p className="text-xs text-white/40 mt-1">
              Machine: {alert.machine_id} · {new Date(alert.timestamp).toLocaleString()}
            </p>
            <span className="inline-block mt-2 px-2.5 py-1 text-[10px] uppercase font-bold rounded-lg bg-danger-500/20 text-danger-400 border border-danger-500/20">
              {alert.severity}
            </span>
          </div>
          {!alert.acknowledged && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Acknowledge
            </button>
          )}
        </div>
      </GlassCard>

      {alert.prediction && (
        <GlassCard className="p-5" hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-white/60" />
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">AI Prediction at Time of Alert</span>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`text-2xl font-display font-bold ${
                alert.prediction.predicted_label === "Failure" ? "text-danger-400" : "text-amber-400"
              }`}
            >
              {alert.prediction.predicted_label}
            </div>
            <div className="text-xs text-white/40">
              Confidence: {(alert.prediction.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </GlassCard>
      )}

      {alert.sensors && (
        <GlassCard className="p-5" hover={false}>
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Sensor Readings at Failure</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(sensorIcons).map(([key, cfg]) => {
              const val = alert.sensors[key];
              const Icon = cfg.icon;
              const isFault = val !== undefined && val !== null && Number(val) > cfg.threshold;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl p-4 flex items-center gap-3 transition-all ${
                    isFault
                      ? "bg-danger-500/10 border border-danger-500/20 shadow-glow-red"
                      : "bg-white/[0.03] border border-white/[0.06]"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: isFault ? "rgba(239,68,68,0.15)" : `${cfg.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: isFault ? "#EF4444" : cfg.color }} />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/40">{cfg.label}</div>
                    <div className={`text-lg font-display font-bold ${isFault ? "text-danger-400" : "text-white"}`}>
                      {val !== undefined && val !== null ? Number(val).toFixed(1) : "---"}
                      <span className="text-xs text-white/30 ml-1">{cfg.unit}</span>
                    </div>
                    {isFault && (
                      <span className="text-[9px] text-danger-400 font-semibold uppercase tracking-wider">
                        Over Limit · Threshold: {cfg.threshold}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      )}
    </motion.div>
  );
}
