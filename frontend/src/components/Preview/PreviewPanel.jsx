import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo, Suspense } from 'react';
import { getTemplate, getAllTemplates } from '../../templates/registry.js';
import { splitByPageBreak } from '../../utils/pdfHtml.js';
import { autoPaginate } from '../../utils/autoPaginate.js';
import './PreviewPanel.css';

const PAPER_SIZES = {
  A4: { width: 210, height: 297, label: 'A4' },
  Letter: { width: 215.9, height: 279.4, label: 'Letter' },
};

const MARGIN_PRESETS = [
  { value: 10, label: '小 (10mm)' },
  { value: 15, label: '中 (15mm)' },
  { value: 20, label: '大 (20mm)' },
  { value: 25, label: '特大 (25mm)' },
];

const MARGIN_CUSTOM = { value: 0, label: '自定义...' };

const PX_PER_MM = 3.779527559;

export default function PreviewPanel({ basicInfo, markdown, template, fontFamily, fontId, fonts, fontsLoaded, onFontFamilyChange, onTemplateChange }) {
  const [paperSize, setPaperSize] = useState('A4');
  const [margin, setMargin] = useState(15);
  const [marginTop, setMarginTop] = useState(15);
  const [marginBottom, setMarginBottom] = useState(15);
  const [marginLeft, setMarginLeft] = useState(15);
  const [marginRight, setMarginRight] = useState(15);
  const [paged, setPaged] = useState(true);
  const [customMargins, setCustomMargins] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);

  const size = PAPER_SIZES[paperSize] || PAPER_SIZES.A4;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const availWidth = containerRef.current.clientWidth - 40;
      const contentWidth = size.width * PX_PER_MM + 2;
      const s = Math.min(1, availWidth / contentWidth);
      setScale(s);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [size.width]);

  const marginTopVal = customMargins ? marginTop : margin;
  const marginBottomVal = customMargins ? marginBottom : margin;
  const marginLeftVal = customMargins ? marginLeft : margin;
  const marginRightVal = customMargins ? marginRight : margin;

  const handleMarginPresetChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val === -1) {
      setCustomMargins(true);
    } else {
      setCustomMargins(false);
      setMargin(val);
    }
  };

  const marginPresetValue = customMargins ? -1 : margin;

  const TemplateComponent = getTemplate(template);

  const contentWidthPx = size.width * PX_PER_MM;
  const contentHeightPx = size.height * PX_PER_MM;

  const innerWidth = contentWidthPx - marginLeftVal * PX_PER_MM - marginRightVal * PX_PER_MM;

  const pageStyle = {
    width: contentWidthPx,
    minHeight: contentHeightPx,
    padding: `${marginTopVal * PX_PER_MM}px ${marginRightVal * PX_PER_MM}px ${marginBottomVal * PX_PER_MM}px ${marginLeftVal * PX_PER_MM}px`,
  };

  return (
    <div className="preview-panel-root" ref={containerRef}>
      <div className="preview-toolbar">
        <div className="preview-control-group">
          <label>样式</label>
          <select value={template || 'classic'} onChange={(e) => onTemplateChange?.(e.target.value)}>
            {getAllTemplates().map((t) => (
              <option key={t.key} value={t.key}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="preview-control-group">
          <label>纸张</label>
          <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
            {Object.entries(PAPER_SIZES).map(([key, sz]) => (
              <option key={key} value={key}>{sz.label} ({sz.width}×{sz.height}mm)</option>
            ))}
          </select>
        </div>
        <div className="preview-control-group">
          <label>边距</label>
          <select value={marginPresetValue} onChange={handleMarginPresetChange}>
            {MARGIN_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
            <option value="-1">自定义...</option>
          </select>
        </div>
        {customMargins && (
          <div className="preview-custom-margins">
            <label>上</label><input type="number" value={marginTop} onChange={(e) => setMarginTop(Number(e.target.value) || 0)} min="0" step="1" size="3" />
            <label>下</label><input type="number" value={marginBottom} onChange={(e) => setMarginBottom(Number(e.target.value) || 0)} min="0" step="1" size="3" />
            <label>左</label><input type="number" value={marginLeft} onChange={(e) => setMarginLeft(Number(e.target.value) || 0)} min="0" step="1" size="3" />
            <label>右</label><input type="number" value={marginRight} onChange={(e) => setMarginRight(Number(e.target.value) || 0)} min="0" step="1" size="3" />
            <span className="margin-unit">mm</span>
          </div>
        )}
        <div className="preview-control-group">
          <label>模式</label>
          <select value={paged ? 'paged' : 'scroll'} onChange={(e) => setPaged(e.target.value === 'paged')}>
            <option value="paged">分页</option>
            <option value="scroll">连续</option>
          </select>
        </div>
        {fonts.length > 0 && (
          <div className="preview-control-group">
            <label>字体</label>
            <select value={fontId} onChange={(e) => onFontFamilyChange?.(e.target.value)}>
              <option value="">默认</option>
              {fonts.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="preview-stage">
        <div className="preview-stage-inner" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        <Suspense fallback={<div style={{ padding: 20 }}>加载模板...</div>}>
        {paged ? (
          <PagedPreview
            pageStyle={pageStyle}
            basicInfo={basicInfo}
            markdown={markdown}
            TemplateComponent={TemplateComponent}
            innerWidth={innerWidth}
            fontFamily={fontFamily}
            paperHeight={size.height * PX_PER_MM}
            marginTopPx={marginTopVal * PX_PER_MM}
            marginBottomPx={marginBottomVal * PX_PER_MM}
            marginLeftPx={marginLeftVal * PX_PER_MM}
            marginRightPx={marginRightVal * PX_PER_MM}
          />
        ) : (
          <div className="preview-page" style={pageStyle}>
            <TemplateComponent basicInfo={basicInfo} markdown={markdown} innerWidth={innerWidth} fontFamily={fontFamily} />
          </div>
        )}
        </Suspense>
        </div>
      </div>
    </div>
  );
}

function PagedPreview({ pageStyle, basicInfo, markdown, TemplateComponent, innerWidth, fontFamily, paperHeight, marginTopPx, marginBottomPx }) {
  const explicitPages = useMemo(() => splitByPageBreak(markdown), [markdown]);
  const [autoPages, setAutoPages] = useState(null);

  const needsAuto = explicitPages.length === 1 && markdown && markdown.trim();

  const pageContentHeight = paperHeight - marginTopPx - marginBottomPx;

  useLayoutEffect(() => {
    if (!needsAuto) {
      setAutoPages(null);
      return;
    }
    const pages = autoPaginate(markdown, pageContentHeight, innerWidth);
    setAutoPages(pages);
  }, [markdown, pageContentHeight, innerWidth, needsAuto]);

  const pages = needsAuto && autoPages ? autoPages : explicitPages;

  const headerMarkdown = pages[0];
  const bodyPages = pages.length > 1 ? pages.slice(1) : [];

  return (
    <>
      <div className="preview-page" style={pageStyle}>
        <TemplateComponent
          basicInfo={basicInfo}
          markdown={headerMarkdown}
          innerWidth={innerWidth}
          fontFamily={fontFamily}
        />
      </div>
      {bodyPages.map((pageContent, i) => (
        <div key={i} className="preview-page preview-page-break" style={pageStyle}>
          <TemplateComponent
            basicInfo={basicInfo}
            markdown={pageContent}
            innerWidth={innerWidth}
            fontFamily={fontFamily}
            hideBasicInfo
          />
        </div>
      ))}
    </>
  );
}
