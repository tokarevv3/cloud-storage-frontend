import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, Link } from "react-router-dom";
import FilePreviewModal from './FilePreviewModal';


function CloudPage() {
  const [data, setData] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTarget, setMoveTarget] = useState({ id: null, isFolder: false });
  const [folderTree, setFolderTree] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [filePreviewType, setFilePreviewType] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);


  // Wildcard controller
  const loadData = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Токен не найден. Пожалуйста, войдите в систему.");
      return;
    }
  
    const subPath = location.pathname.replace(/^\/cloud/, "") || "/";
    const searchParams = new URLSearchParams(location.search);
    const fileId = searchParams.get("fileId");
  
    if (fileId) {
      axios
        .get(`http://localhost:8080/api/file/${fileId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setFileInfo(res.data);
        })
        .catch((err) => {
          setError("Ошибка при получении информации о файле.");
          console.error(err);
        });
    } else {
      axios
        .get(`http://localhost:8080/api${subPath}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          setData(Object.entries(res.data));
          setFileInfo(null);
        })
        .catch((err) => {
          setError("Ошибка при загрузке данных.");
          console.error(err);
        });
    }
  };
  

  useEffect(() => {
    loadData();
  }, [location]);


  const handleFilePreview = (previewFileId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Токен не найден. Пожалуйста, войдите в систему.");
      return;
    }
    axios
      .get(`http://localhost:8080/api/file/${previewFileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { previewFileId },
        responseType: "blob",
      })
      .then((res) => {
        console.log(res);
        const fileBlob = res.data; 
        const fileUrl = URL.createObjectURL(fileBlob);
        setFilePreviewUrl(fileUrl);
        setFilePreviewType(res.headers["content-type"]);
        setShowPreviewModal(true);
        
      })
      .catch((err) => {
        console.warn("Предпросмотр недоступен:", err);
      });
  };

  // Wildcard controller
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

  // wilcard controller
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
      .get(`http://localhost:8080/api/file/${fileInfo.id}/download`, {
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
  
    if (!window.confirm("Вы действительно хотите удалить этот элемент?")) return;
  
    const url = isFolder
      ? `http://localhost:8080/api/folder/${id}/delete`
      : `http://localhost:8080/api/file/${id}/delete`;
  
    try {
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
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
    parts.pop();
    const parentPath = parts.length === 0 ? "/cloud" : `/cloud/${parts.join("/")}`;
    navigate(parentPath.endsWith("/") ? parentPath : parentPath + "/");
  };

  const loadFolderTree = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:8080/api/folder-tree", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolderTree(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке структуры папок", err);
    }
  };

  const closeButt = async() => {
    URL.revokeObjectURL(filePreviewUrl); // очищаем blob
                setShowPreviewModal(false);
                setFilePreviewUrl(null);
                setFilePreviewType(null);
            
  };

  const handleMove = async () => {
    const token = localStorage.getItem("token");
    if (!selectedFolderId || !moveTarget.id) return;
  
    const url = moveTarget.isFolder
      ? `http://localhost:8080/api/folder/${moveTarget.id}/move`
      : `http://localhost:8080/api/file/${moveTarget.id}/move`;
  
    try {
      await axios.patch(url, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { newParentFolderId: selectedFolderId }
      });
      setShowMoveModal(false);
      loadData();
    } catch (err) {
      setError("Ошибка при перемещении.");
      console.error(err);
    }
  };
  

  const renderFolderTree = (nodes) => (
    <ul style={{ listStyle: "none", paddingLeft: "20px" }}>
      {nodes.map((node) => (
        <li key={node.id}>
          <label>
            <input
              type="radio"
              name="destination"
              value={node.id}
              onChange={() => setSelectedFolderId(node.id)}
            />
            📁 {node.name}
          </label>
          {node.children?.length > 0 && renderFolderTree(node.children)}
        </li>
      ))}
    </ul>
  );

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
                  <button
                    onClick={() => {
                      setMoveTarget({ id, isFolder });
                      loadFolderTree();
                      setShowMoveModal(true);
                    }}
                    style={{
                      marginLeft: "10px",
                      backgroundColor: "#17a2b8",
                      color: "#fff",
                      border: "none",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Переместить
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
          <p><strong>Имя:</strong> {fileInfo.fileName}</p>
          <p><strong>Путь:</strong> {fileInfo.filePath}</p>
          <p><strong>Размер:</strong> {fileInfo.fileSize}</p>
          <p><strong>Загружен:</strong> {new Date(fileInfo.uploadedAt).toLocaleString()}</p>
          <div>
            <button onClick={handleDownload} style={{ marginTop: "10px", padding: "6px 12px" }}>
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
            <div>
              <button onClick={() => handleFilePreview(fileInfo.id)}>Предпросмотр файла</button>
              <FilePreviewModal
                show={showPreviewModal}
                onClose={closeButt}
                filePreviewUrl={filePreviewUrl}
                filePreviewType={filePreviewType}
              />
            </div>
          </div>
        </div>
      )}

      {showMoveModal && (
        <div style={{
          position: "fixed",
          top: "0", left: "0", right: "0", bottom: "0",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 999
        }}>
          <div style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            maxHeight: "80vh",
            overflowY: "auto",
            width: "400px"
          }}>
            <h3>Выберите папку назначения</h3>
            {renderFolderTree(folderTree)}
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={handleMove}
                disabled={!selectedFolderId}
                style={{ marginRight: "10px", padding: "6px 12px" }}
              >
                Переместить
              </button>
              <button onClick={() => setShowMoveModal(false)} style={{ padding: "6px 12px" }}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      {showPreviewModal }



    </div>
  );
}

export default CloudPage;
