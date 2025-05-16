import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    const api = axios.create({
      baseURL: 'http://localhost:8080/api/admin',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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
    const token = localStorage.getItem('token');
    const api = axios.create({
      baseURL: 'http://localhost:8080/api/admin',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Пользователи</h2>

      {selectedUsers.length > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <button onClick={() => performAction('delete')} style={{ marginRight: '10px' }}>
            Удалить
          </button>
          <button onClick={() => performAction('admin')}>
            Сделать администратором
          </button>
        </div>
      )}

      <div
        style={{
          maxHeight: '200px',
          overflowY: 'scroll',
          border: '1px solid #ccc',
          marginBottom: '30px',
          padding: '10px',
        }}
      >
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

      <h2>Бакеты</h2>
      <div
        style={{
          maxHeight: '200px',
          overflowY: 'scroll',
          border: '1px solid #ccc',
          padding: '10px',
        }}
      >
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
    </div>
  );
};

export default AdminPage;
