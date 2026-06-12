import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function LoginPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(username.trim(), password);
      } else {
        await login(username.trim(), password, remember);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <div className="bg-white rounded-lg p-10 w-[380px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
        <h1 className="text-center text-[28px] mb-1 text-primary">简历生成器</h1>
        <h2 className="text-center text-base font-normal text-text-secondary mb-7">{isRegister ? '注册' : '登录'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[13px] text-text-secondary mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="字母、数字、下划线、连字符"
              autoComplete="username"
              className="w-full py-2.5 px-3 border border-border rounded-md text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[13px] text-text-secondary mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="w-full py-2.5 px-3 border border-border rounded-md text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          {!isRegister && (
            <div className="mb-4">
              <label className="text-[13px] text-text-secondary flex items-center gap-1.5">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                记住登录
              </label>
            </div>
          )}
          {error && <div className="text-danger text-[13px] mb-3 py-2 px-3 bg-highlight-red rounded-md">{error}</div>}
          <button type="submit" className="btn-primary w-full py-2.5 text-[15px]" disabled={submitting}>
            {submitting ? '处理中...' : (isRegister ? '注册' : '登录')}
          </button>
        </form>
        <p className="text-center mt-4 text-[13px] text-text-secondary">
          {isRegister ? '已有账号？' : '没有账号？'}
          <button type="button" className="bg-transparent text-primary p-0 text-[13px] border-none hover:underline" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? '去登录' : '去注册'}
          </button>
        </p>
      </div>
    </div>
  );
}
