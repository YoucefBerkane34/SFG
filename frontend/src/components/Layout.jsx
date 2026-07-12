import { Cpu, Activity, Bell, BarChart3, History } from "lucide-react";

const navItems = [
  { icon: Activity, label: "Overview", key: "overview" },
  { icon: BarChart3, label: "Analytics", key: "analytics" },
  { icon: Bell, label: "Alerts", key: "alerts" },
  { icon: History, label: "History", key: "history" },
];

export default function Layout({ children, activeTab, onTabChange }) {
  return (
    <div className="min-h-screen bg-dark-950 flex">
      <aside className="w-16 lg:w-56 bg-dark-900 border-r border-dark-700 flex flex-col items-center lg:items-start px-2 py-4 gap-1">
        <div className="flex items-center gap-2 px-3 mb-6 w-full">
          <Cpu className="w-6 h-6 text-emerald-400 shrink-0" />
          <span className="hidden lg:block text-sm font-bold text-emerald-400 truncate">
            SmartFactory
          </span>
        </div>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onTabChange?.(item.key)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-sm transition-colors ${
              activeTab === item.key
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-dark-300 hover:text-white hover:bg-dark-800"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block">{item.label}</span>
          </button>
        ))}
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
