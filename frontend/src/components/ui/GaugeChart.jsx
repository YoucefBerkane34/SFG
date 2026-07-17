import { motion } from "framer-motion";

export default function GaugeChart({
  value = 0,
  max = 100,
  size = 140,
  strokeWidth = 12,
  color = "#3B82F6",
  label = "",
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const percentage = Math.min(value / max, 1);
  const offset = circumference - percentage * circumference;

  const getColor = () => {
    if (percentage > 0.8) return "#EF4444";
    if (percentage > 0.6) return "#F59E0B";
    return color;
  };

  const activeColor = getColor();

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size, height: size * 0.6 }}>
      <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
        <path
          d={`M ${strokeWidth / 2} ${size * 0.6 - strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size * 0.6 - strokeWidth / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <motion.path
          d={`M ${strokeWidth / 2} ${size * 0.6 - strokeWidth / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size * 0.6 - strokeWidth / 2}`}
          fill="none"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 8px ${activeColor}50)` }}
        />
      </svg>
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-lg font-bold text-white" style={{ color: activeColor }}>
          {Math.round(value)}
        </span>
        {label && <span className="text-[10px] text-white/40">{label}</span>}
      </div>
    </div>
  );
}
