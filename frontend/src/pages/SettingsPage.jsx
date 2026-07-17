import { useState, useEffect, useCallback } from "react";
import {
  Settings as SettingsIcon,
  Palette,
  Bell,
  Server,
  User,
  Check,
  RotateCcw,
} from "lucide-react";
import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import { useApp } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";

const DEFAULTS = {
  theme: "Dark",
  accentColor: "#3B82F6",
  compactMode: false,
  animatedBackground: true,
  desktopNotifications: true,
  soundAlerts: true,
  emailNotifications: false,
  criticalOnly: false,
  autoReconnect: true,
  dataRetention: 30,
  userName: "Admin",
  userFactory: "Factory 1 — Main Plant",
};

function loadSettings() {
  try {
    const saved = localStorage.getItem("sg-settings");
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(settings) {
  localStorage.setItem("sg-settings", JSON.stringify(settings));
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "59, 130, 246";
}

function applySettings(settings) {
  const root = document.documentElement;

  if (settings.compactMode) {
    root.classList.add("compact-mode");
  } else {
    root.classList.remove("compact-mode");
  }
  if (!settings.animatedBackground) {
    root.classList.add("no-anim-bg");
  } else {
    root.classList.remove("no-anim-bg");
  }

  root.classList.remove("theme-dark", "theme-midnight", "theme-deep-navy");
  const themeMap = { "Dark": "theme-dark", "Midnight": "theme-midnight", "Deep Navy": "theme-deep-navy" };
  root.classList.add(themeMap[settings.theme] || "theme-dark");

  if (settings.accentColor) {
    const rgb = hexToRgb(settings.accentColor);
    const lighter = lightenHex(settings.accentColor, 30);
    const darker = darkenHex(settings.accentColor, 20);
    root.style.setProperty("--accent", settings.accentColor);
    root.style.setProperty("--accent-rgb", rgb);
    root.style.setProperty("--accent-light", lighter);
    root.style.setProperty("--accent-dark", darker);
  }
}

function lightenHex(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(2.55 * percent));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * percent));
  const b = Math.min(255, (num & 0xff) + Math.round(2.55 * percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function darkenHex(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.round(2.55 * percent));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(2.55 * percent));
  const b = Math.max(0, (num & 0xff) - Math.round(2.55 * percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function Toggle({ value, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`relative w-10 h-[22px] rounded-full transition-all duration-200 shrink-0 ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      } ${value ? "bg-electric-500/40" : "bg-white/[0.08]"}`}
    >
      <motion.div
        className="absolute top-[3px] w-4 h-4 rounded-full"
        animate={{
          left: value ? "22px" : "3px",
          backgroundColor: value ? "#60A5FA" : "rgba(255,255,255,0.35)",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ boxShadow: value ? "0 0 8px rgba(96,165,250,0.5)" : "none" }}
      />
    </button>
  );
}

function ColorPicker({ value, onChange }) {
  const colors = ["#3B82F6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
  return (
    <div className="flex items-center gap-1.5">
      {colors.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`w-5 h-5 rounded-full transition-all ${
            value === c ? "ring-2 ring-offset-2 ring-offset-navy-800 scale-110" : "hover:scale-110"
          }`}
          style={{ backgroundColor: c, ringColor: c }}
        />
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const { setFactory } = useApp();
  const { addToast } = useSocket();

  useEffect(() => {
    applySettings(settings);
  }, []);

  const update = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      applySettings(next);
      return next;
    });
    setSaved(false);
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    applySettings(settings);
    setFactory(settings.userFactory);
    setSaved(true);
    addToast({ type: "success", title: "Settings Saved", message: "Your preferences have been updated." });
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (confirmReset) {
      setSettings({ ...DEFAULTS });
      saveSettings(DEFAULTS);
      applySettings(DEFAULTS);
      setConfirmReset(false);
      addToast({ type: "info", title: "Settings Reset", message: "All settings restored to defaults." });
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  };

  const sections = [
    {
      title: "Appearance",
      icon: Palette,
      items: [
        {
          key: "theme",
          label: "Theme",
          sublabel: "Choose your preferred color scheme",
          type: "select",
          options: ["Dark", "Midnight", "Deep Navy"],
        },
        {
          key: "accentColor",
          label: "Accent Color",
          sublabel: "Primary color used across the interface",
          type: "color",
        },
        {
          key: "compactMode",
          label: "Compact Mode",
          sublabel: "Reduce spacing for more content density",
          type: "toggle",
        },
        {
          key: "animatedBackground",
          label: "Animated Background",
          sublabel: "Show floating grid and particle effects",
          type: "toggle",
        },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          key: "desktopNotifications",
          label: "Desktop Notifications",
          sublabel: "Show browser notifications for alerts",
          type: "toggle",
        },
        {
          key: "soundAlerts",
          label: "Sound Alerts",
          sublabel: "Play a sound for critical alerts",
          type: "toggle",
        },
        {
          key: "emailNotifications",
          label: "Email Notifications",
          sublabel: "Send alert summaries via email",
          type: "toggle",
        },
        {
          key: "criticalOnly",
          label: "Critical Only",
          sublabel: "Only notify for critical severity alerts",
          type: "toggle",
        },
      ],
    },
    {
      title: "System",
      icon: Server,
      items: [
        {
          key: "autoReconnect",
          label: "Auto-reconnect",
          sublabel: "Automatically reconnect when connection drops",
          type: "toggle",
        },
        {
          key: "dataRetention",
          label: "Data Retention (days)",
          sublabel: "How long to keep historical data",
          type: "number",
        },
      ],
    },
    {
      title: "User Profile",
      icon: User,
      items: [
        {
          key: "userName",
          label: "Display Name",
          sublabel: "Your name shown in the interface",
          type: "text",
        },
        {
          key: "userFactory",
          label: "Factory",
          sublabel: "Currently selected factory plant",
          type: "text",
        },
      ],
    },
  ];

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-display font-bold text-white">Settings</h1>
          <p className="text-[10px] md:text-xs text-white/40 mt-1">Configure your platform preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-white/[0.06] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {confirmReset ? "Confirm Reset?" : "Reset"}
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2 text-xs"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <SettingsIcon className="w-3.5 h-3.5" />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {sections.map((section, si) => {
          const Icon = section.icon;
          return (
            <GlassCard key={si} className="p-5" delay={si * 0.05} hover={false}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-electric-500/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-electric-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">{section.title}</h3>
              </div>
              <div className="space-y-4">
                {section.items.map((item) => {
                  const value = settings[item.key];
                  return (
                    <div key={item.key} className="flex items-center justify-between gap-3 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white/70 font-medium">{item.label}</div>
                        {item.sublabel && (
                          <div className="text-[9px] md:text-[10px] text-white/30 mt-0.5">{item.sublabel}</div>
                        )}
                      </div>
                      {item.type === "toggle" ? (
                        <Toggle value={value} onChange={(v) => update(item.key, v)} />
                      ) : item.type === "color" ? (
                        <ColorPicker value={value} onChange={(v) => update(item.key, v)} />
                      ) : item.type === "select" ? (
                        <select
                          value={value}
                          onChange={(e) => update(item.key, e.target.value)}
                          className="glass-input text-xs py-1.5 px-3 w-36 appearance-none cursor-pointer"
                        >
                          {item.options.map((o) => (
                            <option key={o} value={o} className="bg-navy-800 text-white">{o}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={item.type === "number" ? "number" : "text"}
                          value={value}
                          onChange={(e) => update(item.key, item.type === "number" ? Number(e.target.value) : e.target.value)}
                          className="glass-input text-xs py-1.5 px-3 w-44"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-card border border-emerald-500/20 px-5 py-3 shadow-glow-emerald flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Settings saved successfully</span>
        </motion.div>
      )}
    </div>
  );
}
