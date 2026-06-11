import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../utils/api.js';
import './FontManager.css';

export default function FontManager({ onClose }) {
  const [fonts, setFonts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const loadFonts = useCallback(async () => {
    try {
      const data = await api.fonts.list();
      setFonts(data.fonts);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFonts();
  }, [loadFonts]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      await api.fonts.upload(file);
      await loadFonts();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.fonts.delete(id);
      setFonts((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content font-manager-modal">
        <div className="modal-header">
          <h3>字体管理</h3>
          <button className="btn-default btn-sm" onClick={onClose}>关闭</button>
        </div>
        <div className="modal-body">
          <div className="font-upload-row">
            <button
              className="btn-primary btn-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? '上传中...' : '上传字体'}
            </button>
            <span className="font-hint">支持 .ttf .otf .woff .woff2</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              style={{ display: 'none' }}
              onChange={handleUpload}
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          {loading ? (
            <p className="font-loading">加载中...</p>
          ) : fonts.length === 0 ? (
            <p className="font-empty">暂无上传字体</p>
          ) : (
            <ul className="font-list">
              {fonts.map((font) => (
                <li key={font.id} className="font-list-item">
                  <span className="font-name">{font.originalName}</span>
                  <span className="font-format">.{font.format}</span>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(font.id)}>删除</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
