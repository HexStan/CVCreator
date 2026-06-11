import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function MarkdownRenderer({ content }) {
  const html = useMemo(() => {
    if (!content) return '';
    const raw = marked.parse(content);
    return DOMPurify.sanitize(raw, { ADD_ATTR: ['target'] });
  }, [content]);

  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
