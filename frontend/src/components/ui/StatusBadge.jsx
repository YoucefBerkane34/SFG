export default function StatusBadge({ status, size = "sm" }) {
  const config = {
    normal: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      dot: "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]",
      label: "Normal",
    },
    warning: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      dot: "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]",
      label: "Warning",
    },
    failure: {
      bg: "bg-danger-500/10",
      text: "text-danger-400",
      border: "border-danger-500/20",
      dot: "bg-danger-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]",
      label: "Failure",
    },
    online: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      dot: "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]",
      label: "Online",
    },
    offline: {
      bg: "bg-white/5",
      text: "text-white/40",
      border: "border-white/10",
      dot: "bg-white/30",
      label: "Offline",
    },
    critical: {
      bg: "bg-danger-500/10",
      text: "text-danger-400",
      border: "border-danger-500/20",
      dot: "bg-danger-400 shadow-[0_0_6px_rgba(239,68,68,0.6)] animate-status-pulse",
      label: "Critical",
    },
  };

  const c = config[status] || config.offline;
  const sizeClasses = size === "lg" ? "px-3 py-1.5 text-xs" : "px-2 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${c.bg} ${c.text} ${c.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
