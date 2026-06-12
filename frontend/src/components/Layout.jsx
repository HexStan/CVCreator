import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useResume } from '../contexts/ResumeContext.jsx';
import { useFonts, getCssFamily } from '../utils/fonts.js';
import BasicInfoEditor from './Editor/BasicInfoEditor.jsx';
import RichTextEditor from './Editor/RichTextEditor.jsx';
import PreviewPanel from './Preview/PreviewPanel.jsx';
import UserMenu from './UserMenu.jsx';

export default function Layout() {
  const { saving, lastSave, resume, updateResume, updateTemplate, importData, saveNow } = useResume();
  const { fonts, loaded: fontsLoaded } = useFonts();
  const [splitPercent, setSplitPercent] = useState(45);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.min(75, Math.max(20, pct)));
    };
    const handleMouseUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  const fontId = resume.data.fontFamily || '';
  const fontFamily = getCssFamily(fontId);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-12 px-4 bg-surface border-b border-border shrink-0">
        <span className="text-[15px] font-semibold text-primary">简历生成器</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary min-w-[80px]">
            {saving ? '保存中...' : (lastSave ? `已保存 ${new Date(lastSave).toLocaleTimeString()}` : '')}
          </span>
          <UserMenu />
        </div>
      </header>
      <div
        ref={containerRef}
        className={`flex flex-1 overflow-hidden${dragging ? ' cursor-col-resize select-none' : ''}`}
      >
        <div className="flex flex-col overflow-hidden border-r border-border bg-surface" style={{ width: `${splitPercent}%` }}>
          <div className="p-3 overflow-y-auto max-h-[50%]">
            <h3 className="text-[13px] font-semibold text-text-secondary mb-2.5 uppercase tracking-[0.5px]">基本信息</h3>
            <BasicInfoEditor
              fields={resume.data.basicInfo?.fields || []}
              avatar={resume.data.basicInfo?.avatar || ''}
              deletedPresetKeys={resume.data.basicInfo?.deletedPresetKeys || []}
              onChange={(basicInfo) => updateResume((prev) => ({
                ...prev,
                data: { ...prev.data, basicInfo },
              }))}
            />
          </div>
          <div className="flex-1 max-h-none p-3 overflow-y-auto border-t border-border">
            <h3 className="text-[13px] font-semibold text-text-secondary mb-2.5 uppercase tracking-[0.5px]">详细内容</h3>
            <RichTextEditor
              value={resume.data.markdown || ''}
              onChange={(markdown) => updateResume((prev) => ({
                ...prev,
                data: { ...prev.data, markdown },
              }))}
            />
          </div>
        </div>
        <div className="group w-1.5 bg-bg cursor-col-resize flex items-center justify-center shrink-0 hover:bg-primary transition-colors" onMouseDown={handleMouseDown}>
          <div className="w-0.5 h-8 bg-border rounded-sm group-hover:bg-white" />
        </div>
        <div className="overflow-auto bg-bg" style={{ width: `${100 - splitPercent}%` }}>
          <PreviewPanel
            basicInfo={resume.data.basicInfo || {}}
            markdown={resume.data.markdown || ''}
            template={resume.template}
            fontFamily={fontFamily}
            fontId={fontId}
            fonts={fonts}
            fontsLoaded={fontsLoaded}
            onTemplateChange={updateTemplate}
            onFontFamilyChange={(newFontId) => updateResume((prev) => ({
              ...prev,
              data: { ...prev.data, fontFamily: newFontId },
            }))}
          />
        </div>
      </div>
    </div>
  );
}
