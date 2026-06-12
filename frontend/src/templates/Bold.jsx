import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';

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
        <div className="mb-2" data-section="header">
          <div className="bg-[#0f172a] text-white py-[18px] px-4 flex items-center gap-4">
            {avatar && (
              <div className="w-14 h-14 rounded overflow-hidden shrink-0 border-2 border-[#f59e0b]">
                <img src={avatar} alt="头像" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {nameField && (
                <div className="text-2xl font-extrabold tracking-[-0.5px] leading-tight uppercase">
                  {nameField.value}
                </div>
              )}
              {jobField && (
                <div className="text-[13px] text-[#f59e0b] font-medium mt-[3px]">
                  {jobField.value}
                </div>
              )}
            </div>
          </div>
          {otherFields.length > 0 && (
            <div className="grid grid-cols-2 gap-x-5 gap-y-0.5 p-2.5 px-4 bg-[#f1f5f9] text-[11px]">
              {leftCols.map((field) => (
                <div key={field.key} className="flex gap-1.5 min-w-0">
                  <span className="text-[#64748b] shrink-0 font-medium">{field.label}</span>
                  <span className="text-[#1e293b]">{field.value}</span>
                </div>
              ))}
              {rightCols.map((field) => (
                <div key={field.key} className="flex gap-1.5 min-w-0">
                  <span className="text-[#64748b] shrink-0 font-medium">{field.label}</span>
                  <span className="text-[#1e293b]">{field.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {markdown && (
        <MarkdownRenderer content={markdown} proseClass="prose prose-bold" />
      )}
    </div>
  );
}
