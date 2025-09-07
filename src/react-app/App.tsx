import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@getmocha/users-service/react";
import { SettingsProvider } from "@/react-app/contexts/SettingsContext";
import HomePage from "@/react-app/pages/Home";
import Analytics from "@/react-app/pages/Analytics";
import LoginPage from "@/react-app/pages/Login";
import AuthCallbackPage from "@/react-app/pages/AuthCallback";
import AcceptFriendPage from "@/react-app/pages/AcceptFriend";
import ProtectedRoute from "@/react-app/components/ProtectedRoute";

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/accept-friend/:token" element={<AcceptFriendPage />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </SettingsProvider>
  );
}
