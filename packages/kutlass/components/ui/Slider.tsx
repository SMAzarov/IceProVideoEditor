"use client";

import { InputHTMLAttributes } from "react";

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
  displayValue?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onValueChange,
  displayValue,
}: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-zinc-400">{label}</span>
          <span className="text-xs text-zinc-300 font-mono">
            {displayValue ?? value}
          </span>
        </div>
      )}
      <div className="relative h-4 flex items-center">
        <div className="absolute inset-x-0 h-1 rounded-full bg-zinc-700">
          <div
            className="h-full rounded-full bg-violet-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full opacity-0 h-4 cursor-pointer"
        />
        <div
          className="absolute w-3 h-3 rounded-full bg-white shadow-md pointer-events-none"
          style={{ left: `calc(${percent}% - 6px)` }}
        />
      </div>
    </div>
  );
}
