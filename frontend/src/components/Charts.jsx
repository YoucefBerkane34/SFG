import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const colors = ["#ef4444", "#3b82f6", "#eab308", "#06b6d4", "#a855f7"];
const fields = [
  { key: "temperature", color: colors[0] },
  { key: "pressure", color: colors[1] },
  { key: "vibration_level", color: colors[2] },
  { key: "humidity", color: colors[3] },
  { key: "power_consumption", color: colors[4] },
];

export default function Charts({ history = [] }) {
  const data = history.slice(-30);

  if (data.length === 0) {
    return (
      <div className="bg-dark-900 border border-dark-700 rounded-xl p-6 flex items-center justify-center text-dark-400 text-sm">
        Waiting for sensor data...
      </div>
    );
  }

  return (
    <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3">
        Real-time Sensor Trends
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
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
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {fields.map((f) => (
            <Line
              key={f.key}
              type="monotone"
              dataKey={f.key}
              stroke={f.color}
              strokeWidth={2}
              dot={false}
              name={f.key.replace("_", " ")}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
