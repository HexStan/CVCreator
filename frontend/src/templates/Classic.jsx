import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';
import { clampWidth } from '../utils/presetFields.js';
import './common.css';
import './Classic.css';

export default function ClassicTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  return (
    <div className="template-classic" style={{ maxWidth: innerWidth ? `${innerWidth}px` : undefined, fontFamily: fontFamily || undefined }}>
      {!hideBasicInfo && (
        <div className="classic-header">
          {avatar && (
            <div className="classic-avatar">
              <img src={avatar} alt="头像" />
            </div>
          )}
          <div className="classic-fields">
            {fields?.map((field) => {
              if (!field.value && field.key !== 'name') return null;
              const isName = field.key === 'name';
              const w = clampWidth(field.width);
              return (
                <div
                  key={field.key}
                  className={`classic-field${isName ? ' classic-field-name' : ''}`}
                  style={{ gridColumn: `span ${w}` }}
                >
                  {!isName && <span className="classic-field-key">{field.label}</span>}
                  <span className="classic-field-val">{field.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {markdown && (
        <div className="classic-body">
          <MarkdownRenderer content={markdown} />
        </div>
      )}
    </div>
  );
}
