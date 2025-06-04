import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavigationBar from "./components/NavigationBar";
import "./AdminPage.css";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLimitEnabled, setIsLimitEnabled] = useState(false);
  const [capacityValue, setCapacityValue] = useState(10);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: 'http://localhost:8080/api/admin',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 403) {
          navigate('/');
        }
        return Promise.reject(error);
      }
    );

    Promise.all([
      api.get('/users').then((res) => setUsers(res.data)),
      api.get('/buckets').then((res) => setBuckets(res.data)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [navigate]);

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const performAction = async (action) => {
    try {
      await Promise.all(
        selectedUsers.map((userId) => {
          const url = `/${userId}/${action}`;
          if (action === 'delete') {
            return api.delete(url);
          } else if (action === 'admin') {
            return api.patch(url);
          }
          return Promise.resolve();
        })
      );
      alert('Операция выполнена успешно');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Ошибка при выполнении операции');
    }
  };

  const handleToggleLimit = async () => {
    const newValue = !isLimitEnabled;
    setIsLimitEnabled(newValue);
    try {
      await api.patch('/capacity', null, {
        params: { toggle: newValue },
      });
    } catch (error) {
      console.error('Ошибка при переключении ограничения:', error);
    }
  };

  const handleCapacityChange = async (e) => {
    const newCapacity = parseInt(e.target.value, 10);
    setCapacityValue(newCapacity);
    try {
      await api.post('/capacity', null, {
        params: { capacity: newCapacity },
      });
    } catch (error) {
      console.error('Ошибка при установке значения ограничения:', error);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="admin-page">
      <NavigationBar />

      <div className="glass-container">
        <h2 className="section-title">Пользователи</h2>

        {selectedUsers.length > 0 && (
          <div className="action-buttons">
            <button className="btn danger" onClick={() => performAction('delete')}>
              Удалить
            </button>
            <button className="btn success" onClick={() => performAction('admin')}>
              Сделать администратором
            </button>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Почта</th>
                <th>Бакет</th>
                <th>Роль</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </td>
                  <td>{user.id}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.bucket?.name || '—'}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="section-title">Бакеты</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Размер</th>
                <th>ID пользователя</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((bucket) => (
                <tr key={bucket.id}>
                  <td>{bucket.id}</td>
                  <td>{bucket.name}</td>
                  <td>{bucket.size}</td>
                  <td>{bucket.userId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="capacity-settings">
          <label>
            <input
              type="checkbox"
              checked={isLimitEnabled}
              onChange={handleToggleLimit}
            />
            Включить ограничение хранилища
          </label>

          {isLimitEnabled && (
            <div className="slider-container">
              <label>
                Ограничение: {capacityValue} ГБ
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={capacityValue}
                  onChange={handleCapacityChange}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
