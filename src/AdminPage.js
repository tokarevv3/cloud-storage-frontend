import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token)

    // Создаём экземпляр axios с заголовком Authorization
    const api = axios.create({
      baseURL: 'http://localhost:8080/api/admin',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Глобальный перехватчик ошибок 403
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 403) {
          navigate("/");
        }
        return Promise.reject(error);
      }
    );

    // Параллельный запрос пользователей и бакетов
    Promise.all([
      api.get('/users').then(res => setUsers(res.data)),
      api.get('/buckets').then(res => setBuckets(res.data)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Пользователи</h2>
      <div style={{ maxHeight: '200px', overflowY: 'scroll', border: '1px solid #ccc', marginBottom: '30px', padding: '10px' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Фамилия</th>
              <th>Почта</th>
              <th>Бакет</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>{user.email}</td>
                <td>{user.bucket?.name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Бакеты</h2>
      <div style={{ maxHeight: '200px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
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
