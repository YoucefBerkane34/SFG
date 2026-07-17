import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const fields = [
  { key: "temperature", label: "Temperature", color: "#EF4444", unit: "°C" },
  { key: "pressure", label: "Pressure", color: "#3B82F6", unit: "kPa" },
  { key: "vibration_level", label: "Vibration", color: "#F59E0B", unit: "mm/s" },
  { key: "humidity", label: "Humidity", color: "#06B6D4", unit: "%" },
  { key: "power_consumption", label: "Power", color: "#8B5CF6", unit: "kW" },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card border border-white/10 p-3 shadow-premium">
      <p className="text-[10px] text-white/40 mb-2">{label ? new Date(label).toLocaleTimeString() : ""}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60">{p.name}</span>
          <span className="text-white font-medium ml-auto">{Number(p.value).toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

export default function SensorCharts({ history = [] }) {
  const data = history.slice(-60).map((h, i) => ({
    ...h,
    idx: i,
  }));

  if (data.length === 0) {
    return (
      <GlassCard className="p-3 md:p-5">
        <div className="flex flex-col items-center justify-center h-40 md:h-64 text-white/30">
          <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">Waiting for sensor data...</p>
          <p className="text-xs text-white/20 mt-1">Start the simulation to see live trends</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-3 md:p-5" delay={0.1}>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div>
          <h3 className="text-xs md:text-sm font-semibold text-white">Real-time Sensor Trends</h3>
          <p className="text-[9px] md:text-[10px] text-white/30 mt-0.5">{data.length} data points</p>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-end">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-1 text-[9px] md:text-[10px] text-white/40">
              <div className="w-2 h-0.5 rounded-full" style={{ background: f.color }} />
              <span className="hidden lg:inline">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            {fields.map((f) => (
              <linearGradient key={f.key} id={`area-${f.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={f.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={f.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="time"
            tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
            tickFormatter={(v) => v?.slice(11, 19) || ""}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {fields.map((f) => (
            <Area
              key={f.key}
              type="monotone"
              dataKey={f.key}
              stroke={f.color}
              strokeWidth={2}
              fill={`url(#area-${f.key})`}
              dot={false}
              name={f.label}
              animationDuration={800}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
