import React from 'react';
import MarkdownRenderer from '../components/Preview/MarkdownRenderer.jsx';
import { clampWidth } from '../utils/presetFields.js';

export default function SplitTemplate({ basicInfo, markdown, innerWidth, hideBasicInfo, fontFamily }) {
  const { avatar, fields } = basicInfo || {};

  const nameField = fields?.find((f) => f.key === 'name' && f.value);
  const otherFields = fields?.filter((f) => f.key !== 'name' && f.value) || [];

  const sidebarW = Math.round((innerWidth || 210) * 0.28);

  return (
    <div style={{ fontFamily: fontFamily || '"Segoe UI", "Roboto", sans-serif', maxWidth: innerWidth ? `${innerWidth}px` : undefined }}>
      {!hideBasicInfo && (
        <div className="flex mb-2.5" data-section="header">
          <div
            className="bg-[#1e293b] text-[#e2e8f0] py-6 px-3.5 shrink-0 flex flex-col justify-center items-center"
            style={{ width: sidebarW }}
          >
            {avatar && (
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-[#38bdf8] shrink-0">
                <img src={avatar} alt="头像" className="w-full h-full object-cover" />
              </div>
            )}
            {nameField && (
              <div className="text-base font-semibold text-[#f1f5f9] text-center leading-tight">
                {nameField.value}
              </div>
            )}
          </div>
          <div className="flex-1 bg-[#f8fafc] min-w-0 py-4 px-4 flex flex-col justify-center">
            <div className="grid grid-cols-12 gap-x-3.5 gap-y-1 items-end">
              {otherFields.map((field) => {
                const w = clampWidth(field.width);
                return (
                  <div key={field.key} className="min-w-0" style={{ gridColumn: `span ${w}` }}>
                    <span className="text-[10px] text-[#94a3b8] block mb-px">
                      {field.label}
                    </span>
                    <span className="text-xs text-[#334155]">{field.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {markdown && (
        <MarkdownRenderer content={markdown} proseClass="prose prose-split" />
      )}
    </div>
  );
}
