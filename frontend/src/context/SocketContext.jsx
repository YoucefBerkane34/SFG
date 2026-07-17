import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [toasts, setToasts] = useState([]);
  const historyRef = useRef([]);
  const dataTimeoutRef = useRef(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const s = io(backendUrl, { transports: ["polling"] });

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    s.on("simulation_status", (data) => {
      setSimulating(data.status === "started");
      if (data.status === "stopped") {
        if (dataTimeoutRef.current) clearTimeout(dataTimeoutRef.current);
      }
    });

    s.on("sensor_update", (data) => {
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
        machine_id: data.machine_id,
      };
      historyRef.current = [...historyRef.current.slice(-199), entry];
      setHistory([...historyRef.current]);

      if (data.alert) {
        const alertWithContext = {
          ...data.alert,
          sensors: data.sensors,
          prediction: data.prediction,
          machine_id: data.machine_id,
          timestamp: data.timestamp,
        };
        setAlerts((prev) => [alertWithContext, ...prev].slice(0, 100));
        setLatestAlert(alertWithContext);
        addToast({
          type: "error",
          title: "Failure Detected",
          message: data.alert.message,
        });

        if (Notification.permission === "granted") {
          new Notification("SmartFactory Guardian", {
            body: data.alert.message,
            icon: "/favicon.ico",
          });
        }
      }
    });

    setSocket(s);
    return () => s.close();
  }, []);

  const startSimulation = (machineId = "M001") => {
    if (!socket) return;
    socket.emit("start_simulation", { machine_id: machineId });
    setSimulating(true);
    dataTimeoutRef.current = setTimeout(() => setSimulating(false), 5000);
  };

  const stopSimulation = () => {
    if (!socket) return;
    socket.emit("stop_simulation");
    setSimulating(false);
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || "";
      await fetch(`${backendUrl}/api/alerts/${alertId}/acknowledge`, { method: "PATCH" });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
      );
    } catch (e) {
      console.error("Failed to acknowledge alert:", e);
    }
  };

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        simulating,
        currentData,
        prediction,
        history,
        alerts,
        latestAlert,
        toasts,
        startSimulation,
        stopSimulation,
        acknowledgeAlert,
        addToast,
        removeToast,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
