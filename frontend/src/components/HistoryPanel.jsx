import { History, RefreshCw } from "lucide-react";

export default function HistoryPanel({ history = [] }) {
  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <History className="w-4 h-4" />
        Recent Predictions
        <RefreshCw className="w-3 h-3 text-dark-400 ml-auto animate-pulse" />
      </div>
      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
        {history.length === 0 && (
          <p className="text-dark-400 text-xs text-center py-4">
            No predictions yet
          </p>
        )}
        {[...history].reverse().slice(0, 20).map((h, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-xs py-1.5 px-2 rounded hover:bg-dark-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  h.predicted_label === "Failure"
                    ? "bg-red-500"
                    : h.predicted_label === "Warning"
                    ? "bg-yellow-500"
                    : "bg-emerald-500"
                }`}
              />
              <span className="text-dark-200">{h.predicted_label}</span>
            </div>
            <div className="flex items-center gap-3 text-dark-400">
              <span>{(h.confidence * 100).toFixed(0)}%</span>
              <span>{h.time?.slice(11, 19) || ""}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
