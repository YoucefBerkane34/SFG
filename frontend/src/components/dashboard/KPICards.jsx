import { motion } from "framer-motion";
import { Thermometer, Gauge, Activity, Wind, Zap } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import AnimatedCounter from "../ui/AnimatedCounter";
import useAnimatedNumber from "../../hooks/useAnimatedNumber";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";

const sensors = [
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    icon: Thermometer,
    gradient: ["#EF4444", "#F97316"],
    thresholds: { good: 60, warn: 80 },
    historyKey: "tempHistory",
  },
  {
    key: "pressure",
    label: "Pressure",
    unit: "kPa",
    icon: Gauge,
    gradient: ["#3B82F6", "#6366F1"],
    thresholds: { good: 120, warn: 140 },
    historyKey: "pressureHistory",
  },
  {
    key: "vibration_level",
    label: "Vibration",
    unit: "mm/s",
    icon: Activity,
    gradient: ["#F59E0B", "#EF4444"],
    thresholds: { good: 4, warn: 5.5 },
    historyKey: "vibrationHistory",
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    icon: Wind,
    gradient: ["#06B6D4", "#0EA5E9"],
    thresholds: { good: 65, warn: 80 },
    historyKey: "humidityHistory",
  },
  {
    key: "power_consumption",
    label: "Power",
    unit: "kW",
    icon: Zap,
    gradient: ["#8B5CF6", "#A855F7"],
    thresholds: { good: 80, warn: 110 },
    historyKey: "powerHistory",
  },
];

function MiniSparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  return (
    <div className="h-10 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.slice(-20)}>
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#grad-${color})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function KPICards({ data, sensorHistory }) {
  const hist = sensorHistory || {};
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {sensors.map((s, i) => {
        const val = data?.[s.key];
        const Icon = s.icon;
        const numVal = val !== undefined && val !== null ? Number(val) : null;
        const status =
          numVal === null
            ? "offline"
            : numVal > s.thresholds.warn
            ? "critical"
            : numVal > s.thresholds.good
            ? "warning"
            : "normal";

        const statusColor = {
          normal: "from-emerald-500/10 to-transparent border-emerald-500/10",
          warning: "from-amber-500/10 to-transparent border-amber-500/10",
          critical: "from-danger-500/10 to-transparent border-danger-500/10",
          offline: "from-white/[0.02] to-transparent border-white/5",
        }[status];

        const chartData = (hist[s.key] || []).slice(-20).map((v) => ({ value: v }));

        return (
          <GlassCard
            key={s.key}
            hover
            glow={status === "critical" ? "red" : status === "warning" ? "amber" : "blue"}
            delay={i * 0.05}
            className={`p-4 bg-gradient-to-br ${statusColor} border ${status === "critical" ? "animate-glow-pulse" : ""}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center`}
                  style={{ background: `linear-gradient(135deg, ${s.gradient[0]}20, ${s.gradient[1]}10)` }}>
                  <Icon className="w-4 h-4" style={{ color: s.gradient[0] }} />
                </div>
                <span className="text-[11px] text-white/40 uppercase tracking-wider font-medium">
                  {s.label}
                </span>
              </div>
              {status !== "offline" && (
                <div className={`status-dot-${status === "critical" ? "red" : status === "warning" ? "amber" : "green"}`} />
              )}
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-display font-bold text-white">
                {numVal !== null ? (
                  <AnimatedCounter value={numVal} decimals={1} />
                ) : (
                  "---"
                )}
              </span>
              <span className="text-xs text-white/30">{s.unit}</span>
            </div>
            <MiniSparkline data={chartData} color={s.gradient[0]} />
          </GlassCard>
        );
      })}
    </div>
  );
}
