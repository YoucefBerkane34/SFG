import { SocketProvider } from "./context/SocketContext";
import { AppProvider, useApp } from "./context/AppContext";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";

function AppRouter() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <SocketProvider>
      <Layout>
        <DashboardPage />
      </Layout>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
