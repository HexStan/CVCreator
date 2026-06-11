import React, { useRef } from 'react';
import './AvatarUploader.css';

export default function AvatarUploader({ value, onChange }) {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 200;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        onChange(canvas.toDataURL('image/png'));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="avatar-uploader">
      <div className="avatar-preview" onClick={() => inputRef.current?.click()}>
        {value ? (
          <img src={value} alt="头像" />
        ) : (
          <span className="avatar-placeholder">+<br />头像</span>
        )}
      </div>
      <div className="avatar-actions">
        <button className="btn-default btn-sm" onClick={() => inputRef.current?.click()}>
          {value ? '更换' : '上传'}
        </button>
        {value && (
          <button className="btn-danger btn-sm" onClick={() => onChange('')}>移除</button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
