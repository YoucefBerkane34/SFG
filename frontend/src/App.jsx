import { SocketProvider } from "./context/SocketContext";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <SocketProvider>
      <Dashboard />
    </SocketProvider>
  );
}
