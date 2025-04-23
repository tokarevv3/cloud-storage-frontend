import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/success");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", {
        username,  
        password,
      });
      localStorage.setItem("token", response.data.token);
      navigate("/success");
    } catch (err) {
      setError("Ошибка входа. Проверьте логин и пароль.");
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div style={{ maxWidth: "300px", margin: "50px auto" }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Логин"
          value={username}  
          onChange={(e) => setUsername(e.target.value)}  
          required
        />
        <br />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Войти</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <hr />
      <p>Нет аккаунта?</p>
      <button onClick={goToRegister}>Зарегистрироваться</button>
    </div>
  );
}

export default LoginPage;
