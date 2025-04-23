import { useNavigate } from "react-router-dom";

function SuccessPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Удаляем токен из localStorage
    localStorage.removeItem("token");

    // Перенаправляем пользователя на страницу логина
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Аутентификация успешна ✅</h2>
      <button onClick={handleLogout} style={{ marginTop: "20px" }}>
        Выйти
      </button>
    </div>
  );
}

export default SuccessPage;
