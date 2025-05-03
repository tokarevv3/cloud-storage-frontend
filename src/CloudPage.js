import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";

function CloudPage() {
  const [data, setData] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const loadData = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Токен не найден. Пожалуйста, войдите в систему.");
      return;
    }

    const subPath = location.pathname.replace(/^\/cloud/, "") || "/";
    const searchParams = new URLSearchParams(location.search);
    const fileId = searchParams.get("fileId");

    axios
      .get(`http://localhost:8080/api${subPath}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: fileId ? { fileId } : {},
      })
      .then((res) => {
        if (fileId) {
          setFileInfo(res.data);
        } else {
          setData(Object.entries(res.data));
          setFileInfo(null);
        }
      })
      .catch((err) => {
        setError("Ошибка при загрузке данных.");
        console.error(err);
      });
  };

  useEffect(() => {
    loadData();
  }, [location]);

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
      loadData();
    } catch (err) {
      setError("Ошибка при загрузке файла.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFolderCreate = async () => {
    if (!newFolderName.trim()) return;
    const token = localStorage.getItem("token");
    const subPath = location.pathname.replace(/^\/cloud/, "") || "/";

    try {
      await axios.post(`http://localhost:8080/api${subPath}`, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { folderName: newFolderName },
      });
      setNewFolderName("");
      loadData();
    } catch (err) {
      setError("Ошибка при создании папки.");
      console.error(err);
    }
  };

  const handleDownload = () => {
    const token = localStorage.getItem("token");
    const subPath = location.pathname.replace(/^\/cloud/, "") || "/";

    axios
      .get(`http://localhost:8080/api${subPath}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { downloadFileId: fileInfo.id },
        responseType: "blob",
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileInfo.fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => {
        setError("Ошибка при скачивании файла.");
        console.error(err);
      });
  };

  const handleDelete = async (id, isFolder) => {
    const token = localStorage.getItem("token");
    const subPath = location.pathname.replace(/^\/cloud/, "") || "/";

    if (!window.confirm("Вы действительно хотите удалить этот элемент?")) return;

    try {
      await axios.delete(`http://localhost:8080/api${subPath}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: isFolder ? { folderId: id } : { fileId: id },
      });
      loadData();
    } catch (err) {
      setError("Ошибка при удалении.");
      console.error(err);
    }
  };

  const handleGoBack = () => {
    const currentPath = location.pathname.replace(/^\/cloud/, "") || "/";
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop(); // remove current folder
    const parentPath = parts.length === 0 ? "/cloud" : `/cloud/${parts.join("/")}`;
    navigate(parentPath.endsWith("/") ? parentPath : parentPath + "/");
  };

  if (error) {
    return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;
  }

  return (
    <div style={{ display: "flex", maxWidth: "1000px", margin: "50px auto" }}>
      <div style={{ flex: 1, paddingRight: "20px" }}>
        <h2>Содержимое облака</h2>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={handleGoBack}
            disabled={location.pathname === "/cloud" || location.pathname === "/cloud/"}
            style={{
              padding: "5px 10px",
              backgroundColor:
                location.pathname === "/cloud" || location.pathname === "/cloud/"
                  ? "#ccc"
                  : "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor:
                location.pathname === "/cloud" || location.pathname === "/cloud/"
                  ? "not-allowed"
                  : "pointer"
            }}
          >
            ⬅ Назад
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "inline-block",
              padding: "10px 15px",
              backgroundColor: "#007bff",
              color: "#fff",
              borderRadius: "5px",
              cursor: "pointer"
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

        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Имя новой папки"
            style={{ marginRight: "10px", padding: "5px" }}
          />
          <button onClick={handleFolderCreate} style={{ padding: "5px 10px" }}>
            Создать папку
          </button>
        </div>

        {data.length === 0 ? (
          <p>Папка пуста.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {data.map(([id, path]) => {
              const isFolder = path.endsWith("/");
              const segments = path.split("/").filter(Boolean);
              const name = segments[segments.length - 1] || "/";
              const currentPath = location.pathname.endsWith("/") ? location.pathname : location.pathname + "/";
              const link = isFolder ? currentPath + name + "/" : `?fileId=${id}`;

              return (
                <li
                  key={id}
                  style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <Link
                    to={link}
                    style={{
                      textDecoration: "none",
                      color: isFolder ? "#007bff" : "#333",
                      flexGrow: 1
                    }}
                  >
                    {isFolder ? "📁 " : "📄 "}
                    {name}
                  </Link>
                  <button
                    onClick={() => handleDelete(id, isFolder)}
                    style={{
                      marginLeft: "10px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Удалить
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {fileInfo && (
        <div
          style={{
            flex: "0 0 300px",
            borderLeft: "1px solid #ccc",
            paddingLeft: "20px"
          }}
        >
          <h3>Информация о файле</h3>
          <p>
            <strong>Имя:</strong> {fileInfo.fileName}
          </p>
          <p>
            <strong>Путь:</strong> {fileInfo.filePath}
          </p>
          <p>
            <strong>Размер:</strong> {fileInfo.fileSize}
          </p>
          <p>
            <strong>Загружен:</strong>{" "}
            {new Date(fileInfo.uploadedAt).toLocaleString()}
          </p>
          <div>
            <button
              onClick={handleDownload}
              style={{ marginTop: "10px", padding: "6px 12px" }}
            >
              Скачать файл
            </button>
            <button
              onClick={() => handleDelete(fileInfo.id, false)}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                padding: "6px 12px",
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "4px"
              }}
            >
              Удалить файл
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CloudPage;
