import GlassCard from "../ui/GlassCard";
import AnimatedCounter from "../ui/AnimatedCounter";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const OVERVIEW_STATS = [
  { key: "total_readings", label: "Total Readings", color: "#3B82F6" },
  { key: "total_predictions", label: "Predictions", color: "#8B5CF6" },
  { key: "active_alerts", label: "Active Alerts", color: "#EF4444" },
  { key: "registered_machines", label: "Machines", color: "#10B981" },
];

const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

export function FactoryOverviewCard({ stats }) {
  return (
    <GlassCard className="p-5" delay={0.05}>
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Factory Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        {OVERVIEW_STATS.map((s) => (
          <div key={s.key} className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}15` }}
            >
              <AnimatedCounter
                value={stats?.[s.key] || 0}
                decimals={0}
                duration={1000}
                suffix=""
              />
            </div>
            <div>
              <div className="text-lg font-display font-bold text-white">
                <AnimatedCounter value={stats?.[s.key] || 0} decimals={0} />
              </div>
              <div className="text-[10px] text-white/35">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function MachineStatusPie({ history }) {
  const counts = { Normal: 0, Warning: 0, Failure: 0 };
  history.forEach((h) => {
    if (counts[h.predicted_label] !== undefined) counts[h.predicted_label]++;
  });
  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <GlassCard className="p-5" delay={0.3}>
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Status Distribution</h3>
        <div className="h-40 flex items-center justify-center text-xs text-white/20">No data</div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5" delay={0.3}>
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Status Distribution</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={4}
              dataKey="value"
              animationBegin={0}
              animationDuration={1200}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-[11px] text-white/50">{d.name}</span>
              <span className="text-[11px] text-white/70 font-medium ml-auto">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

export function AlertDistributionChart({ alerts }) {
  const counts = { critical: 0, warning: 0, info: 0 };
  alerts.forEach((a) => {
    if (counts[a.severity] !== undefined) counts[a.severity]++;
  });
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));

  const barColors = { critical: "#EF4444", warning: "#F59E0B", info: "#3B82F6" };

  if (alerts.length === 0) {
    return (
      <GlassCard className="p-5" delay={0.35}>
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Alert Distribution</h3>
        <div className="h-40 flex items-center justify-center text-xs text-white/20">No alerts</div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5" delay={0.35}>
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Alert Distribution</h3>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={false} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(11,18,32,0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              fontSize: 11,
            }}
            cursor={false}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1000}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={barColors[entry.name] || "#3B82F6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}

export function PowerConsumptionChart({ history }) {
  const data = history.slice(-30).map((h, i) => ({
    time: i,
    value: h.power_consumption || 0,
  }));

  if (data.length === 0) return null;

  return (
    <GlassCard className="p-5" delay={0.4}>
      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Power Consumption</h3>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="powerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8B5CF6"
            strokeWidth={2}
            fill="url(#powerGrad)"
            dot={false}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}
