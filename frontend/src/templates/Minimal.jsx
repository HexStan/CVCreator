import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';

export default function MinimalTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  const nameField = fields?.find((f) => f.key === 'name' && f.value);
  const jobField = fields?.find((f) => f.key === 'jobTitle' && f.value);
  const otherFields = fields?.filter((f) => !['name', 'jobTitle'].includes(f.key) && f.value) || [];

  return (
    <div style={{ fontFamily: fontFamily || '"Helvetica Neue", Arial, sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
      {!hideBasicInfo && (
        <div className="text-center mb-3.5" data-section="header">
          {avatar && (
            <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-2 border border-[#ddd]">
              <img src={avatar} alt="头像" className="w-full h-full object-cover" />
            </div>
          )}
          {nameField && <div className="text-2xl font-light tracking-[2px] mb-1">{nameField.value}</div>}
          {jobField && <div className="text-[13px] text-[#888] mb-1.5">{jobField.value}</div>}
          {otherFields.length > 0 && (
            <div className="flex justify-center flex-wrap gap-x-3.5 gap-y-0.5 text-xs text-[#555]">
              {otherFields.map((field) => (
                <span key={field.key}>{field.value}</span>
              ))}
            </div>
          )}
          <div className="mt-2 border-b border-[#333] w-10 mx-auto" />
        </div>
      )}
      {markdown && (
        <MarkdownRenderer content={markdown} proseClass="prose prose-minimal" />
      )}
    </div>
  );
}
