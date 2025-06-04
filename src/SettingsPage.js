import { useState, useEffect } from "react";
import axios from "axios";
import NavigationBar from './components/NavigationBar';
import './SettingsPage.css';
import { useNavigate } from "react-router-dom";

function SettingsPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [editableUser, setEditableUser] = useState(user);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Токен не найден. Пожалуйста, войдите в систему.");
      return;
    }

    axios
      .get("http://localhost:8080/api/user", {
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

  const handleLogout = () => {
    localStorage.removeItem("token"); // если используется другой ключ — замени
    navigate("/login");
  };

  // Внутри SettingsPage компонента (например, сразу после импортов или внутри компонента)
function formatSize(bytes) {
  if (bytes == null || isNaN(bytes)) return "—";

  const kB = bytes / 1024;
  if (kB < 1024) {
    return `${kB.toFixed(2)} КБ`;
  }

  const MB = kB / 1024;
  if (MB < 1024) {
    return `${MB.toFixed(2)} МБ`;
  }

  const GB = MB / 1024;
  return `${GB.toFixed(2)} ГБ`;
}


  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser({ ...editableUser, [name]: value });
  };

  const validateEmail = (email) => {
    // Простая проверка email-адреса
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handlePasswordChange = async () => {
    const token = localStorage.getItem("token");
    if (newPassword !== repeatPassword) {
      alert('Пароли не совпадают');
      return;
    }
    try {
      const response = await fetch('http://localhost:8080/api/user/password', {
        method: 'PATCH',
        headers:  { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: newPassword }),
      });
      if (response.ok) {
        alert('Пароль успешно изменён');
        setShowPasswordModal(false);
        setNewPassword('');
        setRepeatPassword('');
      } else {
        alert('Ошибка при изменении пароля');
      }
    } catch (e) {
      console.error(e);
      alert('Сервер не отвечает');
    }
  };

  const handleSave = () => {


    const token = localStorage.getItem("token");

    axios
      .put("http://localhost:8080/api/user/update", editableUser, {
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
    <div className="settings-background">
      <NavigationBar />
      <div className="settings-container">
        <h2>Информация о пользователе</h2>
        {editMode ? (
          <>
            <label>Имя:</label>
            <input name="firstName" value={editableUser.firstName} onChange={handleChange} />
            <label>Фамилия:</label>
            <input name="lastName" value={editableUser.lastName} onChange={handleChange} />
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button onClick={handleSave}>Сохранить</button>
              <button onClick={() => setEditMode(false)}>Отмена</button>
            </div>
          </>
        ) : (
          <>
            <p><strong>Имя:</strong> {user.firstName}</p>
            <p><strong>Фамилия:</strong> {user.lastName}</p>
            <p><strong>Почта:</strong> {user.email}</p>
            <p><strong>Используемое значение:</strong> {formatSize(user.bucket?.size)}</p>
            <button onClick={handleEdit}>Редактировать</button>
            <button onClick={() => setShowPasswordModal(true)}>Изменить пароль</button>
            <button className="logout-button" onClick={handleLogout}>Выйти</button>
          </>
        )}
  
        {saveMessage && <div className="success-message">{saveMessage}</div>}
      </div>
  
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Смена пароля</h3>
            <input
              type="password"
              placeholder="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Повторите пароль"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handlePasswordChange}>Сохранить</button>
              <button onClick={() => setShowPasswordModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
