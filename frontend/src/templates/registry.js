import React, { lazy } from 'react';

const templatesMap = {
  classic: {
    name: '经典',
    component: lazy(() => import('./Classic.jsx')),
    bodyClass: 'prose prose-classic',
    bodyStyle: {},
  },
  modern: {
    name: '现代',
    component: lazy(() => import('./Modern.jsx')),
    bodyClass: 'prose prose-modern',
    bodyStyle: {},
  },
  minimal: {
    name: '极简',
    component: lazy(() => import('./Minimal.jsx')),
    bodyClass: 'prose prose-minimal',
    bodyStyle: {},
  },
  split: {
    name: '双栏',
    component: lazy(() => import('./Split.jsx')),
    bodyClass: 'prose prose-split',
    bodyStyle: {},
  },
  lines: {
    name: '线条',
    component: lazy(() => import('./Lines.jsx')),
    bodyClass: 'prose prose-lines',
    bodyStyle: {},
  },
  bold: {
    name: '粗犷',
    component: lazy(() => import('./Bold.jsx')),
    bodyClass: 'prose prose-bold',
    bodyStyle: {},
  },
  zen: {
    name: '禅意',
    component: lazy(() => import('./Zen.jsx')),
    bodyClass: 'prose prose-zen',
    bodyStyle: {},
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
  return templatesMap[key]?.bodyClass || 'prose prose-classic';
}

export function getTemplateBodyStyle(key) {
  return templatesMap[key]?.bodyStyle || {};
}

export function getAllTemplates() {
  return Object.entries(templatesMap).map(([key, val]) => ({ key, name: val.name }));
}

export default templatesMap;
