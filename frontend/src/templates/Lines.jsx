import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';
import './common.css';

export default function LinesTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  const nameField = fields?.find((f) => f.key === 'name' && f.value);
  const jobField = fields?.find((f) => f.key === 'jobTitle' && f.value);
  const otherFields = fields?.filter((f) => !['name', 'jobTitle'].includes(f.key) && f.value) || [];

  return (
    <div style={{ fontFamily: fontFamily || '"Inter", "Helvetica Neue", sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
      {!hideBasicInfo && (
        <div style={{ marginBottom: 0 }} data-section="header">
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            paddingBottom: 14, marginBottom: 10,
            borderBottom: '1px solid #1a1a1a',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {nameField && (
                <div style={{ fontSize: 28, fontWeight: 200, letterSpacing: 1, lineHeight: 1.1 }}>
                  {nameField.value}
                </div>
              )}
              {jobField && (
                <div style={{ fontSize: 13, color: '#555', fontWeight: 400, marginTop: 4 }}>
                  {jobField.value}
                </div>
              )}
            </div>
            {avatar && (
              <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, marginLeft: 16, border: '1px solid #e5e5e5' }}>
                <img src={avatar} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          {otherFields.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 16px', fontSize: 11, color: '#666', marginBottom: 14 }}>
              {otherFields.map((field, idx) => (
                <span key={field.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#999', fontSize: 10 }}>{field.label}</span>
                  <span>{field.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {markdown && (
        <div style={{ padding: '0 2px' }}>
          <MarkdownRenderer content={markdown} />
        </div>
      )}
    </div>
  );
}
