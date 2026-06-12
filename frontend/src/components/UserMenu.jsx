import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useResume } from '../contexts/ResumeContext.jsx';
import { exportJSON } from '../utils/exportService.js';

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
    <div className="relative inline-flex" ref={menuRef}>
      <button
        className="inline-flex items-center gap-1.5 py-0.5 pl-1 pr-2 border border-border rounded-md bg-surface cursor-pointer text-[13px] text-text hover:border-primary transition-colors"
        onClick={() => setMenuOpen((v) => !v)}
        title={user?.username}
      >
        <span className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-full bg-primary text-white text-xs font-semibold shrink-0">
          {user?.username?.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">{user?.username}</span>
        <span className={`text-[10px] transition-transform text-text-secondary${menuOpen ? ' rotate-180' : ''}`}>&#9662;</span>
      </button>

      {menuOpen && (
        <div className="absolute top-[calc(100%+4px)] right-0 min-w-[140px] bg-surface border border-border rounded-md shadow-lg z-[1000] p-1">
          <button
            className="block w-full text-left py-2 px-3 rounded-sm text-[13px] text-text hover:bg-light-gray"
            onClick={() => { setMenuOpen(false); setModal('password'); }}
          >
            修改密码
          </button>
          <button
            className="block w-full text-left py-2 px-3 rounded-sm text-[13px] text-text hover:bg-light-gray"
            onClick={() => { setMenuOpen(false); setModal('username'); }}
          >
            修改用户名
          </button>
          <div className="h-px bg-border my-1" />
          <button className="block w-full text-left py-2 px-3 rounded-sm text-[13px] text-text hover:bg-light-gray" onClick={handleJSONExport}>
            导出 JSON
          </button>
          <button className="block w-full text-left py-2 px-3 rounded-sm text-[13px] text-text hover:bg-light-gray" onClick={() => { fileInputRef.current?.click(); }}>
            导入 JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleJSONImport} />
          <div className="h-px bg-border my-1" />
          <button className="block w-full text-left py-2 px-3 rounded-sm text-[13px] text-danger hover:bg-highlight-red" onClick={handleLogout}>
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
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[2000]" onClick={onClose}>
      <div className="bg-surface rounded-lg py-7 px-8 w-[380px] max-w-[90vw] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-5 text-text">修改密码</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3.5">
            <label className="block text-[13px] text-text-secondary mb-1">当前密码</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              className="w-full py-2 px-3 border border-border rounded-md text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="mb-3.5">
            <label className="block text-[13px] text-text-secondary mb-1">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full py-2 px-3 border border-border rounded-md text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="mb-3.5">
            <label className="block text-[13px] text-text-secondary mb-1">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full py-2 px-3 border border-border rounded-md text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          {error && <div className="text-danger text-[13px] mb-3 py-2 px-3 bg-highlight-red rounded-md">{error}</div>}
          <div className="flex justify-end gap-2 mt-2">
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
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[2000]" onClick={onClose}>
      <div className="bg-surface rounded-lg py-7 px-8 w-[380px] max-w-[90vw] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-semibold mb-5 text-text">修改用户名</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3.5">
            <label className="block text-[13px] text-text-secondary mb-1">新用户名</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="字母、数字、下划线、连字符"
              autoFocus
              className="w-full py-2 px-3 border border-border rounded-md text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="mb-3.5">
            <label className="block text-[13px] text-text-secondary mb-1">当前密码（用于验证）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full py-2 px-3 border border-border rounded-md text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          {error && <div className="text-danger text-[13px] mb-3 py-2 px-3 bg-highlight-red rounded-md">{error}</div>}
          <div className="flex justify-end gap-2 mt-2">
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
