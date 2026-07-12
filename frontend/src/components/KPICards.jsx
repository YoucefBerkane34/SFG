import { Thermometer, Gauge, Wind, Zap, Activity } from "lucide-react";

const sensors = [
  { key: "temperature", label: "Temperature", unit: "°C", icon: Thermometer, color: "text-red-400" },
  { key: "pressure", label: "Pressure", unit: "kPa", icon: Gauge, color: "text-blue-400" },
  { key: "vibration_level", label: "Vibration", unit: "mm/s", icon: Activity, color: "text-yellow-400" },
  { key: "humidity", label: "Humidity", unit: "%", icon: Wind, color: "text-cyan-400" },
  { key: "power_consumption", label: "Power", unit: "kW", icon: Zap, color: "text-purple-400" },
];

export default function KPICards({ data }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {sensors.map((s) => {
        const val = data?.[s.key];
        const Icon = s.icon;
        return (
          <div
            key={s.key}
            className="bg-dark-900 border border-dark-700 rounded-xl p-4 flex flex-col gap-1"
          >
            <div className="flex items-center gap-2 text-dark-400 text-xs uppercase tracking-wider">
              <Icon className={`w-4 h-4 ${s.color}`} />
              {s.label}
            </div>
            <div className="text-2xl font-bold text-white">
              {val !== undefined && val !== null
                ? `${Number(val).toFixed(1)}`
                : "---"}
              <span className="text-xs text-dark-400 ml-1">{s.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
