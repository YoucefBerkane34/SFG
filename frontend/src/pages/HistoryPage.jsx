import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ArrowUpDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";

const labelColors = {
  Normal: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15",
  Warning: "text-amber-400 bg-amber-500/10 border-amber-500/15",
  Failure: "text-danger-400 bg-danger-500/10 border-danger-500/15",
};

export default function HistoryPage({ history }) {
  const [sortDir, setSortDir] = useState("desc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 20;

  const filtered = useMemo(() => {
    let data = [...history].reverse();
    if (search) {
      data = data.filter(
        (h) =>
          h.predicted_label?.toLowerCase().includes(search.toLowerCase()) ||
          h.machine_id?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sortDir === "asc") data.reverse();
    return data;
  }, [history, sortDir, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-lg md:text-xl font-display font-bold text-white">Prediction History</h1>
        <p className="text-[10px] md:text-xs text-white/40 mt-1">Complete log of AI predictions</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="glass-input flex items-center gap-2 flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search predictions..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30"
          />
        </div>
        <button
          onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
          className="btn-ghost flex items-center gap-1.5 text-xs"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {sortDir === "desc" ? "Newest" : "Oldest"}
        </button>
        <span className="text-[10px] text-white/30">{filtered.length} total</span>
      </div>

      <GlassCard className="overflow-hidden" hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["#", "Time", "Machine", "Prediction", "Confidence"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] text-white/40 uppercase tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center">
                      <History className="w-8 h-8 text-white/10 mx-auto mb-2" />
                      <p className="text-xs text-white/25">No prediction history</p>
                    </td>
                  </tr>
                ) : (
                  paged.map((h, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.5) }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3 text-[11px] text-white/25 font-mono">
                        {page * perPage + i + 1}
                      </td>
                      <td className="px-5 py-3 text-[11px] text-white/50 font-mono tabular-nums">
                        {h.time ? new Date(h.time).toLocaleString() : ""}
                      </td>
                      <td className="px-5 py-3 text-[11px] text-white/60">
                        {h.machine_id || "M001"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${labelColors[h.predicted_label] || labelColors.Normal}`}>
                          {h.predicted_label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[11px] text-white/50 tabular-nums font-mono">
                        {(h.confidence * 100).toFixed(1)}%
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <span className="text-[10px] text-white/30">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
