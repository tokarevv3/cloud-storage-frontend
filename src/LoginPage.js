import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/cloud");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        email,  
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/cloud");
    } catch (err) {
      setError("Ошибка входа. Проверьте логин и пароль.");
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <h2>Вход</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Логин"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Войти</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <hr />
        <p>Нет аккаунта?</p>
        <button onClick={goToRegister}>Зарегистрироваться</button>
      </div>
    </div>
  );
}

export default LoginPage;
