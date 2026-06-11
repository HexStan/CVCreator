import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';
import './common.css';

export default function ModernTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  return (
    <div style={{ fontFamily: fontFamily || '"Segoe UI", sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
        {!hideBasicInfo && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 12, padding: 12, background: '#1a1a2e', color: '#eee', borderRadius: 4 }}>
            {avatar && (
              <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid #e94560' }}>
                <img src={avatar} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px', flex: 1, alignItems: 'center' }}>
              {fields?.map((field) => {
                if (!field.value) return null;
                const isName = field.key === 'name';
                const widthPct = (field.width / 4) * 100;
                return (
                  <div key={field.key} style={{ width: `${widthPct}%`, maxWidth: `${widthPct}%` }}>
                    {isName ? (
                      <span style={{ fontSize: 22, fontWeight: 700, color: '#e94560' }}>{field.value}</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 10, color: '#aaa', display: 'block' }}>{field.label}</span>
                        <span style={{ fontSize: 12 }}>{field.value}</span>
                      </>
                    )}
                  </div>
                );
              })}
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
