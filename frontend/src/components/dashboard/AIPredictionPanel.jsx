import { motion } from "framer-motion";
import { Brain, AlertTriangle, CheckCircle, Clock, Shield, Zap } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import CircularProgress from "../ui/CircularProgress";

const statusConfig = {
  Normal: {
    icon: CheckCircle,
    color: "#10B981",
    label: "Normal",
    bg: "from-emerald-500/10 to-transparent",
    border: "border-emerald-500/15",
  },
  Warning: {
    icon: AlertTriangle,
    color: "#F59E0B",
    label: "Warning",
    bg: "from-amber-500/10 to-transparent",
    border: "border-amber-500/15",
  },
  Failure: {
    icon: AlertTriangle,
    color: "#EF4444",
    label: "Failure",
    bg: "from-danger-500/10 to-transparent",
    border: "border-danger-500/15",
  },
};

function BufferingView({ prediction }) {
  const bufferVal = prediction?.buffer_size || parseInt(prediction?.progress?.split("/")[0] || "0");
  const pct = (bufferVal / 10) * 100;

  return (
    <GlassCard className="p-3 md:p-5" delay={0.15}>
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <Brain className="w-4 h-4 text-electric-400" />
        <span className="text-[10px] md:text-xs font-semibold text-white/60 uppercase tracking-wider">AI Prediction</span>
      </div>
      <div className="flex items-center gap-3 md:gap-5">
        <CircularProgress value={pct} size={64} strokeWidth={5} color="#3B82F6" label="Buffer" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-electric-400 animate-spin-slow" />
            <span className="text-lg font-display font-bold text-electric-400">Buffering</span>
          </div>
          <p className="text-xs text-white/40">Collecting sensor readings...</p>
          <p className="text-xs text-white/30 mt-0.5">{bufferVal}/10 readings</p>
          <div className="mt-3 w-full bg-white/[0.06] rounded-full h-1.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-electric-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 rounded-xl bg-electric-500/5 border border-electric-500/10">
        <div className="flex items-center gap-2 text-[10px] text-electric-400">
          <Zap className="w-3 h-3" />
          <span>CNN feature extraction will begin after buffer is full</span>
        </div>
      </div>
    </GlassCard>
  );
}

function IdleView() {
  return (
    <GlassCard className="p-3 md:p-5" delay={0.15}>
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <Brain className="w-4 h-4 text-white/30" />
        <span className="text-[10px] md:text-xs font-semibold text-white/40 uppercase tracking-wider">AI Prediction</span>
      </div>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-3">
          <Brain className="w-8 h-8 text-white/10" />
        </div>
        <p className="text-sm text-white/30">AI model idle</p>
        <p className="text-xs text-white/15 mt-1">Start simulation to activate</p>
      </div>
    </GlassCard>
  );
}

function PredictionView({ prediction }) {
  const cfg = statusConfig[prediction.predicted_label] || statusConfig.Normal;
  const Icon = cfg.icon;
  const confidence = (prediction.confidence * 100).toFixed(1);

  const riskLevel =
    prediction.predicted_label === "Failure"
      ? "Critical"
      : prediction.predicted_label === "Warning"
      ? "Moderate"
      : "Low";

  const riskColor =
    prediction.predicted_label === "Failure"
      ? "text-danger-400"
      : prediction.predicted_label === "Warning"
      ? "text-amber-400"
      : "text-emerald-400";

  return (
    <GlassCard className={`p-3 md:p-5 bg-gradient-to-br ${cfg.bg} border ${cfg.border}`} hover={false} delay={0.15}>
      <div className="flex items-center gap-2 mb-3 md:mb-4">
        <Brain className="w-4 h-4 text-white/60" />
        <span className="text-[10px] md:text-xs font-semibold text-white/60 uppercase tracking-wider">AI Prediction</span>
        <div className="ml-auto flex items-center gap-1.5 px-1.5 md:px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
          <Shield className="w-3 h-3 text-electric-400" />
          <span className="text-[8px] md:text-[9px] text-electric-400 font-medium">CNN + XGBoost</span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <CircularProgress
          value={Number(confidence)}
          size={64}
          strokeWidth={5}
          color={cfg.color}
          label="Confidence"
        />
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <Icon className="w-6 h-6" style={{ color: cfg.color }} />
              <span className="text-lg md:text-xl font-display font-bold" style={{ color: cfg.color }}>
                {prediction.predicted_label}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-white/40">Confidence</span>
              <span className="text-xs font-medium text-white">{confidence}%</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5">
              <motion.div
                className="h-full rounded-full"
                style={{ background: cfg.color }}
                initial={{ width: 0 }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-white/40">Risk Level</span>
              <span className={`text-xs font-semibold ${riskColor}`}>{riskLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function AIPredictionPanel({ prediction }) {
  if (!prediction) return <IdleView />;
  if (prediction.buffering) return <BufferingView prediction={prediction} />;
  return <PredictionView prediction={prediction} />;
}
