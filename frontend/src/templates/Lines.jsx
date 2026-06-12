import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';

export default function LinesTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  const nameField = fields?.find((f) => f.key === 'name' && f.value);
  const jobField = fields?.find((f) => f.key === 'jobTitle' && f.value);
  const otherFields = fields?.filter((f) => !['name', 'jobTitle'].includes(f.key) && f.value) || [];

  return (
    <div style={{ fontFamily: fontFamily || '"Inter", "Helvetica Neue", sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
      {!hideBasicInfo && (
        <div className="mb-0" data-section="header">
          <div className="flex justify-between items-end pb-3.5 mb-2.5 border-b border-[#1a1a1a]">
            <div className="flex-1 min-w-0">
              {nameField && (
                <div className="text-[28px] font-extralight tracking-[1px] leading-tight">
                  {nameField.value}
                </div>
              )}
              {jobField && (
                <div className="text-[13px] text-[#555] font-normal mt-1">
                  {jobField.value}
                </div>
              )}
            </div>
            {avatar && (
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ml-4 border border-[#e5e5e5]">
                <img src={avatar} alt="头像" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          {otherFields.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-0 text-[11px] text-[#666] mb-3.5">
              {otherFields.map((field) => (
                <span key={field.key} className="inline-flex items-center gap-1">
                  <span className="text-[#999] text-[10px]">{field.label}</span>
                  <span>{field.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      {markdown && (
        <MarkdownRenderer content={markdown} proseClass="prose prose-lines" />
      )}
    </div>
  );
}
