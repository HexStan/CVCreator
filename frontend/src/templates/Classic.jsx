import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';
import { clampWidth } from '../utils/presetFields.js';

export default function ClassicTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  return (
    <div style={{ maxWidth: innerWidth ? `${innerWidth}px` : undefined, fontFamily: fontFamily || undefined }}>
      {!hideBasicInfo && (
        <div className="mb-3 pb-2.5 border-b-2 border-[#333] flex gap-3.5 items-start" data-section="header">
          {avatar && (
            <div className="w-[72px] h-24 shrink-0 border border-[#ddd] overflow-hidden">
              <img src={avatar} alt="头像" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="grid grid-cols-12 gap-x-2 gap-y-0.5 flex-1">
            {fields?.map((field) => {
              if (!field.value && field.key !== 'name') return null;
              const isName = field.key === 'name';
              const w = clampWidth(field.width);
              return (
                <div
                  key={field.key}
                  className="text-xs min-w-0"
                  style={{ gridColumn: `span ${w}` }}
                >
                  {!isName && <span className="text-[#888] mr-1 after:content-[':']">{field.label}</span>}
                  <span className={`text-[#333]${isName ? ' text-2xl font-bold block mb-0.5' : ''}`}>{field.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {markdown && (
        <MarkdownRenderer content={markdown} proseClass="prose prose-classic" />
      )}
    </div>
  );
}
