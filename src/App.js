import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";
import SuccessPage from "./SuccessPage";
import RegisterPage from "./RegisterPage";
import SettingsPage from "./SettingsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Редирект с главной страницы на /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/settings" element={<SettingsPage />} />

      </Routes>
    </Router>
  );
}

export default App;
