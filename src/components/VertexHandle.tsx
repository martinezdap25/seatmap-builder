"use client";

import React from "react";

interface VertexHandleProps {
  x: number;
  y: number;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function VertexHandle({ x, y, isSelected, onMouseDown, onClick }: VertexHandleProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      onClick={onClick}
      className={`absolute w-3 h-3 rounded-full cursor-pointer ${isSelected ? 'bg-blue-500 border-2 border-white ring-2 ring-blue-500' : 'bg-white border-2 border-blue-500'}`}
      style={{ left: x - 6, top: y - 6 }} // Centrar el manejador en el vértice
    />
  );
}