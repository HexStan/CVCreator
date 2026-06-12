import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';

export default function ZenTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  const nameField = fields?.find((f) => f.key === 'name' && f.value);
  const jobField = fields?.find((f) => f.key === 'jobTitle' && f.value);
  const otherFields = fields?.filter((f) => !['name', 'jobTitle'].includes(f.key) && f.value) || [];

  return (
    <div style={{ fontFamily: fontFamily || '"Helvetica Neue", "PingFang SC", sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
      {!hideBasicInfo && (
        <div className="text-center mb-[18px]" data-section="header">
          {nameField && (
            <div className="text-[26px] font-extralight tracking-[4px] mb-1.5 text-[#1a1a1a]">
              {nameField.value}
            </div>
          )}
          {avatar && (
            <div className="w-10 h-10 rounded-full overflow-hidden mx-auto mb-1.5 opacity-85">
              <img src={avatar} alt="头像" className="w-full h-full object-cover" />
            </div>
          )}
          {jobField && (
            <div className="text-xs text-[#999] tracking-[1px] mb-2">
              {jobField.value}
            </div>
          )}
          {otherFields.length > 0 && (
            <div className="flex justify-center flex-wrap gap-x-[18px] gap-y-[3px] text-[11px] text-[#777]">
              {otherFields.map((field) => (
                <span key={field.key}>
                  <span className="text-[#bbb]">{field.label} </span>
                  {field.value}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3.5 mx-auto w-[60px] h-px bg-gradient-to-r from-transparent via-[#ccc] via-20% to-transparent" />
        </div>
      )}
      {markdown && (
        <MarkdownRenderer content={markdown} proseClass="prose prose-zen" />
      )}
    </div>
  );
}
