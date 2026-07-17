import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, AlertCircle, Loader2, Cpu } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const { login, loginError, setLoginError } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError("Please enter both username and password");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login(username.trim(), password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center relative overflow-hidden">
      <div className="animated-grid fixed inset-0 pointer-events-none opacity-30" />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(6,182,212,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(139,92,246,0.04) 0%, transparent 40%)",
        }}
      />

      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-electric-500/10 animate-particle-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${Math.random() * 8 + 6}s`,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-navy-800/60 backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-premium p-8">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric-500 to-cyan-500 flex items-center justify-center mb-5 shadow-glow-blue"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-display font-bold text-white"
            >
              SmartFactory Guardian
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-white/40 mt-1"
            >
              Industrial AI Platform — Sign in to continue
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="text-[11px] text-white/50 uppercase tracking-wider font-medium mb-1.5 block">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setLoginError(""); }}
                placeholder="Enter your username"
                autoFocus
                className="w-full bg-navy-800/80 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/20 transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] text-white/50 uppercase tracking-wider font-medium mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(""); }}
                  placeholder="Enter your password"
                  className="w-full bg-navy-800/80 border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-electric-500/50 focus:ring-1 focus:ring-electric-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20"
              >
                <AlertCircle className="w-4 h-4 text-danger-400 shrink-0" />
                <span className="text-xs text-danger-400">{loginError}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-electric-500 to-blue-600 text-white font-semibold text-sm transition-all duration-300 hover:shadow-glow-blue disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          >
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5 text-electric-400" />
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Demo Credentials</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/30">Username</span>
                <span className="text-white/60 font-mono">admin</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/30">Password</span>
                <span className="text-white/60 font-mono">admin123</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-[10px] text-white/20 mt-6"
        >
          SmartFactory Guardian v2.0 — Industrial AI Platform
        </motion.p>
      </motion.div>
    </div>
  );
}
