import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';
import './common.css';

export default function MinimalTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  const nameField = fields?.find((f) => f.key === 'name' && f.value);
  const jobField = fields?.find((f) => f.key === 'jobTitle' && f.value);
  const otherFields = fields?.filter((f) => !['name', 'jobTitle'].includes(f.key) && f.value) || [];

  return (
    <div style={{ fontFamily: fontFamily || '"Helvetica Neue", Arial, sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
      {!hideBasicInfo && (
        <div style={{ textAlign: 'center', marginBottom: 14 }} data-section="header">
          {avatar && (
            <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 8px', border: '1px solid #ddd' }}>
              <img src={avatar} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          {nameField && <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: 2, marginBottom: 4 }}>{nameField.value}</div>}
          {jobField && <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{jobField.value}</div>}
          {otherFields.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2px 14px', fontSize: 12, color: '#555' }}>
              {otherFields.map((field) => (
                <span key={field.key}>{field.value}</span>
              ))}
            </div>
          )}
          <div style={{ marginTop: 8, borderBottom: '1px solid #333', width: 40, marginLeft: 'auto', marginRight: 'auto' }} />
        </div>
      )}
      {markdown && (
        <div>
          <MarkdownRenderer content={markdown} />
        </div>
      )}
    </div>
  );
}
