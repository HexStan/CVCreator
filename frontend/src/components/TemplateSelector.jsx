import React from 'react';
import { getAllTemplates, getTemplateName } from '../templates/registry.js';

export default function TemplateSelector({ value, onChange }) {
  const templates = getAllTemplates();

  return (
    <select
      value={value || 'classic'}
      onChange={(e) => onChange(e.target.value)}
      style={{ fontSize: 12, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '3px', background: 'var(--surface)' }}
    >
      {templates.map((t) => (
        <option key={t.key} value={t.key}>{t.name}</option>
      ))}
    </select>
  );
}
