import React from "react";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
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
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/" element={<LoginPage />} />
        {/* More routes... */}
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;

