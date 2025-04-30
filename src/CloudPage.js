import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link } from "react-router-dom";

function CloudPage() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const location = useLocation();

  const loadData = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Токен не найден. Пожалуйста, войдите в систему.");
      return;
    }

    const subPath = location.pathname.replace(/^\/cloud/, "") || "/";

    axios
      .get(`http://localhost:8080/api${subPath}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = response.data;
        if (!data || typeof data !== "object") {
          setError("Неверный формат данных от сервера.");
          return;
        }

        const entries = Object.entries(data);
        setData(entries);
      })
      .catch((err) => {
        setError("Ошибка при загрузке данных.");
        console.error(err);
      });
  };

  useEffect(() => {
    loadData();
  }, [location.pathname]);

  const handleFileUpload = async (event) => {
    const token = localStorage.getItem("token");
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const subPath = location.pathname.replace(/^\/cloud/, "") || "/";

    try {
      setUploading(true);
      await axios.post(`http://localhost:8080/api${subPath}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      loadData(); // Обновляем список после загрузки
    } catch (err) {
      setError("Ошибка при загрузке файла.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (error) {
    return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto" }}>
      <h2>Содержимое облака</h2>

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "inline-block",
            padding: "10px 15px",
            backgroundColor: "#007bff",
            color: "#fff",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {uploading ? "Загрузка..." : "Загрузить файл"}
          <input
            type="file"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {data.length === 0 ? (
        <p>Папка пуста.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.map(([id, path]) => {
            const isFolder = path.endsWith("/");
            const segments = path.split("/").filter(Boolean);
            const name = segments[segments.length - 1] || "/";
            const currentPath = location.pathname.endsWith("/")
              ? location.pathname
              : location.pathname + "/";

            const link = isFolder
              ? currentPath + name + "/"
              : `?id=${id}`;

            return (
              <li key={id} style={{ marginBottom: "8px" }}>
                <Link
                  to={link}
                  style={{
                    textDecoration: "none",
                    color: isFolder ? "#007bff" : "#333",
                  }}
                >
                  {isFolder ? "📁 " : "📄 "}
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default CloudPage;
