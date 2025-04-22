import React, { useEffect, useState } from 'react';
import axios from 'axios';

function LoginStatus() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/login', {
      responseType: 'text'
    })
    .then(response => {
      const text = response.data.trim().toLowerCase();
      const parsed = text === 'true';
      setStatus(parsed);
    })
    .catch(error => {
      console.error('Ошибка при запросе:', error);
      setStatus('Ошибка');
    });
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Статус логина:</h1>
      <p>
        {status === null ? 'Загрузка...' : String(status)}
      </p>
    </div>
  );
}

export default LoginStatus;
