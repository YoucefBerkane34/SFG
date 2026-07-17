import { motion } from "framer-motion";
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  Timer,
  Target,
  Activity,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import CircularProgress from "../components/ui/CircularProgress";
import GaugeChart from "../components/ui/GaugeChart";
import StatusBadge from "../components/ui/StatusBadge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function AIPredictionPage({ prediction, history }) {
  const confidence = prediction ? (prediction.confidence * 100) : 0;
  const isNormal = prediction?.predicted_label === "Normal";
  const isWarning = prediction?.predicted_label === "Warning";
  const isFailure = prediction?.predicted_label === "Failure";
  const isBuffering = prediction?.buffering;

  const predHistory = history
    .slice(-30)
    .map((h, i) => ({
      idx: i,
      confidence: (h.confidence || 0) * 100,
      Normal: h.predicted_label === "Normal" ? 1 : 0,
      Warning: h.predicted_label === "Warning" ? 1 : 0,
      Failure: h.predicted_label === "Failure" ? 1 : 0,
    }));

  const failureCount = history.filter((h) => h.predicted_label === "Failure").length;
  const warningCount = history.filter((h) => h.predicted_label === "Warning").length;
  const normalCount = history.filter((h) => h.predicted_label === "Normal").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-white">AI Prediction</h1>
        <p className="text-xs text-white/40 mt-1">CNN + XGBoost predictive maintenance analysis</p>
      </div>

      {isBuffering ? (
        <GlassCard className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <CircularProgress
              value={((prediction?.buffer_size || 0) / 10) * 100}
              size={120}
              strokeWidth={8}
              color="#3B82F6"
              label="Buffer"
            />
            <p className="text-lg font-display font-bold text-electric-400 mt-6">Buffering Sensor Data</p>
            <p className="text-xs text-white/40 mt-1">Collecting {prediction?.buffer_size || 0}/10 readings before first prediction</p>
          </div>
        </GlassCard>
      ) : prediction ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard
              className={`p-6 ${
                isFailure
                  ? "bg-gradient-to-br from-danger-500/10 border-danger-500/20"
                  : isWarning
                  ? "bg-gradient-to-br from-amber-500/10 border-amber-500/20"
                  : "bg-gradient-to-br from-emerald-500/10 border-emerald-500/20"
              }`}
              hover={false}
              glow={isFailure ? "red" : isWarning ? "amber" : "emerald"}
            >
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-4 h-4 text-white/60" />
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Current Prediction</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <CircularProgress
                  value={confidence}
                  size={140}
                  strokeWidth={10}
                  color={isFailure ? "#EF4444" : isWarning ? "#F59E0B" : "#10B981"}
                  label="Confidence"
                />
                <div className="mt-4">
                  <StatusBadge status={isFailure ? "failure" : isWarning ? "warning" : "normal"} size="lg" />
                </div>
                <p className="text-2xl font-display font-bold text-white mt-3">
                  {prediction.predicted_label}
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-6" delay={0.1}>
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-4 h-4 text-white/60" />
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Risk Assessment</span>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-white/40">Failure Probability</span>
                    <span className={`text-sm font-bold ${isFailure ? "text-danger-400" : isWarning ? "text-amber-400" : "text-emerald-400"}`}>
                      {isFailure ? "High" : isWarning ? "Medium" : "Low"}
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: isFailure ? "#EF4444" : isWarning ? "#F59E0B" : "#10B981" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Risk Level</span>
                  <span className={`text-sm font-bold ${isFailure ? "text-danger-400" : isWarning ? "text-amber-400" : "text-emerald-400"}`}>
                    {isFailure ? "Critical" : isWarning ? "Moderate" : "Low"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Confidence Score</span>
                  <span className="text-sm font-bold text-white">{confidence.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Model</span>
                  <span className="text-xs text-electric-400 font-medium">CNN + XGBoost</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Recommended Action</p>
                  <p className="text-xs text-white/70">
                    {isFailure
                      ? "Immediate maintenance inspection required. Schedule emergency maintenance."
                      : isWarning
                      ? "Schedule preventive maintenance within the next 48 hours."
                      : "Continue normal operation. Next check in standard interval."}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6" delay={0.15}>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-4 h-4 text-white/60" />
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Model Statistics</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Predictions", value: history.length, icon: Target, color: "#3B82F6" },
                  { label: "Normal Count", value: normalCount, icon: CheckCircle, color: "#10B981" },
                  { label: "Warning Count", value: warningCount, icon: AlertTriangle, color: "#F59E0B" },
                  { label: "Failure Count", value: failureCount, icon: AlertTriangle, color: "#EF4444" },
                ].map((stat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <stat.icon className="w-4 h-4 mb-2" style={{ color: stat.color }} />
                    <div className="text-lg font-display font-bold text-white">{stat.value}</div>
                    <div className="text-[10px] text-white/30">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-electric-500/5 border border-electric-500/10">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-electric-400" />
                  <span className="text-xs text-electric-400 font-medium">Pipeline Active</span>
                </div>
                <p className="text-[10px] text-white/30 mt-1">
                  1D CNN → 32-dim features → XGBoost classifier
                </p>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-5" delay={0.2}>
            <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-4">Prediction Confidence Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={predHistory}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="idx" tick={false} axisLine={false} tickLine={false} />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(11,18,32,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  cursor={false}
                />
                <Area
                  type="monotone"
                  dataKey="confidence"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#confGrad)"
                  dot={false}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </>
      ) : (
        <GlassCard className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-4">
              <Brain className="w-10 h-10 text-white/10" />
            </div>
            <p className="text-sm text-white/30">AI model idle</p>
            <p className="text-xs text-white/15 mt-1">Start the simulation to begin predictions</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
