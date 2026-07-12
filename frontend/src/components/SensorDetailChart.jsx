import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const sensorMeta = {
  temperature:       { label: "Temperature",     unit: "°C", color: "#ef4444" },
  pressure:          { label: "Pressure",        unit: "kPa", color: "#3b82f6" },
  vibration_level:   { label: "Vibration Level", unit: "mm/s", color: "#eab308" },
  humidity:          { label: "Humidity",        unit: "%",   color: "#06b6d4" },
  power_consumption: { label: "Power Consumption", unit: "kW", color: "#a855f7" },
};

export default function SensorDetailChart({ sensor, data = [] }) {
  const meta = sensorMeta[sensor];
  if (!meta) return null;

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-2">
        {meta.label} ({meta.unit})
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data.slice(-60)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#999", fontSize: 10 }}
            tickFormatter={(v) => v?.slice(11, 19) || ""}
          />
          <YAxis tick={{ fill: "#999", fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey={sensor}
            stroke={meta.color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
