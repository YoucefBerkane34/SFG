import { useState, useMemo, useCallback, useRef } from "react";
import { FileText, Download, Printer, Search, ChevronLeft, ChevronRight } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatNum(v, d = 1) {
  return Number(v || 0).toFixed(d);
}

export default function ReportsPage({ history, alerts, stats }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [printRange, setPrintRange] = useState("all");
  const printRef = useRef(null);
  const perPage = 15;

  const filtered = useMemo(() => {
    let data = [...history].reverse();
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (h) =>
          h.predicted_label?.toLowerCase().includes(q) ||
          h.machine_id?.toLowerCase().includes(q) ||
          String(h.temperature).includes(q) ||
          String(h.pressure).includes(q)
      );
    }
    return data;
  }, [history, search]);

  const printData = useMemo(() => {
    if (printRange === "all") return filtered;
    if (printRange === "50") return filtered.slice(0, 50);
    if (printRange === "20") return filtered.slice(0, 20);
    return filtered.slice(0, 10);
  }, [filtered, printRange]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);

  const normalCount = history.filter((h) => h.predicted_label === "Normal").length;
  const warningCount = history.filter((h) => h.predicted_label === "Warning").length;
  const failureCount = history.filter((h) => h.predicted_label === "Failure").length;

  const handleExportCSV = useCallback(() => {
    const BOM = "\uFEFF";
    const headers = [
      "No.",
      "Timestamp",
      "Machine ID",
      "Prediction",
      "Confidence (%)",
      "Temperature (°C)",
      "Pressure (kPa)",
      "Vibration (mm/s)",
      "Humidity (%)",
      "Power (kW)",
    ];

    const escapeCSV = (val) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = filtered.map((h, i) => [
      i + 1,
      h.time || "",
      h.machine_id || "M001",
      h.predicted_label || "",
      formatNum(h.confidence * 100, 1),
      formatNum(h.temperature),
      formatNum(h.pressure),
      formatNum(h.vibration_level),
      formatNum(h.humidity),
      formatNum(h.power_consumption),
    ]);

    const summary = [
      "",
      "SUMMARY",
      `Total Records,${filtered.length}`,
      `Normal,${normalCount}`,
      `Warning,${warningCount}`,
      `Failure,${failureCount}`,
      `Generated,${new Date().toISOString()}`,
    ];

    const csv =
      BOM +
      headers.map(escapeCSV).join(",") +
      "\n" +
      rows.map((r) => r.map(escapeCSV).join(",")).join("\n") +
      "\n" +
      summary.join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SmartFactory-Guardian-Report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filtered, normalCount, warningCount, failureCount]);

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) return;

    const tableRows = printData
      .map(
        (h, i) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;">${i + 1}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">${formatDate(h.time)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;font-weight:600;">${h.machine_id || "M001"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;">
            <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;${
              h.predicted_label === "Normal"
                ? "background:#ecfdf5;color:#059669;"
                : h.predicted_label === "Warning"
                ? "background:#fffbeb;color:#d97706;"
                : "background:#fef2f2;color:#dc2626;"
            }">${h.predicted_label}</span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;">${formatNum(h.confidence * 100)}%</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;">${formatNum(h.temperature)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;">${formatNum(h.pressure)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;">${formatNum(h.vibration_level)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;">${formatNum(h.humidity)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;">${formatNum(h.power_consumption)}</td>
        </tr>`
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SmartFactory Guardian — Report</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; color: #111827; background: #fff; padding: 40px; }
          @media print {
            body { padding: 20px; }
            @page { margin: 15mm; size: landscape; }
          }
        </style>
      </head>
      <body>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #e5e7eb;">
          <div>
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#3b82f6,#06b6d4);border-radius:10px;display:flex;align-items:center;justify-content:center;">
                <span style="color:white;font-size:18px;font-weight:700;">SF</span>
              </div>
              <div>
                <h1 style="font-size:22px;font-weight:700;color:#0B1220;letter-spacing:-0.02em;">SmartFactory Guardian</h1>
                <p style="font-size:12px;color:#6b7280;margin-top:2px;">Industrial AI Platform — Predictive Maintenance Report</p>
              </div>
            </div>
          </div>
          <div style="text-align:right;">
            <p style="font-size:11px;color:#9ca3af;">Report Generated</p>
            <p style="font-size:13px;font-weight:600;color:#111827;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            <p style="font-size:11px;color:#9ca3af;margin-top:2px;">${new Date().toLocaleTimeString("en-US", { hour12: false })}</p>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:32px;">
          <div style="padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;">
            <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Total Records</p>
            <p style="font-size:28px;font-weight:700;color:#0B1220;margin-top:4px;">${filtered.length}</p>
          </div>
          <div style="padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;">
            <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Normal</p>
            <p style="font-size:28px;font-weight:700;color:#059669;margin-top:4px;">${normalCount}</p>
            <p style="font-size:11px;color:#9ca3af;">${filtered.length ? ((normalCount / filtered.length) * 100).toFixed(1) : 0}%</p>
          </div>
          <div style="padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;">
            <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Warnings</p>
            <p style="font-size:28px;font-weight:700;color:#d97706;margin-top:4px;">${warningCount}</p>
            <p style="font-size:11px;color:#9ca3af;">${filtered.length ? ((warningCount / filtered.length) * 100).toFixed(1) : 0}%</p>
          </div>
          <div style="padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;">
            <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Failures</p>
            <p style="font-size:28px;font-weight:700;color:#dc2626;margin-top:4px;">${failureCount}</p>
            <p style="font-size:11px;color:#9ca3af;">${filtered.length ? ((failureCount / filtered.length) * 100).toFixed(1) : 0}%</p>
          </div>
          <div style="padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e5e7eb;">
            <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Alerts</p>
            <p style="font-size:28px;font-weight:700;color:#7c3aed;margin-top:4px;">${alerts.length}</p>
          </div>
        </div>

        <h2 style="font-size:16px;font-weight:700;color:#111827;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #e5e7eb;">
          Prediction History
          <span style="font-size:12px;font-weight:400;color:#9ca3af;margin-left:8px;">${printData.length} records</span>
        </h2>

        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #e5e7eb;">
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">#</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Timestamp</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Machine</th>
              <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Prediction</th>
              <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Confidence</th>
              <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Temp (°C)</th>
              <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Pressure (kPa)</th>
              <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Vibration (mm/s)</th>
              <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Humidity (%)</th>
              <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Power (kW)</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
          <p style="font-size:11px;color:#9ca3af;">SmartFactory Guardian v2.0 — Industrial AI Platform</p>
          <p style="font-size:11px;color:#9ca3af;">Page 1 of 1 · Generated ${new Date().toISOString()}</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }, [printData, filtered, normalCount, warningCount, failureCount, alerts.length]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white">Reports</h1>
          <p className="text-xs text-white/40 mt-1">Export and review historical data</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={printRange}
            onChange={(e) => setPrintRange(e.target.value)}
            className="glass-input text-[11px] py-1.5 px-3 appearance-none cursor-pointer"
          >
            <option value="10">Last 10</option>
            <option value="20">Last 20</option>
            <option value="50">Last 50</option>
            <option value="all">All Records</option>
          </select>
          <button onClick={handleExportCSV} className="btn-primary flex items-center gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={handlePrint} className="btn-ghost flex items-center gap-2 text-xs border border-white/[0.08]">
            <Printer className="w-3.5 h-3.5" /> Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Records", value: history.length, color: "#3B82F6" },
          { label: "Normal", value: normalCount, color: "#10B981" },
          { label: "Warnings", value: warningCount, color: "#F59E0B" },
          { label: "Failures", value: failureCount, color: "#EF4444" },
          { label: "Alerts", value: alerts.length, color: "#8B5CF6" },
        ].map((s, i) => (
          <GlassCard key={i} className="p-4" delay={i * 0.05}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="text-2xl font-display font-bold text-white">{s.value}</div>
          </GlassCard>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="glass-input flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Filter by prediction, machine, sensor value..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30"
          />
        </div>
        <span className="text-[10px] text-white/30">{filtered.length} records</span>
      </div>

      <GlassCard className="overflow-hidden" hover={false}>
        <div className="overflow-x-auto" ref={printRef}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {["#", "Timestamp", "Machine", "Prediction", "Confidence", "Temp", "Pressure", "Vibration", "Humidity", "Power"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] text-white/40 uppercase tracking-wider font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center">
                    <FileText className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    <p className="text-xs text-white/25">No data available</p>
                  </td>
                </tr>
              ) : (
                paged.map((h, i) => (
                  <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 text-[10px] text-white/25 font-mono">{page * perPage + i + 1}</td>
                    <td className="px-4 py-2.5 text-[10px] text-white/50 font-mono whitespace-nowrap">
                      {formatDate(h.time)}
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-white/60 font-medium">{h.machine_id || "M001"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold border ${
                        h.predicted_label === "Normal"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/15"
                          : h.predicted_label === "Warning"
                          ? "text-amber-400 bg-amber-500/10 border-amber-500/15"
                          : "text-danger-400 bg-danger-500/10 border-danger-500/15"
                      }`}>
                        {h.predicted_label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-white/50 font-mono text-right">{formatNum(h.confidence * 100)}%</td>
                    <td className="px-4 py-2.5 text-[10px] text-white/50 font-mono text-right">{formatNum(h.temperature)}</td>
                    <td className="px-4 py-2.5 text-[10px] text-white/50 font-mono text-right">{formatNum(h.pressure)}</td>
                    <td className="px-4 py-2.5 text-[10px] text-white/50 font-mono text-right">{formatNum(h.vibration_level)}</td>
                    <td className="px-4 py-2.5 text-[10px] text-white/50 font-mono text-right">{formatNum(h.humidity)}</td>
                    <td className="px-4 py-2.5 text-[10px] text-white/50 font-mono text-right">{formatNum(h.power_consumption)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <span className="text-[10px] text-white/30">Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-white/30 px-2 tabular-nums font-mono">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] disabled:opacity-30 transition-all"
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
