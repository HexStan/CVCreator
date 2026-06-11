import React, { useState, useCallback, useRef, useMemo } from 'react';
import AvatarUploader from './AvatarUploader.jsx';
import FieldItem from './FieldItem.jsx';
import { WIDTH_GEARS, ALL_PRESET_KEYS, getPresetField, clampWidth } from '../../utils/presetFields.js';
import './BasicInfoEditor.css';

export default function BasicInfoEditor({ fields, avatar, deletedPresetKeys, onChange }) {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const dragNode = useRef(null);
  const dragOverIndex = useRef(null);
  const moved = useRef(false);

  const updateField = useCallback((index, updater) => {
    const next = [...fields];
    next[index] = typeof updater === 'function' ? updater(next[index]) : updater;
    onChange({ fields: next, avatar, deletedPresetKeys });
  }, [fields, avatar, deletedPresetKeys, onChange]);

  const removeField = useCallback((index) => {
    const field = fields[index];
    const nextFields = fields.filter((_, i) => i !== index);
    const isPreset = ALL_PRESET_KEYS.includes(field.key);
    const nextDeleted = isPreset ? [...new Set([...deletedPresetKeys, field.key])] : deletedPresetKeys;
    onChange({ fields: nextFields, avatar, deletedPresetKeys: nextDeleted });
  }, [fields, avatar, deletedPresetKeys, onChange]);

  const addField = useCallback((key) => {
    if (key) {
      const preset = getPresetField(key);
      if (preset) {
        const nextFields = [...fields, { key: preset.key, label: preset.label, value: preset.defaultValue, width: preset.width }];
        const nextDeleted = deletedPresetKeys.filter((k) => k !== key);
        onChange({ fields: nextFields, avatar, deletedPresetKeys: nextDeleted });
      }
    } else {
      const key = `custom_${Date.now()}`;
      onChange({ fields: [...fields, { key, label: '新字段', value: '', width: 6 }], avatar, deletedPresetKeys });
    }
  }, [fields, avatar, deletedPresetKeys, onChange]);

  const moveField = useCallback((from, to) => {
    const next = [...fields];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange({ fields: next, avatar, deletedPresetKeys });
    setDraggingIndex(null);
  }, [fields, avatar, deletedPresetKeys, onChange]);

  const handleDragStart = (e, index) => {
    moved.current = false;
    setDraggingIndex(index);
    dragNode.current = e.currentTarget.closest('.field-item');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    setTimeout(() => {
      if (dragNode.current) dragNode.current.style.opacity = '0.4';
    }, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dragOverIndex.current = index;
  };

  const handleDragEnd = () => {
    if (dragNode.current) dragNode.current.style.opacity = '1';
    const from = draggingIndex;
    const to = dragOverIndex.current;
    if (from !== null && to !== null && from !== to && moved.current) {
      moveField(from, to);
    }
    setDraggingIndex(null);
    dragOverIndex.current = null;
    moved.current = false;
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    moved.current = true;
    const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(from) && from !== index) {
      moveField(from, index);
    }
  };

  const handleAvatarChange = useCallback((newAvatar) => {
    onChange({ fields, avatar: newAvatar, deletedPresetKeys });
  }, [fields, deletedPresetKeys, onChange]);

  const handleWidthChange = useCallback((index, width) => {
    updateField(index, (f) => ({ ...f, width }));
  }, [updateField]);

  const handleLabelChange = useCallback((index, label) => {
    updateField(index, (f) => ({ ...f, label }));
  }, [updateField]);

  const handleValueChange = useCallback((index, value) => {
    updateField(index, (f) => ({ ...f, value }));
  }, [updateField]);

  const availablePresets = deletedPresetKeys.filter((k) => ALL_PRESET_KEYS.includes(k));
  const hasDeletedPresets = availablePresets.length > 0;

  const layoutRows = useMemo(() => {
    const rows = [];
    let currentRow = [];
    let used = 0;
    for (const f of fields) {
      const w = clampWidth(f.width);
      if (used + w > 12 && currentRow.length > 0) {
        rows.push(currentRow);
        currentRow = [];
        used = 0;
      }
      currentRow.push(w);
      used += w;
    }
    if (currentRow.length > 0) rows.push(currentRow);
    return rows;
  }, [fields]);

  return (
    <div className="basic-info-editor">
      <AvatarUploader value={avatar} onChange={handleAvatarChange} />

      <div className="fields-list">
        {fields.map((field, index) => (
          <FieldItem
            key={field.key}
            field={field}
            index={index}
            widthGeaars={WIDTH_GEARS}
            onLabelChange={(v) => handleLabelChange(index, v)}
            onValueChange={(v) => handleValueChange(index, v)}
            onWidthChange={(v) => handleWidthChange(index, v)}
            onRemove={() => removeField(index)}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            isDragging={draggingIndex === index}
          />
        ))}
      </div>

      <div className="layout-preview-bar">
        <span className="layout-preview-label">排版预览</span>
        <div className="layout-preview-grid">
          {layoutRows.map((row, ri) => (
            <div key={ri} className="layout-preview-row">
              {row.map((colW, ci) => (
                <div
                  key={ci}
                  className="layout-preview-cell"
                  style={{ width: `${(colW / 12) * 100}%` }}
                  title={`${colW}/12`}
                />
              ))}
            </div>
          ))}
          {layoutRows.length === 0 && (
            <div className="layout-preview-empty">暂无字段</div>
          )}
        </div>
      </div>

      <div className="add-field-area">
        <div className="add-field-row">
          <button className="btn-default btn-sm" onClick={() => addField(null)}>+ 添加字段</button>
          {hasDeletedPresets && (
            <select
              className="preset-select"
              value=""
              onChange={(e) => { if (e.target.value) addField(e.target.value); e.target.value = ''; }}
            >
              <option value="">恢复预置字段...</option>
              {availablePresets.map((key) => (
                <option key={key} value={key}>{getPresetField(key)?.label || key}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
