import { AlertTriangle, Thermometer, Gauge, Activity, Wind, Zap, Brain } from "lucide-react";

const sensorIcons = {
  temperature: { icon: Thermometer, label: "Temperature", unit: "°C", color: "text-red-400", threshold: 90 },
  pressure: { icon: Gauge, label: "Pressure", unit: "kPa", color: "text-blue-400", threshold: 150 },
  vibration_level: { icon: Activity, label: "Vibration", unit: "mm/s", color: "text-yellow-400", threshold: 6 },
  humidity: { icon: Wind, label: "Humidity", unit: "%", color: "text-cyan-400", threshold: 85 },
  power_consumption: { icon: Zap, label: "Power", unit: "kW", color: "text-purple-400", threshold: 130 },
};

export default function AlertDetail({ alert }) {
  if (!alert) {
    return (
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 text-center text-dark-400 text-sm">
        No alert selected
      </div>
    );
  }

  const failureSensors = alert.sensors
    ? Object.entries(sensorIcons)
        .filter(([key, cfg]) => {
          const val = alert.sensors[key];
          return val !== undefined && val !== null && Number(val) > cfg.threshold;
        })
        .map(([key]) => key)
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-center gap-4">
        <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
        <div>
          <h2 className="text-lg font-bold text-red-400">{alert.message || "Failure Alert"}</h2>
          <p className="text-xs text-dark-400 mt-1">
            Machine: {alert.machine_id} &middot;{" "}
            {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : ""}
          </p>
          <span className="inline-block mt-2 text-xs uppercase font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
            {alert.severity}
          </span>
        </div>
      </div>

      {alert.prediction && (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-dark-300 mb-3">
            <Brain className="w-4 h-4" />
            AI Prediction at Time of Alert
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-2xl font-bold ${
              alert.prediction.predicted_label === "Failure" ? "text-red-400" : "text-yellow-400"
            }`}>
              {alert.prediction.predicted_label}
            </div>
            <div className="text-xs text-dark-400">
              Confidence: {(alert.prediction.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {alert.sensors && (
        <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Sensor Readings at Failure</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(sensorIcons).map(([key, cfg]) => {
              const val = alert.sensors[key];
              const Icon = cfg.icon;
              const isFault = val !== undefined && val !== null && Number(val) > cfg.threshold;
              return (
                <div key={key} className={`rounded-lg p-3 flex items-center gap-3 ${
                  isFault ? "bg-red-500/15 ring-1 ring-red-500/40" : "bg-dark-800"
                }`}>
                  <Icon className={`w-5 h-5 shrink-0 ${isFault ? "text-red-400" : cfg.color}`} />
                  <div>
                    <div className="text-xs text-dark-400">{cfg.label}</div>
                    <div className={`text-lg font-bold ${isFault ? "text-red-400" : "text-white"}`}>
                      {val !== undefined && val !== null ? Number(val).toFixed(1) : "---"}
                      <span className="text-xs text-dark-400 ml-1">{cfg.unit}</span>
                    </div>
                    {isFault && (
                      <span className="text-[10px] text-red-400 font-medium">OVER LIMIT</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
