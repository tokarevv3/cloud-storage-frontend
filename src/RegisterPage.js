import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './RegisterPage.css';

function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const validateEmail = (email) => {
    // Простая проверка формата почты
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6 && password.length <= 18;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Валидация
    if (!validateEmail(email)) {
      setError("Некорректный email.");
      return;
    }

    if (!validatePassword(password)) {
      setError("Пароль должен быть от 6 до 18 символов.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/auth/register", {
        firstName,
        lastName,
        email,
        rawPassword: password,
        role: "USER",
        bucket: null,
      });
      localStorage.setItem("token", response.data.token);
      setSuccess("Регистрация прошла успешно!");
      setTimeout(() => navigate("/success"), 2000);
    } catch (err) {
      setError("Ошибка регистрации. Возможно, логин уже занят.");
    }
  };

  return (
    <div className="register-background">
      <div className="register-container">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль (6–18 символов)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Зарегистрироваться</button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'limegreen' }}>{success}</p>}
      </div>
    </div>
  );
}

export default RegisterPage;
