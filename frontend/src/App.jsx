import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ResumeProvider } from './contexts/ResumeContext.jsx';
import LoginPage from './components/Login/LoginPage.jsx';
import Layout from './components/Layout.jsx';

function AppInner() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>加载中...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <ResumeProvider>
      <Layout />
    </ResumeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
