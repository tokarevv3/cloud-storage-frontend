import { useState, useEffect } from "react";
import axios from "axios";

function SettingsPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Получаем токен из localStorage
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Токен не найден. Пожалуйста, войдите в систему.");
      return;
    }

    if (user) return;

    // Делаем запрос на бэкенд для получения данных о пользователе
    axios
      .get("http://localhost:8080/api/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        setError("Ошибка при загрузке данных пользователя.");
        console.error(err);
      });
  }, []);

  if (error) {
    return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;
  }

  if (!user) {
    return <div style={{ textAlign: "center" }}>Загрузка...</div>;
  }

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto" }}>
      <h2>Информация о пользователе</h2>
      <div>
        <p><strong>Имя:</strong> {user.firstName}</p>
        <p><strong>Фамилия:</strong> {user.lastName}</p>
        <p><strong>Почта:</strong> {user.email}</p>
        <p><strong>Используемое значение:</strong> {user.bucket ? user.bucket.size : "Error"}</p>
      </div>
    </div>
  );
}

export default SettingsPage;
