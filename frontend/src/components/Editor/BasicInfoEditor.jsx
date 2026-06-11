import React, { useState, useCallback, useRef } from 'react';
import { useResume } from '../../contexts/ResumeContext.jsx';
import AvatarUploader from './AvatarUploader.jsx';
import FieldItem from './FieldItem.jsx';
import { PRESET_FIELDS, ALL_PRESET_KEYS, getPresetField } from '../../utils/presetFields.js';
import './BasicInfoEditor.css';

const WIDTH_GEARS = [
  { value: 1, label: '1/4', pct: 25 },
  { value: 2, label: '1/2', pct: 50 },
  { value: 3, label: '3/4', pct: 75 },
  { value: 4, label: '1/1', pct: 100 },
];

export default function BasicInfoEditor({ fields, avatar, deletedPresetKeys, onChange }) {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const dragNode = useRef(null);
  const dragOverIndex = useRef(null);

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
      onChange({ fields: [...fields, { key, label: '新字段', value: '', width: 2 }], avatar, deletedPresetKeys });
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
    setDraggingIndex(index);
    dragNode.current = e.currentTarget;
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
    if (from !== null && to !== null && from !== to) {
      moveField(from, to);
    }
    setDraggingIndex(null);
    dragOverIndex.current = null;
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
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
