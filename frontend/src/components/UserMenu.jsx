import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useResume } from '../contexts/ResumeContext.jsx';
import { exportJSON } from '../utils/exportService.js';
import './UserMenu.css';

export default function UserMenu() {
  const { user, logout, changeUsername, changePassword } = useAuth();
  const { resume, importData } = useResume();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const handleLogout = useCallback(async () => {
    setMenuOpen(false);
    await logout();
  }, [logout]);

  const handleJSONExport = useCallback(() => {
    setMenuOpen(false);
    exportJSON(resume.data);
  }, [resume.data]);

  const handleJSONImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMenuOpen(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        importData(data);
      } catch (err) {
        alert('JSON 解析失败: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [importData]);

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setMenuOpen((v) => !v)}
        title={user?.username}
      >
        <span className="user-menu-avatar">
          {user?.username?.charAt(0).toUpperCase()}
        </span>
        <span className="user-menu-name">{user?.username}</span>
        <span className={`user-menu-arrow${menuOpen ? ' open' : ''}`}>&#9662;</span>
      </button>

      {menuOpen && (
        <div className="user-menu-dropdown">
          <button
            className="user-menu-item"
            onClick={() => { setMenuOpen(false); setModal('password'); }}
          >
            修改密码
          </button>
          <button
            className="user-menu-item"
            onClick={() => { setMenuOpen(false); setModal('username'); }}
          >
            修改用户名
          </button>
          <div className="user-menu-divider" />
          <button className="user-menu-item" onClick={handleJSONExport}>
            导出 JSON
          </button>
          <button className="user-menu-item" onClick={() => { fileInputRef.current?.click(); }}>
            导入 JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleJSONImport} />
          <div className="user-menu-divider" />
          <button className="user-menu-item user-menu-item-danger" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      )}

      {modal === 'password' && (
        <ChangePasswordModal
          onClose={() => setModal(null)}
          onSubmit={changePassword}
        />
      )}
      {modal === 'username' && (
        <ChangeUsernameModal
          onClose={() => setModal(null)}
          onSubmit={changeUsername}
        />
      )}
    </div>
  );
}

function ChangePasswordModal({ onClose, onSubmit }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!currentPassword || !newPassword) {
      setError('请填写所有密码字段');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(currentPassword, newPassword);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>修改密码</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>当前密码</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
            />
          </div>
          <div className="form-field">
            <label>新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="form-field">
            <label>确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-default" onClick={onClose}>取消</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? '保存中...' : '确认修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChangeUsernameModal({ onClose, onSubmit }) {
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!newUsername.trim() || !password) {
      setError('请填写用户名和密码');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(newUsername.trim(), password);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>修改用户名</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>新用户名</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="字母、数字、下划线、连字符"
              autoFocus
            />
          </div>
          <div className="form-field">
            <label>当前密码（用于验证）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-default" onClick={onClose}>取消</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? '保存中...' : '确认修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
