import React, { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import JoinGroupViaInvite from "./components/JoinGroupViaInvite.jsx";
import { useAuthStore } from "./store/useAuthStore.js";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import useThemeStore from "./store/useThemeStore.js";
import socket from "./lib/socket";

// -------------------------
// Page animation wrapper
// -------------------------
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
};

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();
  const location = useLocation();

  // -------------------------
  // Socket debug (optional)
  // -------------------------
  useEffect(() => {
    socket.on("newMessage", (msg) => {
      console.log("🔥 SOCKET EVENT RECEIVED:", msg);
    });

    return () => socket.off("newMessage");
  }, []);

  // -------------------------
  // Auth check
  // -------------------------
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // -------------------------
  // Loader
  // -------------------------
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      <Navbar />

      {/* 🔥 Animated Routes */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname + location.search}>
          <Route
            path="/"
            element={
              authUser ? (
                <PageWrapper>
                  <Home />
                </PageWrapper>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/signup"
            element={
              !authUser ? (
                <PageWrapper>
                  <Signup />
                </PageWrapper>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/login"
            element={
              !authUser ? (
                <PageWrapper>
                  <Login />
                </PageWrapper>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/groups/invite/:token"
            element={
              authUser ? (
                <PageWrapper>
                  <JoinGroupViaInvite />
                </PageWrapper>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/settings"
            element={
              authUser ? (
                <PageWrapper>
                  <Settings />
                </PageWrapper>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/profile"
            element={
              authUser ? (
                <PageWrapper>
                  <Profile />
                </PageWrapper>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </AnimatePresence>

      <Toaster />
    </div>
  );
};

export default App;
