import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = null,
  delay = 0,
  ...props
}) {
  const glowMap = {
    blue: "hover:shadow-glow-blue hover:border-electric-500/20",
    cyan: "hover:shadow-glow-cyan hover:border-cyan-500/20",
    emerald: "hover:shadow-glow-emerald hover:border-emerald-500/20",
    amber: "hover:shadow-glow-amber hover:border-amber-500/20",
    red: "hover:shadow-glow-red hover:border-danger-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={`glass-card ${hover && glow ? glowMap[glow] || "" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
