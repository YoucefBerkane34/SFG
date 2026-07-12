import { useState } from "react";
import { Bell, AlertTriangle, Info, XCircle, Check, ExternalLink } from "lucide-react";

const severityIcon = {
  critical: { icon: XCircle, color: "text-red-400" },
  warning: { icon: AlertTriangle, color: "text-yellow-400" },
  info: { icon: Info, color: "text-blue-400" },
};

export default function AlertsPanel({ alerts = [], onViewDetail }) {
  const [localAlerts, setLocalAlerts] = useState(alerts);

  const effectiveAlerts = alerts.length > 0 ? alerts : localAlerts;

  const acknowledge = (id) => {
    fetch(`/api/alerts/${id}/acknowledge`, { method: "PATCH" });
    setLocalAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Bell className="w-4 h-4" />
        Alerts
        {effectiveAlerts.filter((a) => !a.acknowledged).length > 0 && (
          <span className="ml-auto text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
            {effectiveAlerts.filter((a) => !a.acknowledged).length}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
        {effectiveAlerts.length === 0 && (
          <p className="text-dark-400 text-xs text-center py-4">No alerts</p>
        )}
        {effectiveAlerts.map((alert) => {
          const cfg = severityIcon[alert.severity] || severityIcon.info;
          const Icon = cfg.icon;
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                alert.acknowledged ? "opacity-40" : "bg-dark-800"
              }`}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{alert.message}</p>
                <p className="text-dark-500 mt-0.5">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {!alert.acknowledged && (
                  <button
                    onClick={() => acknowledge(alert.id)}
                    className="text-dark-400 hover:text-emerald-400"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onViewDetail?.(alert)}
                  className="text-dark-400 hover:text-blue-400"
                  title="View details"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
