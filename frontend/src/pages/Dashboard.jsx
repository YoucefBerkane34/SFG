import { useState, useEffect, useRef } from "react";
import { Play, Square, ArrowLeft } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import Layout from "../components/Layout";
import NetworkStatus from "../components/NetworkStatus";
import KPICards from "../components/KPICards";
import Charts from "../components/Charts";
import AIPanel from "../components/AIPanel";
import AlertsPanel from "../components/AlertsPanel";
import HistoryPanel from "../components/HistoryPanel";
import SensorDetailChart from "../components/SensorDetailChart";
import AlertDetail from "../components/AlertDetail";

export default function Dashboard() {
  const { socket, connected } = useSocket();
  const [simulating, setSimulating] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedAlert, setSelectedAlert] = useState(null);
  const historyRef = useRef([]);
  const dataTimeoutRef = useRef(null);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onSensorUpdate = (data) => {
      if (dataTimeoutRef.current) {
        clearTimeout(dataTimeoutRef.current);
        dataTimeoutRef.current = null;
      }
      setCurrentData(data.sensors);
      setPrediction(data.prediction);

      const entry = {
        ...data.sensors,
        time: data.timestamp,
        predicted_label: data.prediction.predicted_label,
        confidence: data.prediction.confidence,
      };
      historyRef.current = [...historyRef.current.slice(-59), entry];
      setHistory([...historyRef.current]);

      if (data.alert) {
        const alertWithContext = {
          ...data.alert,
          sensors: data.sensors,
          prediction: data.prediction,
        };
        setAlerts((prev) => [alertWithContext, ...prev].slice(0, 50));
        if (Notification.permission === "granted") {
          const notif = new Notification("SmartFactory Guardian", {
            body: data.alert.message,
            icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚠️</text></svg>",
          });
          notif.onclick = () => {
            setSelectedAlert(alertWithContext);
            setActiveTab("alert-detail");
            window.focus();
          };
        }
      }
    };

    const onSimStatus = (data) => {
      setSimulating(data.status === "started");
    };

    socket.on("sensor_update", onSensorUpdate);
    socket.on("simulation_status", onSimStatus);

    return () => {
      socket.off("sensor_update", onSensorUpdate);
      socket.off("simulation_status", onSimStatus);
      if (dataTimeoutRef.current) clearTimeout(dataTimeoutRef.current);
    };
  }, [socket]);

  const toggleSimulation = () => {
    if (!socket) return;
    if (simulating) {
      socket.emit("stop_simulation");
      setSimulating(false);
    } else {
      socket.emit("start_simulation", { machine_id: "M001" });
      setSimulating(true);
      dataTimeoutRef.current = setTimeout(() => {
        setSimulating(false);
      }, 5000);
    }
  };

  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setActiveTab("alert-detail");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <div className="flex flex-col gap-4 p-4 lg:p-6">
            <h2 className="text-lg font-bold text-white">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {["temperature", "pressure", "vibration_level", "humidity", "power_consumption"].map((s) => (
                <SensorDetailChart key={s} sensor={s} data={history} />
              ))}
            </div>
          </div>
        );
      case "alerts":
        return (
          <div className="flex flex-col gap-4 p-4 lg:p-6 max-w-3xl">
            <h2 className="text-lg font-bold text-white">Alerts</h2>
            <AlertsPanel alerts={alerts} onViewDetail={handleViewAlert} />
          </div>
        );
      case "alert-detail":
        return (
          <div className="p-4 lg:p-6 max-w-3xl">
            <button
              onClick={() => setActiveTab("alerts")}
              className="flex items-center gap-1 text-sm text-dark-400 hover:text-white mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Alerts
            </button>
            <AlertDetail alert={selectedAlert} />
          </div>
        );
      case "history":
        return (
          <div className="flex flex-col gap-4 p-4 lg:p-6 max-w-3xl">
            <h2 className="text-lg font-bold text-white">Prediction History</h2>
            <HistoryPanel history={history} />
          </div>
        );
      default:
        return (
          <div className="p-4 lg:p-6 max-w-7xl mx-auto flex flex-col gap-4">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Dashboard</h1>
                <p className="text-xs text-dark-400 mt-0.5">
                  Real-time machine monitoring & AI diagnostics
                </p>
              </div>
              <div className="flex items-center gap-3">
                <NetworkStatus connected={connected} />
                <button
                  onClick={toggleSimulation}
                  disabled={!connected}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    simulating
                      ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {simulating ? (
                    <><Square className="w-4 h-4" /> Stop</>
                  ) : (
                    <><Play className="w-4 h-4" /> Start</>
                  )}
                </button>
              </div>
            </header>

            <KPICards data={currentData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Charts history={history} />
              </div>
              <div className="flex flex-col gap-4">
                <AIPanel prediction={prediction} />
                <AlertsPanel alerts={alerts} onViewDetail={handleViewAlert} />
              </div>
            </div>

            <HistoryPanel history={history} />
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
