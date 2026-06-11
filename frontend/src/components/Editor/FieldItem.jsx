import React, { useRef } from 'react';
import { getGearIndex, findGear, clampWidth } from '../../utils/presetFields.js';
import './FieldItem.css';

export default function FieldItem({
  field, index, widthGeaars,
  onLabelChange, onValueChange, onWidthChange, onRemove,
  onDragStart, onDragOver, onDrop, onDragEnd, isDragging,
}) {
  const labelRef = useRef(null);
  const gear = findGear(clampWidth(field.width));
  const gearIdx = getGearIndex(clampWidth(field.width));

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (labelRef.current) labelRef.current.blur();
    }
  };

  const handleSliderChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    const g = widthGeaars[idx];
    if (g) onWidthChange(g.col);
  };

  return (
    <div
      className={`field-item${isDragging ? ' dragging' : ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <span
        className="field-drag-handle"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        title="拖动排序"
      >
        &#9776;
      </span>
      <div className="field-inputs">
        <input
          ref={labelRef}
          className="field-label-input"
          value={field.label}
          onChange={(e) => onLabelChange(e.target.value)}
          onKeyDown={handleLabelKeyDown}
          placeholder="字段名"
          title="字段名称（可编辑）"
        />
        <input
          className="field-value-input"
          value={field.value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="值"
        />
      </div>
      <div className="field-width-control">
        <input
          type="range"
          min={0}
          max={widthGeaars.length - 1}
          step={1}
          value={gearIdx}
          onChange={handleSliderChange}
          className="width-slider"
          title={`宽度: ${gear.label}`}
        />
        <span className="width-label">{gear.label}</span>
      </div>
      <button className="btn-danger btn-sm field-remove-btn" onClick={onRemove} title="删除字段">&#10005;</button>
    </div>
  );
}
