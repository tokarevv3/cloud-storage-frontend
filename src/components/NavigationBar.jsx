import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NavigationBar.css';

const NavigationBar = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsAdmin(false);
      return;
    }

    const api = axios.create({
      baseURL: 'http://localhost:8080/api/admin',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    api.get('/users')
      .then(() => {
        setIsAdmin(true);
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, []);

  return (
    <div className="navbar">
      <button onClick={() => navigate('/cloud')}>Файлы</button>
      <button onClick={() => navigate('/settings')}>Настройки</button>
      {isAdmin && <button onClick={() => navigate('/admin')}>Админка</button>}
    </div>
  );
};

export default NavigationBar;
