import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { useSocket } from "../../context/SocketContext";

const iconMap = {
  error: XCircle,
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
};

const colorMap = {
  error: "border-danger-500/30 bg-danger-500/5",
  warning: "border-amber-500/30 bg-amber-500/5",
  success: "border-emerald-500/30 bg-emerald-500/5",
  info: "border-electric-500/30 bg-electric-500/5",
};

const textColorMap = {
  error: "text-danger-400",
  warning: "text-amber-400",
  success: "text-emerald-400",
  info: "text-electric-400",
};

export default function ToastContainer() {
  const { toasts, removeToast } = useSocket();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Info;
          return (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto glass-card border ${colorMap[toast.type] || colorMap.info} p-4 min-w-[300px] max-w-[400px] shadow-premium`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${textColorMap[toast.type] || textColorMap.info}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{toast.title}</p>
                  <p className="text-xs text-white/50 mt-0.5">{toast.message}</p>
                </div>
                <button onClick={() => removeToast(toast.id)} className="text-white/30 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
