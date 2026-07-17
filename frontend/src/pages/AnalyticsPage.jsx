import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp } from "lucide-react";
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
  BarChart,
  Bar,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import GlassCard from "../components/ui/GlassCard";

const sensorMeta = {
  temperature: { label: "Temperature", unit: "°C", color: "#EF4444", threshold: 90 },
  pressure: { label: "Pressure", unit: "kPa", color: "#3B82F6", threshold: 150 },
  vibration_level: { label: "Vibration Level", unit: "mm/s", color: "#F59E0B", threshold: 6 },
  humidity: { label: "Humidity", unit: "%", color: "#06B6D4", threshold: 85 },
  power_consumption: { label: "Power Consumption", unit: "kW", color: "#8B5CF6", threshold: 130 },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card border border-white/10 p-3 shadow-premium text-xs">
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60">{p.name}</span>
          <span className="text-white font-medium ml-auto">{Number(p.value).toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

function SensorChart({ sensor, data, meta }) {
  const chartData = data.slice(-60).map((h, i) => ({ idx: i, [sensor]: h[sensor] || 0 }));

  return (
    <GlassCard className="p-5" delay={0.05}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">{meta.label}</h3>
        <span className="text-[10px] text-white/30">{meta.unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`grad-${sensor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={meta.color} stopOpacity={0.2} />
              <stop offset="95%" stopColor={meta.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis dataKey="idx" tick={false} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }} axisLine={false} tickLine={false} width={35} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={sensor}
            stroke={meta.color}
            strokeWidth={2}
            dot={false}
            name={meta.label}
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey={sensor}
            stroke="none"
            fill={`url(#grad-${sensor})`}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center justify-between text-[10px]">
        <span className="text-white/25">Threshold: {meta.threshold}{meta.unit}</span>
        <span className="text-white/25">
          Avg: {data.length > 0 ? (data.reduce((s, h) => s + (Number(h[sensor]) || 0), 0) / data.length).toFixed(1) : "---"}
        </span>
      </div>
    </GlassCard>
  );
}

export default function AnalyticsPage({ history, alerts }) {
  const radarData = useMemo(() => {
    if (history.length === 0) return [];
    const recent = history.slice(-20);
    return Object.entries(sensorMeta).map(([key, meta]) => {
      const avg = recent.reduce((s, h) => s + (Number(h[key]) || 0), 0) / recent.length;
      return {
        sensor: meta.label,
        value: (avg / meta.threshold) * 100,
        fullMark: 100,
      };
    });
  }, [history]);

  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, i) => ({
      day,
      predictions: Math.floor(Math.random() * 50) + 30,
      alerts: Math.floor(Math.random() * 5),
    }));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-white">Analytics</h1>
        <p className="text-xs text-white/40 mt-1">Trend analysis and sensor comparison</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(sensorMeta).map(([key, meta], i) => (
          <SensorChart key={key} sensor={key} data={history} meta={meta} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5" delay={0.3}>
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Sensor Load Comparison</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="sensor"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Load %"
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.15}
                strokeWidth={2}
                animationDuration={1200}
              />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-5" delay={0.35}>
          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="day"
                tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="predictions" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Predictions" animationDuration={1000} />
              <Bar dataKey="alerts" fill="#EF4444" radius={[4, 4, 0, 0]} name="Alerts" animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
