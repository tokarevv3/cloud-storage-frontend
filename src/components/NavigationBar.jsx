import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationBar.css';

const NavigationBar = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <button onClick={() => navigate('/cloud')}>Файлы</button>
      <button onClick={() => navigate('/settings')}>Настройки</button>
    </div>
  );
};

export default NavigationBar;
