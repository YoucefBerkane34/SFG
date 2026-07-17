import { motion } from "framer-motion";
import { History, ArrowRight } from "lucide-react";
import GlassCard from "../ui/GlassCard";

const labelColors = {
  Normal: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15",
  Warning: "text-amber-400 bg-amber-500/10 border-amber-500/15",
  Failure: "text-danger-400 bg-danger-500/10 border-danger-500/15",
};

export default function HistoryWidget({ history = [], maxItems = 10 }) {
  const display = [...history].reverse().slice(0, maxItems);

  return (
    <GlassCard className="p-5" delay={0.25}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-white/60" />
          <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Recent Predictions</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-status-pulse" />
          Live
        </div>
      </div>
      <div className="space-y-1">
        {display.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-2">
              <History className="w-5 h-5 text-white/10" />
            </div>
            <p className="text-xs text-white/25">No predictions yet</p>
          </div>
        ) : (
          display.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${labelColors[h.predicted_label] || labelColors.Normal}`}>
                  {h.predicted_label}
                </span>
                <span className="text-[10px] text-white/30">{h.machine_id || "M001"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-white/40 tabular-nums font-mono">
                  {(h.confidence * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-white/25 font-mono tabular-nums">
                  {h.time?.slice(11, 19) || ""}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
