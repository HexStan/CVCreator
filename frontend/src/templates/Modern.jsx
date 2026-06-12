import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';
import { clampWidth } from '../utils/presetFields.js';

export default function ModernTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  const nameField = fields?.find((f) => f.key === 'name' && f.value);
  const jobField = fields?.find((f) => f.key === 'jobTitle' && f.value);
  const otherFields = fields?.filter((f) => !['name', 'jobTitle'].includes(f.key) && f.value) || [];

  return (
    <div style={{ fontFamily: fontFamily || '"Segoe UI", sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
      {!hideBasicInfo && (
        <div className="mb-3" data-section="header">
          <div className="bg-[#1a1a2e] text-[#eee] p-3 rounded flex gap-4">
            {avatar && (
              <div className="w-[72px] h-[72px] rounded-full overflow-hidden shrink-0 border-2 border-[#e94560]">
                <img src={avatar} alt="头像" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              {nameField && <div className="text-[22px] font-bold text-[#e94560]">{nameField.value}</div>}
              {jobField && <div className="text-[13px] text-[#ccc] mt-0.5">{jobField.value}</div>}
            </div>
          </div>
          {otherFields.length > 0 && (
            <div className="grid grid-cols-12 gap-x-3 gap-y-[3px] pt-1.5 px-1">
              {otherFields.map((field) => {
                const w = clampWidth(field.width);
                return (
                  <div key={field.key} className="min-w-0" style={{ gridColumn: `span ${w}` }}>
                    <span className="text-[10px] text-[#888] block">{field.label}</span>
                    <span className="text-xs text-[#333]">{field.value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {markdown && (
        <MarkdownRenderer content={markdown} proseClass="prose prose-modern" />
      )}
    </div>
  );
}
