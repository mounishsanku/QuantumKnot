import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageWrapper } from "./components/PageWrapper.jsx";
import toast from "react-hot-toast";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import GetCovered from "./pages/GetCovered.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Claims from "./pages/Claims.jsx";
import Landing from "./pages/Landing.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { api } from "./utils/api.js";
import { useStore } from "./store/useStore.js";

function ProtectedRoute({ children }) {
  const token = useStore((s) => s.token);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function PublicOnly({ children }) {
  const token = useStore((s) => s.token);
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();
  const [booting, setBooting] = useState(() => !!localStorage.getItem("token"));
  const setAuth = useStore((s) => s.setAuth);
  const token = useStore((s) => s.token);
  const rider = useStore((s) => s.rider);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      setBooting(false);
      return;
    }
    setBooting(true);
    api
      .get("/api/auth/me")
      .then((res) => {
        setAuth(t, res.data.rider);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setAuth(null, null);
        toast.error("Session expired — please log in again");
      })
      .finally(() => setBooting(false));
  }, [setAuth]);

  if (booting && localStorage.getItem("token")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white/70">
        Loading…
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <PageWrapper><Login /></PageWrapper>
            </PublicOnly>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnly>
              <PageWrapper><Register /></PageWrapper>
            </PublicOnly>
          }
        />
        <Route
          path="/get-covered"
          element={
            <ProtectedRoute>
              <PageWrapper><GetCovered /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageWrapper><Dashboard /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims"
          element={
            <ProtectedRoute>
              <PageWrapper><Claims /></PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        <Route
          path="*"
          element={<Navigate to={token && rider ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </AnimatePresence>
  );
}
