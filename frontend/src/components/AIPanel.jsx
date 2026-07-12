import { Brain, AlertTriangle, CheckCircle, HelpCircle, Clock } from "lucide-react";

const statusConfig = {
  Normal: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  Warning: { icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  Failure: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
};

export default function AIPanel({ prediction }) {
  if (!prediction) {
    return (
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-dark-400">
        <Brain className="w-8 h-8" />
        <p className="text-sm">AI model idle</p>
      </div>
    );
  }

  if (prediction.buffering) {
    return (
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-dark-300">
          <Brain className="w-4 h-4" />
          AI Prediction
        </div>
        <div className="flex items-center gap-3">
          <Clock className="w-10 h-10 text-blue-400" />
          <div>
            <div className="text-lg font-bold text-blue-400">Buffering</div>
            <div className="text-xs text-dark-400">
              Collecting sensor data... {prediction.progress || "0/10"}
            </div>
          </div>
        </div>
        <div className="w-full bg-dark-800 rounded-full h-2">
          <div className="h-2 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${(parseInt(prediction.progress?.split("/")[0] || "0") / 10) * 100}%` }} />
        </div>
      </div>
    );
  }

  const cfg = statusConfig[prediction.predicted_label] || {
    icon: HelpCircle,
    color: "text-dark-400",
    bg: "bg-dark-800",
  };
  const Icon = cfg.icon;
  const pct = (prediction.confidence * 100).toFixed(1);

  return (
    <div
      className={`${cfg.bg} border border-dark-700 rounded-xl p-5 flex flex-col gap-3`}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-dark-300">
        <Brain className="w-4 h-4" />
        AI Prediction
      </div>
      <div className="flex items-center gap-3">
        <Icon className={`w-10 h-10 ${cfg.color}`} />
        <div>
          <div className={`text-2xl font-bold ${cfg.color}`}>
            {prediction.predicted_label}
          </div>
          <div className="text-xs text-dark-400">
            Confidence {pct}%
          </div>
        </div>
      </div>
      <div className="w-full bg-dark-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            prediction.predicted_label === "Failure"
              ? "bg-red-500"
              : prediction.predicted_label === "Warning"
              ? "bg-yellow-500"
              : "bg-emerald-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
