import {
  Shield,
  Cpu,
  Brain,
  Activity,
  Zap,
  BookOpen,
  Palette,
  Database,
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";

const faqItems = [
  {
    q: "How does the AI prediction work?",
    a: "The system uses a 1D CNN to extract 32-dimensional features from a sliding window of 10 sensor readings, then feeds them to an XGBoost classifier that predicts Normal, Warning, or Failure states.",
  },
  {
    q: "What sensors are monitored?",
    a: "Temperature (°C), Pressure (kPa), Vibration Level (mm/s), Humidity (%), and Power Consumption (kW).",
  },
  {
    q: "What are the failure thresholds?",
    a: "Temperature > 90°C, Pressure > 150 kPa, Vibration > 6 mm/s, Humidity > 85%, Power > 130 kW.",
  },
  {
    q: "How do I start monitoring?",
    a: "Click the Start button in the top navigation bar to begin the simulation. Data streams at 2-second intervals with scenario cycling (Normal → Warning → Failure → repeat).",
  },
  {
    q: "What is the buffer period?",
    a: "The AI needs 10 consecutive sensor readings to form a complete sliding window before making its first prediction. This takes approximately 20 seconds.",
  },
];

const techStack = [
  { name: "React + Vite", desc: "Frontend framework and build tool", icon: Cpu },
  { name: "Tailwind CSS", desc: "Utility-first styling", icon: Palette },
  { name: "Framer Motion", desc: "Animations and transitions", icon: Activity },
  { name: "Recharts", desc: "Data visualization", icon: Activity },
  { name: "CNN (Keras 3 + JAX)", desc: "Feature extraction", icon: Brain },
  { name: "XGBoost", desc: "Classification model", icon: Zap },
  { name: "Flask + Socket.IO", desc: "Real-time backend", icon: Shield },
  { name: "SQLAlchemy + SQLite", desc: "Data persistence", icon: Database },
];


export default function HelpPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-white">Help & Documentation</h1>
        <p className="text-xs text-white/40 mt-1">Platform guide and technical reference</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-electric-400" />
              <h3 className="text-sm font-semibold text-white">Frequently Asked Questions</h3>
            </div>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <p className="text-xs font-semibold text-white/80 mb-1.5">{item.q}</p>
                  <p className="text-[11px] text-white/40 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-5" delay={0.1} hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Tech Stack</h3>
            </div>
            <div className="space-y-3">
              {techStack.map((tech, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                    <tech.icon className="w-3.5 h-3.5 text-white/40" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/70 font-medium">{tech.name}</p>
                    <p className="text-[9px] text-white/30">{tech.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5" delay={0.15} hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">System Status</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Backend API", status: "online" },
                { label: "Socket.IO", status: "online" },
                { label: "AI Models", status: "online" },
                { label: "Database", status: "online" },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px] text-white/50">{s.label}</span>
                  <span className="status-dot-green" />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
