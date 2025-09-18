"use client";

import { Shape } from "@/types/types";
import { useRef } from "react";
import ShapeComponent from "./ShapeComponent";

interface CanvasProps {
  shapes: Shape[];
  onUpdateShape: (shape: Shape) => void;
  onSelectShape: (shapeId: string) => void;
  onDeleteShape: (shapeId: string) => void;
  onDeleteVertex: (shapeId: string, vertexIndex: number) => void;
}

export default function Canvas({ shapes, onUpdateShape, onSelectShape, onDeleteShape, onDeleteVertex, }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative w-[1000px] h-[700px] bg-white border border-gray-300 overflow-hidden"
      // Deseleccionar al hacer clic en el fondo
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const selected = shapes.find(s => s.selected);
          if (selected) onUpdateShape({ ...selected, selected: false });
        }
      }}
      ref={canvasRef}
    >
      {shapes.map((shape) => (
        <ShapeComponent
          key={shape.id}
          shape={shape}
          onUpdate={onUpdateShape}
          canvasRef={canvasRef}
          onSelect={onSelectShape}
          onDelete={onDeleteShape}
          onDeleteVertex={onDeleteVertex}
        />
      ))}
    </div>
  );
}
