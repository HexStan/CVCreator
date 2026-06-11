import React, { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useResume } from '../../contexts/ResumeContext.jsx';
import { api } from '../../utils/api.js';
import pdfHtml from '../../utils/pdfHtml.js';
import './ExportToolbar.css';

const PAPER_SIZES = {
  A4: { width: 210, height: 297, label: 'A4' },
  Letter: { width: 215.9, height: 279.4, label: 'Letter' },
};

export default function ExportToolbar() {
  const { resume, importData, saveNow } = useResume();
  const [showMenu, setShowMenu] = useState(false);
  const [pdfSettingsOpen, setPdfSettingsOpen] = useState(false);
  const [pngSettingsOpen, setPngSettingsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleCloseMenu = () => setShowMenu(false);

  const handlePDF = useCallback(async (settings) => {
    setExporting(true);
    try {
      const mergedSettings = {
        ...settings,
        fontFamily: resume.data.fontFamily || '',
      };
      const { styles, content } = await pdfHtml.generate(resume.data, resume.template, mergedSettings);
      const blob = await api.export.pdf({
        html: content,
        styles,
        pageWidth: settings.pageWidth,
        pageHeight: settings.pageHeight,
        marginTop: settings.marginTop,
        marginBottom: settings.marginBottom,
        marginLeft: settings.marginLeft,
        marginRight: settings.marginRight,
        fontFamily: mergedSettings.fontFamily,
        fonts: [],
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('PDF 导出失败: ' + e.message);
    } finally {
      setExporting(false);
    }
  }, [resume.data, resume.template]);

  const handlePNG = useCallback(async (settings) => {
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const previewEl = document.querySelector('.preview-stage');
      if (!previewEl) {
        alert('未找到预览区域');
        return;
      }
      const canvas = await html2canvas(previewEl.firstElementChild || previewEl, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const margin = settings.margin || 0;
      const resultCanvas = document.createElement('canvas');
      resultCanvas.width = canvas.width + margin * 2;
      resultCanvas.height = canvas.height + margin * 2;
      const ctx = resultCanvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, resultCanvas.width, resultCanvas.height);
      ctx.drawImage(canvas, margin, margin);

      resultCanvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.png';
        a.click();
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (e) {
      alert('PNG 导出失败: ' + e.message);
    } finally {
      setExporting(false);
    }
  }, []);

  const handleJSON = useCallback(() => {
    const json = JSON.stringify(resume.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [resume.data]);

  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        importData(data);
      } catch (err) {
        alert('JSON 解析失败: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [importData]);

  return (
    <>
      <div className="export-toolbar-container">
        <button className="btn-primary btn-sm" onClick={() => setShowMenu(!showMenu)} disabled={exporting}>
          {exporting ? '导出中...' : '导出与导入 ▼'}
        </button>
        {showMenu && (
          <div className="export-menu">
            <button onClick={() => { setPdfSettingsOpen(true); handleCloseMenu(); }}>导出 PDF</button>
            <button onClick={() => { setPngSettingsOpen(true); handleCloseMenu(); }}>导出 PNG</button>
            <button onClick={() => { handleJSON(); handleCloseMenu(); }}>导出 JSON</button>
            <button onClick={() => { fileInputRef.current?.click(); handleCloseMenu(); }}>导入 JSON</button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
      </div>

      {pdfSettingsOpen && (
        <PDFSettingsModal
          onClose={() => setPdfSettingsOpen(false)}
          onExport={(settings) => { handlePDF(settings); setPdfSettingsOpen(false); }}
        />
      )}

      {pngSettingsOpen && (
        <PNGSettingsModal
          onClose={() => setPngSettingsOpen(false)}
          onExport={handlePNG}
        />
      )}
    </>
  );
}

function PDFSettingsModal({ onClose, onExport }) {
  const [paperKey, setPaperKey] = useState('A4');
  const [pageWidth, setPageWidth] = useState(210);
  const [pageHeight, setPageHeight] = useState(297);
  const [marginTop, setMarginTop] = useState(15);
  const [marginBottom, setMarginBottom] = useState(15);
  const [marginLeft, setMarginLeft] = useState(15);
  const [marginRight, setMarginRight] = useState(15);

  const handlePaperChange = (key) => {
    setPaperKey(key);
    if (key === 'custom') return;
    const sz = PAPER_SIZES[key];
    if (sz) {
      setPageWidth(sz.width);
      setPageHeight(sz.height);
    }
  };

  const handleExport = () => {
    onExport({
      pageWidth, pageHeight,
      marginTop, marginBottom, marginLeft, marginRight,
    });
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ width: 400 }}>
        <div className="modal-header">
          <h3>PDF 导出设置</h3>
          <button className="btn-default btn-sm" onClick={onClose}>关闭</button>
        </div>
        <div className="modal-body">
          <div className="export-form-group">
            <label>纸张尺寸</label>
            <select value={paperKey} onChange={(e) => handlePaperChange(e.target.value)}>
              {Object.entries(PAPER_SIZES).map(([k, sz]) => (
                <option key={k} value={k}>{sz.label} ({sz.width}×{sz.height}mm)</option>
              ))}
              <option value="custom">自定义</option>
            </select>
          </div>
          {paperKey === 'custom' && (
            <div className="export-form-row">
              <div className="export-form-group">
                <label>宽度 (mm)</label>
                <input type="number" value={pageWidth} onChange={(e) => setPageWidth(Number(e.target.value) || 210)} min="50" />
              </div>
              <div className="export-form-group">
                <label>高度 (mm)</label>
                <input type="number" value={pageHeight} onChange={(e) => setPageHeight(Number(e.target.value) || 297)} min="50" />
              </div>
            </div>
          )}
          <div className="export-form-group">
            <label>页边距 (mm)</label>
            <div className="margin-grid">
              <div className="margin-grid-row">
                <span className="margin-spacer" />
                <input type="number" value={marginTop} onChange={(e) => setMarginTop(Number(e.target.value) || 0)} min="0" style={{ width: 64 }} title="上边距" />
                <span className="margin-spacer" />
              </div>
              <div className="margin-grid-row">
                <input type="number" value={marginLeft} onChange={(e) => setMarginLeft(Number(e.target.value) || 0)} min="0" style={{ width: 64 }} title="左边距" />
                <span className="margin-middle">页面</span>
                <input type="number" value={marginRight} onChange={(e) => setMarginRight(Number(e.target.value) || 0)} min="0" style={{ width: 64 }} title="右边距" />
              </div>
              <div className="margin-grid-row">
                <span className="margin-spacer" />
                <input type="number" value={marginBottom} onChange={(e) => setMarginBottom(Number(e.target.value) || 0)} min="0" style={{ width: 64 }} title="下边距" />
                <span className="margin-spacer" />
              </div>
            </div>
          </div>
          <button className="btn-primary" onClick={handleExport} style={{ width: '100%', marginTop: 8 }}>导出 PDF</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PNGSettingsModal({ onClose, onExport }) {
  const [margin, setMargin] = useState(20);

  const handleExport = () => {
    onExport({ margin });
    onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content" style={{ width: 340 }}>
        <div className="modal-header">
          <h3>PNG 导出设置</h3>
          <button className="btn-default btn-sm" onClick={onClose}>关闭</button>
        </div>
        <div className="modal-body">
          <div className="export-form-group">
            <label>边距 (px)</label>
            <input type="number" value={margin} onChange={(e) => setMargin(Number(e.target.value) || 0)} min="0" />
          </div>
          <button className="btn-primary" onClick={handleExport} style={{ width: '100%', marginTop: 8 }}>导出 PNG</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
