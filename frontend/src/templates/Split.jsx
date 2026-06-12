import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';
import { clampWidth } from '../utils/presetFields.js';
import './common.css';

export default function SplitTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  const nameField = fields?.find((f) => f.key === 'name' && f.value);
  const otherFields = fields?.filter((f) => f.key !== 'name' && f.value) || [];

  const sidebarW = Math.round((innerWidth || 210) * 0.28);

  return (
    <div style={{ fontFamily: fontFamily || '"Segoe UI", "Roboto", sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
      {!hideBasicInfo && (
        <div style={{ display: 'flex', marginBottom: 10 }} data-section="header">
          <div style={{
            width: sidebarW, background: '#1e293b', color: '#e2e8f0',
            padding: '24px 14px', flexShrink: 0,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          }}>
            {avatar && (
              <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', marginBottom: 12, border: '2px solid #38bdf8', flexShrink: 0 }}>
                <img src={avatar} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            {nameField && (
              <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9', textAlign: 'center', lineHeight: 1.2 }}>
                {nameField.value}
              </div>
            )}
          </div>
          <div style={{
            flex: 1, background: '#f8fafc', minWidth: 0,
            padding: '16px 16px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '4px 14px', alignItems: 'end',
            }}>
              {otherFields.map((field) => {
                const w = clampWidth(field.width);
                return (
                  <div key={field.key} style={{ gridColumn: `span ${w}`, minWidth: 0 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 1 }}>
                      {field.label}
                    </span>
                    <span style={{ fontSize: 12, color: '#334155' }}>{field.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
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
