import { motion } from "framer-motion";
import {
  Cpu,
  Thermometer,
  Gauge,
  Activity,
  Wind,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import GlassCard from "../ui/GlassCard";
import AnimatedCounter from "../ui/AnimatedCounter";
import StatusBadge from "../ui/StatusBadge";
import CircularProgress from "../ui/CircularProgress";
import useAnimatedNumber from "../../hooks/useAnimatedNumber";

const sensorConfig = [
  { key: "temperature", label: "Temp", unit: "°C", icon: Thermometer, color: "#EF4444", threshold: 90 },
  { key: "pressure", label: "Pressure", unit: "kPa", icon: Gauge, color: "#3B82F6", threshold: 150 },
  { key: "vibration_level", label: "Vibration", unit: "mm/s", icon: Activity, color: "#F59E0B", threshold: 6 },
  { key: "humidity", label: "Humidity", unit: "%", icon: Wind, color: "#06B6D4", threshold: 85 },
  { key: "power_consumption", label: "Power", unit: "kW", icon: Zap, color: "#8B5CF6", threshold: 130 },
];

function MachineCard({ machineId, sensors, prediction, index }) {
  const healthScore = prediction?.predicted_label === "Normal"
    ? 92
    : prediction?.predicted_label === "Warning"
    ? 65
    : prediction?.buffering
    ? null
    : 25;

  return (
    <GlassCard
      hover
      glow={healthScore !== null && healthScore < 50 ? "red" : healthScore !== null && healthScore < 75 ? "amber" : "emerald"}
      delay={index * 0.05}
      className="p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-500/20 to-cyan-500/10 flex items-center justify-center border border-electric-500/15">
            <Cpu className="w-5 h-5 text-electric-400" />
          </div>
          <div>
            <h3 className="text-sm font-display font-semibold text-white">{machineId}</h3>
            <p className="text-[10px] text-white/30">CNC Milling Center</p>
          </div>
        </div>
        {healthScore !== null ? (
          <CircularProgress
            value={healthScore}
            size={56}
            strokeWidth={4}
            color={healthScore > 75 ? "#10B981" : healthScore > 50 ? "#F59E0B" : "#EF4444"}
            label="Health"
          />
        ) : (
          <div className="flex items-center gap-2 text-xs text-electric-400">
            <Clock className="w-4 h-4 animate-spin-slow" />
            Buffering
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {sensorConfig.map((s) => {
          const val = sensors?.[s.key];
          const numVal = val !== undefined && val !== null ? Number(val) : null;
          const isFault = numVal !== null && numVal > s.threshold;
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className={`rounded-xl p-2.5 text-center transition-all ${
                isFault ? "bg-danger-500/10 border border-danger-500/15" : "bg-white/[0.03] border border-white/[0.04]"
              }`}
            >
              <Icon
                className="w-3.5 h-3.5 mx-auto mb-1"
                style={{ color: isFault ? "#EF4444" : s.color }}
              />
              <div className={`text-sm font-bold tabular-nums ${isFault ? "text-danger-400" : "text-white"}`}>
                {numVal !== null ? numVal.toFixed(1) : "---"}
              </div>
              <div className="text-[8px] text-white/25 mt-0.5">{s.unit}</div>
            </div>
          );
        })}
      </div>

      {prediction && !prediction.buffering && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
          <div className="flex items-center gap-2">
            {prediction.predicted_label === "Normal" ? (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : prediction.predicted_label === "Warning" ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-danger-400" />
            )}
            <span className={`text-xs font-semibold ${
              prediction.predicted_label === "Normal"
                ? "text-emerald-400"
                : prediction.predicted_label === "Warning"
                ? "text-amber-400"
                : "text-danger-400"
            }`}>
              {prediction.predicted_label}
            </span>
          </div>
          <span className="text-[11px] text-white/40 tabular-nums">
            {(prediction.confidence * 100).toFixed(1)}% confidence
          </span>
        </div>
      )}
    </GlassCard>
  );
}

export default function MachineMonitoring({ history, prediction, currentData }) {
  const machineIds = ["M001"];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-white">Machine Monitoring</h1>
        <p className="text-xs text-white/40 mt-1">Real-time status and sensor monitoring for all registered machines</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {machineIds.map((id, i) => (
          <MachineCard
            key={id}
            machineId={id}
            sensors={currentData}
            prediction={prediction}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
