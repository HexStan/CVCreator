import React, { lazy } from 'react';

const templatesMap = {
  classic: {
    name: '经典',
    component: lazy(() => import('./Classic.jsx')),
    bodyClass: 'classic-body',
    bodyStyle: {},
  },
  modern: {
    name: '现代',
    component: lazy(() => import('./Modern.jsx')),
    bodyClass: 'modern-body',
    bodyStyle: { padding: '0 4px' },
  },
  minimal: {
    name: '极简',
    component: lazy(() => import('./Minimal.jsx')),
    bodyClass: 'minimal-body',
    bodyStyle: {},
  },
  split: {
    name: '双栏',
    component: lazy(() => import('./Split.jsx')),
    bodyClass: 'split-body',
    bodyStyle: { padding: '0 4px' },
  },
  lines: {
    name: '线条',
    component: lazy(() => import('./Lines.jsx')),
    bodyClass: 'lines-body',
    bodyStyle: { padding: '0 2px' },
  },
  bold: {
    name: '粗犷',
    component: lazy(() => import('./Bold.jsx')),
    bodyClass: 'bold-body',
    bodyStyle: { padding: '0 4px' },
  },
  zen: {
    name: '禅意',
    component: lazy(() => import('./Zen.jsx')),
    bodyClass: 'zen-body',
    bodyStyle: { padding: '0 6px' },
  },
};

export function getTemplate(key) {
  const t = templatesMap[key];
  if (!t) return templatesMap.classic.component;
  return t.component;
}

export function getTemplateName(key) {
  return templatesMap[key]?.name || '经典';
}

export function getTemplateBodyClass(key) {
  return templatesMap[key]?.bodyClass || 'classic-body';
}

export function getTemplateBodyStyle(key) {
  return templatesMap[key]?.bodyStyle || {};
}

export function getAllTemplates() {
  return Object.entries(templatesMap).map(([key, val]) => ({ key, name: val.name }));
}

export default templatesMap;
