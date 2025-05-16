import { useState, useEffect } from "react";
import axios from "axios";

function SettingsPage() {
  const [user, setUser] = useState(null);
  const [editableUser, setEditableUser] = useState(null);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Токен не найден. Пожалуйста, войдите в систему.");
      return;
    }

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

  const handleEdit = () => {
    setEditableUser({ ...user }); // Создаём копию данных для редактирования
    setEditMode(true);
    setSaveMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email) => {
    // Простая проверка email-адреса
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSave = () => {


    const token = localStorage.getItem("token");

    axios
      .put("http://localhost:8080/api/settings", editableUser, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUser(response.data);
        setEditMode(false);
        setSaveMessage("Изменения сохранены.");
        setError("");
      })
      .catch((err) => {
        setError("Ошибка при сохранении данных.");
        console.error(err);
      });
  };

  if (error) {
    return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;
  }

  if (!user) {
    return <div style={{ textAlign: "center" }}>Загрузка...</div>;
  }

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto" }}>
      <h2>Информация о пользователе</h2>

      {editMode ? (
        <>
          <div>
            <label>Имя:</label>
            <input
              name="firstName"
              value={editableUser.firstName}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: "10px" }}
            />
            <label>Фамилия:</label>
            <input
              name="lastName"
              value={editableUser.lastName}
              onChange={handleChange}
              style={{ width: "100%", marginBottom: "10px" }}
            />
  
          </div>
          <button onClick={handleSave} style={{ marginTop: "10px" }}>
            Сохранить
          </button>
        </>
      ) : (
        <div>
          <p><strong>Имя:</strong> {user.firstName}</p>
          <p><strong>Фамилия:</strong> {user.lastName}</p>
          <p><strong>Почта:</strong> {user.email}</p>
          <p><strong>Используемое значение:</strong> {user.bucket ? user.bucket.size : "Error"}</p>
          <button onClick={handleEdit}>Редактировать</button>
        </div>
      )}

      {saveMessage && (
        <div style={{ color: "green", marginTop: "10px" }}>{saveMessage}</div>
      )}
    </div>
  );
}

export default SettingsPage;
