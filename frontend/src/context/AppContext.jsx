import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AppContext = createContext(null);

const VALID_CREDENTIALS = {
  username: "admin",
  password: "admin123",
  user: {
    name: "Admin",
    email: "admin@smartfactory.com",
    role: "Operator",
    avatar: null,
    joined: "2024-01-15",
  },
};

const PAGES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "machines", label: "Machine Monitoring" },
  { key: "prediction", label: "AI Prediction" },
  { key: "alerts", label: "Alerts" },
  { key: "analytics", label: "Analytics" },
  { key: "history", label: "History" },
  { key: "reports", label: "Reports" },
  { key: "settings", label: "Settings" },
  { key: "profile", label: "Profile" },
  { key: "help", label: "Help" },
];

function loadUser() {
  try {
    const saved = localStorage.getItem("sg-user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [factory, setFactory] = useState("Factory 1 — Main Plant");
  const [user, setUser] = useState(loadUser);
  const [loginError, setLoginError] = useState("");

  const isAuthenticated = !!user;

  const login = useCallback((username, password) => {
    setLoginError("");
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      const userData = { ...VALID_CREDENTIALS.user, username };
      setUser(userData);
      localStorage.setItem("sg-user", JSON.stringify(userData));
      setActivePage("dashboard");
      return true;
    }
    setLoginError("Invalid username or password");
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("sg-user");
    setActivePage("dashboard");
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(false);
  }, []);

  const navigateTo = useCallback((page) => {
    setActivePage(page);
  }, []);

  useEffect(() => {
    function applyAccent() {
      try {
        const saved = localStorage.getItem("sg-settings");
        if (saved) {
          const s = JSON.parse(saved);
          if (s.accentColor) {
            document.documentElement.style.setProperty("--accent", s.accentColor);
          }
        }
      } catch {}
    }
    applyAccent();
    window.addEventListener("storage", applyAccent);
    return () => window.removeEventListener("storage", applyAccent);
  }, []);

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage: navigateTo,
        sidebarCollapsed,
        toggleSidebar,
        mobileSidebarOpen,
        toggleMobileSidebar,
        closeMobileSidebar,
        selectedMachine,
        setSelectedMachine,
        searchOpen,
        setSearchOpen,
        factory,
        setFactory,
        pages: PAGES,
        user,
        isAuthenticated,
        login,
        logout,
        loginError,
        setLoginError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
