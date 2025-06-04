import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import SettingsPage from "./SettingsPage";
import CloudPage from "./CloudPage";
import AdminPage from "./AdminPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/cloud/*" element={<CloudPage />} />
        <Route path="/admin" element={<AdminPage />} />

      </Routes>
    </Router>
  );
}

export default App;
