import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { clampWidth } from './presetFields.js';

marked.setOptions({ breaks: true, gfm: true });

function renderMarkdown(markdown) {
  if (!markdown) return '';
  const raw = marked.parse(markdown);
  return DOMPurify.sanitize(raw, { ADD_ATTR: ['target'] });
}

function splitByH1(markdown) {
  const headingRegex = /^(#{1}\s+[^\n]*)/gm;
  const splits = [];
  let lastIndex = 0;
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    splits.push({ start: lastIndex, end: match.index });
    lastIndex = match.index;
  }
  splits.push({ start: lastIndex, end: markdown.length });
  return splits.map((s) => markdown.slice(s.start, s.end).trim()).filter(Boolean);
}

function buildTemplateHTML(basicInfo, markdown, templateKey) {
  const basicInfoClean = {
    ...basicInfo,
    fields: basicInfo.fields || [],
    avatar: basicInfo.avatar || '',
  };

  let html = '';

  const sections = splitByH1(markdown);
  if (sections.length === 0) sections.push('');

  sections.forEach((section, i) => {
    if (i > 0) {
      html += '<div style="page-break-before: always;"></div>';
    }

    const sectionMarkdown = renderMarkdown(section);

    if (i === 0) {
      html += renderBasicInfo(basicInfoClean);
    }

    html += `<div class="markdown-body">${sectionMarkdown}</div>`;
  });

  if (basicInfoClean.avatar) {
    html = html.replace(/<img\s+src="data:image\/[^"]+"/g, (match) => match);
  }

  return html;
}

function renderBasicInfo(basicInfo) {
  const { avatar, fields } = basicInfo;
  if (!fields || fields.length === 0) return '';

  let html = '<div style="margin-bottom: 12px; padding-bottom: 10px; border-bottom: 2px solid #333; display: flex; gap: 14px; align-items: flex-start;">';

  if (avatar) {
    html += `<div style="width: 72px; height: 96px; flex-shrink: 0; border: 1px solid #ddd; overflow: hidden;">
      <img src="${avatar}" alt="avatar" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>`;
  }

  html += '<div style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 2px 8px; flex: 1;">';

  for (const field of fields) {
    if (!field.value && field.key !== 'name') continue;
    const isName = field.key === 'name';
    const w = clampWidth(field.width);
    html += `<div style="font-size: 12px; line-height: 1.5; grid-column: span ${w}; min-width: 0;">`;
    if (!isName) {
      html += `<span style="color: #888; margin-right: 4px;">${escapeHtml(field.label)}:</span>`;
    }
    if (isName) {
      html += `<span style="font-size: 24px; font-weight: 700; display: block; margin-bottom: 2px;">${escapeHtml(field.value)}</span>`;
    } else {
      html += `<span style="color: #333;">${escapeHtml(field.value)}</span>`;
    }
    html += '</div>';
  }

  html += '</div></div>';
  return html;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const MARKDOWN_CSS = `
.markdown-body { font-size: 13px; line-height: 1.6; color: #333; }
.markdown-body h1 { font-size: 18px; font-weight: 700; margin: 0 0 5px 0; padding-bottom: 3px; border-bottom: 2px solid #333; }
.markdown-body h2 { font-size: 15px; font-weight: 600; margin: 8px 0 4px 0; }
.markdown-body h3 { font-size: 14px; font-weight: 600; margin: 6px 0 3px 0; }
.markdown-body p { margin: 0 0 4px 0; }
.markdown-body ul, .markdown-body ol { margin: 2px 0; padding-left: 20px; }
.markdown-body li { margin-bottom: 1px; }
.markdown-body strong { font-weight: 600; }
.markdown-body a { color: #1677ff; text-decoration: none; }
.markdown-body hr { border: none; border-top: 1px solid #ddd; margin: 8px 0; }
.markdown-body blockquote { border-left: 3px solid #ddd; padding-left: 8px; color: #666; margin: 4px 0; }
.markdown-body code { background: #f5f5f5; padding: 1px 4px; border-radius: 3px; font-size: 12px; }
.markdown-body pre { background: #f5f5f5; padding: 8px; border-radius: 4px; overflow-x: auto; font-size: 12px; margin: 4px 0; }
.markdown-body pre code { background: none; padding: 0; }
.markdown-body table { border-collapse: collapse; width: 100%; margin: 4px 0; }
.markdown-body th, .markdown-body td { border: 1px solid #ddd; padding: 3px 6px; font-size: 12px; }
.markdown-body th { background: #f5f5f5; font-weight: 600; }
`;

async function generate(data, templateKey, settings) {
  const { basicInfo, markdown } = data;
  const fontFamily = settings?.fontFamily || '';
  const bodyHTML = buildTemplateHTML(basicInfo || {}, markdown || '', templateKey);
  const bodyStyle = fontFamily ? `body { margin: 0; padding: 0; font-family: "${fontFamily}", sans-serif; }` : 'body { margin: 0; padding: 0; }';

  const fullHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  ${MARKDOWN_CSS}
  ${bodyStyle}
</style>
</head>
<body>
  ${bodyHTML}
</body>
</html>`;

  return fullHTML;
}

export default { generate };
