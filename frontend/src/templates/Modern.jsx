import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';
import { clampWidth } from '../utils/presetFields.js';
import './common.css';

export default function ModernTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  const nameField = fields?.find((f) => f.key === 'name' && f.value);
  const jobField = fields?.find((f) => f.key === 'jobTitle' && f.value);
  const otherFields = fields?.filter((f) => !['name', 'jobTitle'].includes(f.key) && f.value) || [];

  return (
    <div style={{ fontFamily: fontFamily || '"Segoe UI", sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
      {!hideBasicInfo && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ background: '#1a1a2e', color: '#eee', padding: 12, borderRadius: 4, display: 'flex', gap: 16 }}>
            {avatar && (
              <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #e94560' }}>
                <img src={avatar} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ flex: 1 }}>
              {nameField && <div style={{ fontSize: 22, fontWeight: 700, color: '#e94560' }}>{nameField.value}</div>}
              {jobField && <div style={{ fontSize: 13, color: '#ccc', marginTop: 2 }}>{jobField.value}</div>}
            </div>
          </div>
          {otherFields.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '3px 12px', padding: '6px 4px 0' }}>
              {otherFields.map((field) => {
                const w = clampWidth(field.width);
                return (
                  <div key={field.key} style={{ gridColumn: `span ${w}`, minWidth: 0 }}>
                    <span style={{ fontSize: 10, color: '#888', display: 'block' }}>{field.label}</span>
                    <span style={{ fontSize: 12, color: '#333' }}>{field.value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {markdown && (
        <div style={{ padding: '0 4px' }}>
          <MarkdownRenderer content={markdown} />
        </div>
      )}
    </div>
  );
}
