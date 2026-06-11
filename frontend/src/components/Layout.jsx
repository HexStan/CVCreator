import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useResume } from '../contexts/ResumeContext.jsx';
import { useFonts } from '../utils/fonts.js';
import BasicInfoEditor from './Editor/BasicInfoEditor.jsx';
import RichTextEditor from './Editor/RichTextEditor.jsx';
import PreviewPanel from './Preview/PreviewPanel.jsx';
import FontManager from './FontManager.jsx';
import ExportToolbar from './Export/ExportToolbar.jsx';
import './Layout.css';

export default function Layout() {
  const { logout } = useAuth();
  const { saving, lastSave, resume, updateResume, updateTemplate, importData, saveNow } = useResume();
  const { fonts, reload: reloadFonts } = useFonts();
  const [splitPercent, setSplitPercent] = useState(45);
  const [dragging, setDragging] = useState(false);
  const [showFonts, setShowFonts] = useState(false);
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

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-title">简历制作</span>
        <div className="header-actions">
          <span className="save-status">
            {saving ? '保存中...' : (lastSave ? `已保存 ${new Date(lastSave).toLocaleTimeString()}` : '')}
          </span>
          <button className="btn-default btn-sm" onClick={() => setShowFonts(true)}>字体管理</button>
          <ExportToolbar />
          <button className="btn-default btn-sm" onClick={logout}>退出</button>
        </div>
      </header>
      <div
        ref={containerRef}
        className={`main-content${dragging ? ' dragging' : ''}`}
      >
        <div className="edit-panel" style={{ width: `${splitPercent}%` }}>
          <div className="edit-section">
            <h3 className="section-title">基本信息</h3>
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
          <div className="edit-section edit-section-grow">
            <h3 className="section-title">详细内容</h3>
            <RichTextEditor
              value={resume.data.markdown || ''}
              onChange={(markdown) => updateResume((prev) => ({
                ...prev,
                data: { ...prev.data, markdown },
              }))}
            />
          </div>
        </div>
        <div className="split-divider" onMouseDown={handleMouseDown}>
          <div className="split-handle" />
        </div>
        <div className="preview-panel" style={{ width: `${100 - splitPercent}%` }}>
          <PreviewPanel
            basicInfo={resume.data.basicInfo || {}}
            markdown={resume.data.markdown || ''}
            template={resume.template}
            fontFamily={resume.data.fontFamily || ''}
            fonts={fonts}
            onTemplateChange={updateTemplate}
            onFontFamilyChange={(fontFamily) => updateResume((prev) => ({
              ...prev,
              data: { ...prev.data, fontFamily },
            }))}
          />
        </div>
      </div>
      {showFonts && <FontManager onClose={() => { setShowFonts(false); reloadFonts(); }} />}
    </div>
  );
}
