import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';
import './Zen.css';

export default function ZenTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  const nameField = fields?.find((f) => f.key === 'name' && f.value);
  const jobField = fields?.find((f) => f.key === 'jobTitle' && f.value);
  const otherFields = fields?.filter((f) => !['name', 'jobTitle'].includes(f.key) && f.value) || [];

  return (
    <div style={{ fontFamily: fontFamily || '"Helvetica Neue", "PingFang SC", sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
      {!hideBasicInfo && (
        <div style={{ textAlign: 'center', marginBottom: 18 }} data-section="header">
          {nameField && (
            <div style={{ fontSize: 26, fontWeight: 200, letterSpacing: 4, marginBottom: 6, color: '#1a1a1a' }}>
              {nameField.value}
            </div>
          )}
          {avatar && (
            <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 6px', opacity: 0.85 }}>
              <img src={avatar} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          {jobField && (
            <div style={{ fontSize: 12, color: '#999', letterSpacing: 1, marginBottom: 8 }}>
              {jobField.value}
            </div>
          )}
          {otherFields.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '3px 18px', fontSize: 11, color: '#777' }}>
              {otherFields.map((field) => (
                <span key={field.key}>
                  <span style={{ color: '#bbb' }}>{field.label} </span>
                  {field.value}
                </span>
              ))}
            </div>
          )}
          <div style={{
            margin: '14px auto 0', width: 60, height: 1,
            background: 'linear-gradient(to right, transparent, #ccc 20%, #ccc 80%, transparent)',
          }} />
        </div>
      )}
      {markdown && (
        <div className="zen-body" style={{ padding: '0 6px' }}>
          <MarkdownRenderer content={markdown} />
        </div>
      )}
    </div>
  );
}
