import React, { useRef } from 'react';
import { getGearIndex, findGear, clampWidth } from '../../utils/presetFields.js';

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
      className={`flex items-center gap-1.5 py-1.5 px-2 bg-lightest-gray border border-border rounded-md hover:bg-highlight-blue hover:border-primary-hover transition-[background,opacity,box-shadow]${isDragging ? ' opacity-40 shadow-[0_4px_12px_rgba(0,0,0,0.15)]' : ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <span
        className="shrink-0 text-sm text-text-secondary cursor-grab px-0.5 select-none active:cursor-grabbing"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        title="拖动排序"
      >
        &#9776;
      </span>
      <div className="flex-1 flex gap-1 min-w-0">
        <input
          ref={labelRef}
          className="w-[60px] shrink-0 py-0.5 px-1.5 border border-border rounded-[3px] text-xs outline-none bg-white focus:border-primary"
          value={field.label}
          onChange={(e) => onLabelChange(e.target.value)}
          onKeyDown={handleLabelKeyDown}
          placeholder="字段名"
          title="字段名称（可编辑）"
        />
        <input
          className="flex-1 min-w-0 py-0.5 px-1.5 border border-border rounded-[3px] text-xs outline-none bg-white focus:border-primary"
          value={field.value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="值"
        />
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <input
          type="range"
          min={0}
          max={widthGeaars.length - 1}
          step={1}
          value={gearIdx}
          onChange={handleSliderChange}
          className="range-slider"
          title={`宽度: ${gear.label}`}
        />
        <span className="text-[10px] text-text-secondary min-w-[26px] text-center font-semibold">{gear.label}</span>
      </div>
      <button className="btn-danger btn-sm shrink-0 py-0.5 px-1.5 text-[11px]" onClick={onRemove} title="删除字段">&#10005;</button>
    </div>
  );
}
