import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import FilePreviewModal from './FilePreviewModal';
import "./CloudPage.css";
import NavigationBar from "./components/NavigationBar";


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
  const [searchQuery, setSearchQuery] = useState("");



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
    const folderId = searchParams.get("folderId");

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
    } else if (folderId) {
      axios
        .get(`http://localhost:8080/api/folder/${folderId}`, {
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
          Authorization: `Bearer ${token}`,        },
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

  const formatFileSize = (sizeInBytes) => {
  if (sizeInBytes === undefined || sizeInBytes === null) return "";

  const kb = 1024;
  const mb = kb * 1024;
  const gb = mb * 1024;

  if (sizeInBytes < kb) {
    return sizeInBytes + " Б"; // байты
  } else if (sizeInBytes < mb) {
    return (sizeInBytes / kb).toFixed(2) + " КБ";
  } else if (sizeInBytes < gb) {
    return (sizeInBytes / mb).toFixed(2) + " МБ";
  } else {
    return (sizeInBytes / gb).toFixed(2) + " ГБ";
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

  const closeButt = async () => {
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

  const handleRename = async (id, isFolder, newName) => {
    const token = localStorage.getItem("token");

    const url = isFolder
      ? `http://localhost:8080/api/folder/${id}/rename`
      : `http://localhost:8080/api/file/${id}/rename`;

    try {
      await axios.patch(url, null, {
        headers: { Authorization: `Bearer ${token}` },
        params: { newName: newName }
      });
      loadData();
    } catch (err) {
      setError("Ошибка при переименовании.");
      console.error(err);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    axios.get(`http://localhost:8080/api/file`, {
      params: { search: searchQuery },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        // if (res.data && Array.isArray(res.data)) {
        //   setData(Object.entries(res.data));
        //   setFileInfo(null); // заменить текущий список файлов на результат поиска
        // } else {
        //   setError("Некорректный ответ от сервера");
        // }
        setData(Object.entries(res.data));
        setFileInfo(null);
      })
      .catch((err) => {
        setError("Ошибка при поиске файлов");
        console.error(err);
      });
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
    <div className="cloud-page">
      <NavigationBar />

      <div className="cloud-container">
        <div className="cloud-main">
        <button
              onClick={handleGoBack}
              disabled={location.pathname === "/cloud" || location.pathname === "/cloud/"}
              className="back-button"
            >
              ⬅ Назад
            </button>
          <h2>Содержимое облака</h2>

          <input
            type="text"
            placeholder="Поиск файлов и папок..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="cloud-search"
          />

          <div className="cloud-controls">
            

            <button onClick={handleSearch} className="back-button">
              🔍 Найти
            </button>
            <button
              onClick={() => {
                setSearchQuery("");
                navigate("/cloud");
                setFileInfo(null);
              }}
              className="clear-button"
            >
              ❌ Очистить поиск
            </button>


            <label className="upload-label">
              {uploading ? "Загрузка..." : "Загрузить файл"}
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                hidden
              />
            </label>

            <div className="folder-creator">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Имя новой папки"
              />
              <button onClick={handleFolderCreate}>Создать папку</button>
            </div>
          </div>


          {data.length === 0 ? (
            <p>Папка пуста.</p>
          ) : (
            <ul className="file-list">
              {data.map(([id, path]) => {
                const isFolder = path.endsWith("/");
                const segments = path.split("/").filter(Boolean);
                const name = segments[segments.length - 1] || "/";
                const currentPath = location.pathname.endsWith("/") ? location.pathname : location.pathname + "/";

                return (
                  <li key={id} className="file-item">
                    <span
                      onClick={() => {
                        if (isFolder) {
                          // Загрузка информации о папке
                          navigate(`?folderId=${id}`);
                          axios.get(`http://localhost:8080/api/folder/${id}`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                          })
                            .then((res) => setFileInfo(res.data))
                            .catch(() => setError("Ошибка при получении информации о папке."));
                        } else {
                          // Загрузка информации о файле
                          navigate(`?fileId=${id}`);
                        }
                      }}
                      onDoubleClick={() => {
                        if (isFolder) {
                          const newPath = (location.pathname.endsWith("/") ? location.pathname : location.pathname + "/") + name + "/";
                          navigate(newPath);
                        }
                      }}
                      style={{
                        cursor: "pointer",
                        color: isFolder ? "#007bff" : "#333",
                        flexGrow: 1,
                        textDecoration: "underline"
                      }}
                    >
                      {isFolder ? "📁 " : "📄 "}
                      {name}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {fileInfo && (
          <div className="cloud-info-panel">
            <h3>{"fileSize" in fileInfo ? "Информация о файле" : "Информация о папке"}</h3>

            <p><strong>Имя:</strong> {fileInfo.fileName || fileInfo.folderName}</p>
            <p><strong>Путь:</strong> {fileInfo.filePath || fileInfo.folderPath}</p>
            <p><strong>Дата создания:</strong> {new Date(fileInfo.uploadedAt).toLocaleString()}</p>

            {"fileSize" in fileInfo && (
              <p><strong>Размер:</strong> {formatFileSize(fileInfo.fileSize)}</p>
            )}

            <div className="action-buttons">
              {"fileSize" in fileInfo && (
                <>
                  <button onClick={handleDownload} className="btn-download">
                    Скачать файл
                  </button>
                  <button onClick={() => handleFilePreview(fileInfo.id)} className="btn-preview">
                    Предпросмотр
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  const newName = prompt("Введите новое имя:");
                  if (newName) handleRename(fileInfo.id, "fileSize" in fileInfo ? false : true, newName);
                }}
                className="btn-rename"
              >
                Переименовать
              </button>
              <button
                onClick={() => {
                  setMoveTarget({ id: fileInfo.id, isFolder: !"fileSize" in fileInfo });
                  loadFolderTree();
                  setShowMoveModal(true);
                }}
                className="btn-move"
              >
                Переместить
              </button>
              <button
                onClick={() => handleDelete(fileInfo.id, !"fileSize" in fileInfo)}
                className="btn-delete"
              >
                Удалить
              </button>
            </div>


            <FilePreviewModal
              show={showPreviewModal}
              onClose={closeButt}
              filePreviewUrl={filePreviewUrl}
              filePreviewType={filePreviewType}
            />
          </div>

        )}

      </div>
      {showMoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Выберите папку назначения</h3>
            {renderFolderTree(folderTree)}
            <div className="modal-buttons">
              <button
                onClick={handleMove}
                disabled={!selectedFolderId}
              >
                Переместить
              </button>
              <button onClick={() => setShowMoveModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <FilePreviewModal
        show={showPreviewModal}
        onClose={closeButt}
        filePreviewUrl={filePreviewUrl}
        filePreviewType={filePreviewType}
      />
    </div>
  );
}

export default CloudPage;
