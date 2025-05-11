import React, { useEffect, useState } from 'react';

const FilePreviewModal = ({ show, onClose, filePreviewUrl, filePreviewType }) => {
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    // Если это текстовый файл, загружаем его содержимое
    if (show && filePreviewUrl && filePreviewType && filePreviewType.startsWith('text/')) {
      fetch(filePreviewUrl)
        .then((res) => res.text())
        .then(setTextContent)
        .catch(() => setTextContent('Ошибка при загрузке текста'));
    } else {
      setTextContent('');
    }
  }, [show, filePreviewUrl, filePreviewType]);

  if (!show) return null;

  const fileExtension = filePreviewType.split('/')[1];

  const renderPreview = () => {
    if (filePreviewType.startsWith('text/')) {
      return (
        <div>
          <h3>Текстовый файл:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{textContent}</pre>
        </div>
      );
    }
    if (filePreviewType === 'application/pdf' || fileExtension === 'pdf') {
        console.log("PDF file found")
      return (
        <div>
          <h3>PDF файл:</h3>
          {/* <iframe src={filePreviewUrl} width="100%" height="600px" title="PDF Viewer" /> */}
          <iframe src={filePreviewUrl} width="100%" height="600px" title="PDF Viewer" />

        </div>
      );
    }
    if (filePreviewType.startsWith('image/')) {
      return (
        <div>
          <h3>Изображение:</h3>
          <img src={filePreviewUrl} alt="preview" width="100%" />
        </div>
      );
    }
    if (filePreviewType.startsWith('video/')) {
      return (
        <div>
          <h3>Видео:</h3>
          <video controls width="100%">
            <source src={filePreviewUrl} type={filePreviewType} />
            Ваш браузер не поддерживает видео.
          </video>
        </div>
      );
    }
    if (filePreviewType.startsWith('audio/')) {
      return (
        <div>
          <h3>Аудио:</h3>
          <audio controls>
            <source src={filePreviewUrl} type={filePreviewType} />
            Ваш браузер не поддерживает аудио.
          </audio>
        </div>
      );
    }
    return <div>Не поддерживаемый формат файла.</div>;
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <button style={modalStyles.closeButton} onClick={onClose}>X</button>
        <div style={modalStyles.content}>
          {renderPreview()}
        </div>
      </div>
    </div>
  );
  
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '80%',
    maxWidth: '1000px',
    maxHeight: '80vh',  // Ограничиваем высоту модального окна
    overflow: 'hidden', // убираем прокрутку отсюда
    position: 'relative',
  },
  content: {
    maxHeight: 'calc(80vh - 60px)', // Вычитаем высоту кнопки и отступы
    overflowY: 'auto',
    paddingRight: '10px',
  },
  
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default FilePreviewModal;
