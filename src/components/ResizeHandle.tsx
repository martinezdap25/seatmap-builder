"use client";

import React from "react";

interface ResizeHandleProps {
  position: string; // e.g., 'top-left', 'bottom-right'
  cursor: string; // e.g., 'cursor-nwse-resize'
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function ResizeHandle({ position, cursor, onMouseDown }: ResizeHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      className={`absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-sm ${position} ${cursor}`}
    />
  );
}