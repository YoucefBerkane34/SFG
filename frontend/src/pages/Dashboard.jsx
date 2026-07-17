import React, { useEffect, useRef, useMemo, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

import KPICards from "../components/dashboard/KPICards";
import SensorCharts from "../components/dashboard/SensorCharts";
import AIPredictionPanel from "../components/dashboard/AIPredictionPanel";
import AlertsWidget from "../components/dashboard/AlertsWidget";
import HistoryWidget from "../components/dashboard/HistoryWidget";
import {
  FactoryOverviewCard,
  MachineStatusPie,
  AlertDistributionChart,
  PowerConsumptionChart,
} from "../components/dashboard/OverviewWidgets";
import AlertDetail from "../components/dashboard/AlertDetail";
import MachineMonitoring from "../components/dashboard/MachineMonitoring";

import AIPredictionPage from "./AIPredictionPage";
import AlertsPage from "./AlertsPage";
import AnalyticsPage from "./AnalyticsPage";
import HistoryPage from "./HistoryPage";
import ReportsPage from "./ReportsPage";
import SettingsPage from "./SettingsPage";
import ProfilePage from "./ProfilePage";
import HelpPage from "./HelpPage";

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
};

export default function Dashboard() {
  const {
    connected,
    simulating,
    currentData,
    prediction,
    history,
    alerts,
    latestAlert,
    startSimulation,
    stopSimulation,
    acknowledgeAlert,
  } = useSocket();

  const { activePage, setActivePage } = useApp();
  const [selectedAlert, setSelectedAlert] = useState(null);

  const sensorHistory = useMemo(() => {
    const temp = [];
    const pressure = [];
    const vibration = [];
    const humidity = [];
    const power = [];
    history.forEach((h) => {
      temp.push(h.temperature);
      pressure.push(h.pressure);
      vibration.push(h.vibration_level);
      humidity.push(h.humidity);
      power.push(h.power_consumption);
    });
    return { temperature: temp, pressure, vibration_level: vibration, humidity, power_consumption: power };
  }, [history]);

  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setActivePage("alert-detail");
  };

  const renderPage = () => {
    switch (activePage) {
      case "machines":
        return (
          <MachineMonitoring
            history={history}
            prediction={prediction}
            currentData={currentData}
          />
        );
      case "prediction":
        return <AIPredictionPage prediction={prediction} history={history} />;
      case "alerts":
        return <AlertsPage alerts={alerts} onAcknowledge={acknowledgeAlert} />;
      case "alert-detail":
        return (
          <div className="p-6">
            <AlertDetail
              alert={selectedAlert}
              onBack={() => setActivePage("alerts")}
              onAcknowledge={acknowledgeAlert}
            />
          </div>
        );
      case "analytics":
        return <AnalyticsPage history={history} alerts={alerts} />;
      case "history":
        return <HistoryPage history={history} />;
      case "reports":
        return <ReportsPage history={history} alerts={alerts} stats={{}} />;
      case "settings":
        return <SettingsPage />;
      case "profile":
        return <ProfilePage />;
      case "help":
        return <HelpPage />;
      default:
        return (
          <motion.div {...pageTransition} className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-display font-bold text-white"
                >
                  Dashboard
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs text-white/40 mt-0.5"
                >
                  Real-time machine monitoring & AI diagnostics
                </motion.p>
              </div>
            </div>

            <KPICards data={currentData} sensorHistory={sensorHistory} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <SensorCharts history={history} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MachineStatusPie history={history} />
                  <AlertDistributionChart alerts={alerts} />
                </div>
              </div>
              <div className="space-y-6">
                <AIPredictionPanel prediction={prediction} />
                <PowerConsumptionChart history={history} />
                <AlertsWidget
                  alerts={alerts}
                  onViewDetail={handleViewAlert}
                  onAcknowledge={acknowledgeAlert}
                  maxItems={4}
                />
              </div>
            </div>

            <HistoryWidget history={history} maxItems={8} />
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activePage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
}
