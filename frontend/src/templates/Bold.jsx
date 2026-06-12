import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';
import './Bold.css';

export default function BoldTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  const nameField = fields?.find((f) => f.key === 'name' && f.value);
  const jobField = fields?.find((f) => f.key === 'jobTitle' && f.value);
  const otherFields = fields?.filter((f) => !['name', 'jobTitle'].includes(f.key) && f.value) || [];

  const mid = Math.ceil(otherFields.length / 2);
  const leftCols = otherFields.slice(0, mid);
  const rightCols = otherFields.slice(mid);

  return (
    <div style={{ fontFamily: fontFamily || '"Montserrat", "Segoe UI", sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
      {!hideBasicInfo && (
        <div style={{ marginBottom: 8 }} data-section="header">
          <div style={{
            background: '#0f172a', color: '#fff', padding: '18px 16px 14px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            {avatar && (
              <div style={{ width: 56, height: 56, borderRadius: 4, overflow: 'hidden', flexShrink: 0, border: '2px solid #f59e0b' }}>
                <img src={avatar} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {nameField && (
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2, textTransform: 'uppercase' }}>
                  {nameField.value}
                </div>
              )}
              {jobField && (
                <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 500, marginTop: 3 }}>
                  {jobField.value}
                </div>
              )}
            </div>
          </div>
          {otherFields.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 20px',
              padding: '10px 16px', background: '#f1f5f9', fontSize: 11,
            }}>
              {leftCols.map((field) => (
                <div key={field.key} style={{ display: 'flex', gap: 6, minWidth: 0 }}>
                  <span style={{ color: '#64748b', flexShrink: 0, fontWeight: 500 }}>{field.label}</span>
                  <span style={{ color: '#1e293b' }}>{field.value}</span>
                </div>
              ))}
              {rightCols.map((field, idx) => (
                <div key={field.key} style={{ display: 'flex', gap: 6, minWidth: 0 }}>
                  <span style={{ color: '#64748b', flexShrink: 0, fontWeight: 500 }}>{field.label}</span>
                  <span style={{ color: '#1e293b' }}>{field.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {markdown && (
        <div className="bold-body" style={{ padding: '0 4px' }}>
          <MarkdownRenderer content={markdown} />
        </div>
      )}
    </div>
  );
}
