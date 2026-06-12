import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo, Suspense } from 'react';
import { getTemplate, getAllTemplates, getTemplateBodyClass, getTemplateBodyStyle } from '../../templates/registry.js';
import { splitByPageBreak, autoPaginate } from '../../utils/autoPaginate.js';
import { exportPNG, exportPDF } from '../../utils/exportService.js';

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
  const [exporting, setExporting] = useState(false);
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

  const handleExport = useCallback(async () => {
    if (!containerRef.current) return;
    setExporting(true);
    try {
      if (paged) {
        await exportPDF(containerRef.current, size);
      } else {
        await exportPNG(containerRef.current);
      }
    } catch (e) {
      alert('导出失败: ' + e.message);
    } finally {
      setExporting(false);
    }
  }, [paged, size]);

  const marginPresetValue = customMargins ? -1 : margin;

  const TemplateComponent = getTemplate(template);

  const contentWidthPx = size.width * PX_PER_MM;
  const contentHeightPx = size.height * PX_PER_MM;

  const innerWidth = contentWidthPx - marginLeftVal * PX_PER_MM - marginRightVal * PX_PER_MM;

  const pagePadding = `${marginTopVal * PX_PER_MM}px ${marginRightVal * PX_PER_MM}px ${marginBottomVal * PX_PER_MM}px ${marginLeftVal * PX_PER_MM}px`;

  const pageStyle = {
    width: contentWidthPx,
    height: contentHeightPx,
    padding: pagePadding,
  };

  const scrollStyle = {
    width: contentWidthPx,
    minHeight: contentHeightPx,
    padding: pagePadding,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" ref={containerRef}>
      <div className="flex items-center gap-3 p-2 px-3 bg-surface border-b border-border shrink-0 flex-wrap">
        <div className="flex items-center gap-1">
          <label className="text-xs text-text-secondary whitespace-nowrap">样式</label>
          <select className="text-xs py-0.5 px-1.5 border border-border rounded-[3px] bg-surface" value={template || 'classic'} onChange={(e) => onTemplateChange?.(e.target.value)}>
            {getAllTemplates().map((t) => (
              <option key={t.key} value={t.key}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <label className="text-xs text-text-secondary whitespace-nowrap">纸张</label>
          <select className="text-xs py-0.5 px-1.5 border border-border rounded-[3px] bg-surface" value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
            {Object.entries(PAPER_SIZES).map(([key, sz]) => (
              <option key={key} value={key}>{sz.label} ({sz.width}×{sz.height}mm)</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <label className="text-xs text-text-secondary whitespace-nowrap">边距</label>
          <select className="text-xs py-0.5 px-1.5 border border-border rounded-[3px] bg-surface" value={marginPresetValue} onChange={handleMarginPresetChange}>
            {MARGIN_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
            <option value="-1">自定义...</option>
          </select>
        </div>
        {customMargins && (
          <div className="flex items-center gap-0.5">
            <label className="text-[11px] text-text-secondary">上</label><input type="number" className="w-[38px] text-[11px] py-0.5 px-1 border border-border rounded-[3px] text-center" value={marginTop} onChange={(e) => setMarginTop(Number(e.target.value) || 0)} min="0" step="1" size="3" />
            <label className="text-[11px] text-text-secondary">下</label><input type="number" className="w-[38px] text-[11px] py-0.5 px-1 border border-border rounded-[3px] text-center" value={marginBottom} onChange={(e) => setMarginBottom(Number(e.target.value) || 0)} min="0" step="1" size="3" />
            <label className="text-[11px] text-text-secondary">左</label><input type="number" className="w-[38px] text-[11px] py-0.5 px-1 border border-border rounded-[3px] text-center" value={marginLeft} onChange={(e) => setMarginLeft(Number(e.target.value) || 0)} min="0" step="1" size="3" />
            <label className="text-[11px] text-text-secondary">右</label><input type="number" className="w-[38px] text-[11px] py-0.5 px-1 border border-border rounded-[3px] text-center" value={marginRight} onChange={(e) => setMarginRight(Number(e.target.value) || 0)} min="0" step="1" size="3" />
            <span className="text-[10px] text-text-secondary">mm</span>
          </div>
        )}
        {fonts.length > 0 && (
          <div className="flex items-center gap-1">
            <label className="text-xs text-text-secondary whitespace-nowrap">字体</label>
            <select className="text-xs py-0.5 px-1.5 border border-border rounded-[3px] bg-surface" value={fontId} onChange={(e) => onFontFamilyChange?.(e.target.value)}>
              <option value="">默认</option>
              {fonts.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>
        )}
         <div className="flex items-center gap-1">
           <label className="text-xs text-text-secondary whitespace-nowrap">类型</label>
           <select className="text-xs py-0.5 px-1.5 border border-border rounded-[3px] bg-surface" value={paged ? 'paged' : 'scroll'} onChange={(e) => setPaged(e.target.value === 'paged')}>
             <option value="paged">PDF（分页）</option>
             <option value="scroll">PNG（单图）</option>
           </select>
         </div>
        <div className="flex items-center gap-1">
          <button className="btn-primary btn-sm" onClick={handleExport} disabled={exporting}>
            {exporting ? '导出中...' : '导出'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-5" data-section="preview-stage">
        <div className="flex flex-col items-center" data-section="preview-stage-inner" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
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
            templateKey={template}
          />
        ) : (
          <div className="bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)] mb-0 overflow-hidden box-border" data-section="preview-page" style={scrollStyle}>
            <TemplateComponent basicInfo={basicInfo} markdown={markdown} innerWidth={innerWidth} fontFamily={fontFamily} />
          </div>
        )}
        </Suspense>
        </div>
      </div>
    </div>
  );
}

function PagedPreview({ pageStyle, basicInfo, markdown, TemplateComponent, innerWidth, fontFamily, paperHeight, marginTopPx, marginBottomPx, templateKey }) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const firstPageRef = useRef(null);

  const pageContentHeight = paperHeight - marginTopPx - marginBottomPx;
  const firstPageContentHeight = Math.max(0, pageContentHeight - headerHeight);

  const bodyClass = useMemo(() => getTemplateBodyClass(templateKey), [templateKey]);
  const bodyStyle = useMemo(() => getTemplateBodyStyle(templateKey), [templateKey]);

  useLayoutEffect(() => {
    const pageEl = firstPageRef.current;
    if (!pageEl) return;
    const headerEl = pageEl.querySelector('[data-section="header"]');
    if (!headerEl) return;
    const h = headerEl.offsetHeight;
    setHeaderHeight((prev) => (Math.abs(h - prev) > 0.5 ? h : prev));
  }, [basicInfo, templateKey, innerWidth, fontFamily]);

  const pages = useMemo(() => {
    const sections = splitByPageBreak(markdown);
    const result = [];
    for (let i = 0; i < sections.length; i++) {
      const sectionPages = autoPaginate(
        sections[i],
        pageContentHeight,
        innerWidth,
        i === 0 ? firstPageContentHeight : null,
        fontFamily,
        bodyClass,
        bodyStyle
      );
      if (i === 0) {
        result.push(...sectionPages);
      } else {
        result.push(...sectionPages.filter((p) => p.trim()));
      }
    }
    return result.length > 0 ? result : [''];
  }, [markdown, pageContentHeight, innerWidth, firstPageContentHeight, fontFamily, bodyClass, bodyStyle]);

  const headerMarkdown = pages[0];
  const bodyPages = pages.length > 1 ? pages.slice(1) : [];

  return (
    <>
      <div className="bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)] mb-0 overflow-hidden box-border" data-section="preview-page" ref={firstPageRef} style={pageStyle}>
        <TemplateComponent
          basicInfo={basicInfo}
          markdown={headerMarkdown}
          innerWidth={innerWidth}
          fontFamily={fontFamily}
        />
      </div>
      {bodyPages.map((pageContent, i) => (
        <div key={i} className="bg-white shadow-[0_2px_12px_rgba(0,0,0,0.1)] mb-0 overflow-hidden box-border border-t-2 border-dashed border-border mt-4" data-section="preview-page" style={pageStyle}>
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
