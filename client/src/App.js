import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import AccountPage from "./components/AccountPage";
import Leaderboard from "./components/Leaderboard";
import SettingsPage from "./components/SettingsPage";
import SupportPage from "./components/SupportPage";
import ManagePicks from "./components/ManagePicks";
import { ViewProvider} from "./context/ViewContext";

function App() {
  return (
    <AuthProvider>
      <ViewProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
           <Route
            path="/managepicks"
            element={
              <ProtectedRoute>
                <ManagePicks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            }
          />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/" element={<LoginPage />} />
          {/* More routes... */}
        </Routes>
      </Router>
      </ViewProvider>
    </AuthProvider>
  );
}

export default App;
