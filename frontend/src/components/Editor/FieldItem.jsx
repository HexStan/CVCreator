import React, { useRef } from 'react';
import './FieldItem.css';

export default function FieldItem({
  field, index, widthGeaars,
  onLabelChange, onValueChange, onWidthChange, onRemove,
  onDragStart, onDragOver, onDrop, onDragEnd, isDragging,
}) {
  const labelRef = useRef(null);

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (labelRef.current) labelRef.current.blur();
    }
  };

  return (
    <div
      className={`field-item${isDragging ? ' dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <span className="field-drag-handle" title="拖动排序">&#9776;</span>
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
          min={1}
          max={widthGeaars.length}
          step={1}
          value={field.width}
          onChange={(e) => onWidthChange(parseInt(e.target.value, 10))}
          className="width-slider"
          title={`宽度: ${widthGeaars[field.width - 1]?.label || '1/4'}`}
        />
        <span className="width-label">{widthGeaars[field.width - 1]?.label || '1/4'}</span>
      </div>
      <button className="btn-danger btn-sm field-remove-btn" onClick={onRemove} title="删除字段">&#10005;</button>
    </div>
  );
}
