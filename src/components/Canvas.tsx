"use client";

import { Shape } from "@/types/types";
import ShapeComponent from "./ShapeComponent";

interface CanvasProps {
  shapes: Shape[];
  onUpdateShape: (shape: Shape) => void;
}

export default function Canvas({ shapes, onUpdateShape }: CanvasProps) {
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
    >
      {shapes.map((shape) => (
        <ShapeComponent
          key={shape.id}
          shape={shape}
          onUpdate={onUpdateShape}
          onSelect={(shapeId) => onUpdateShape({ ...shape, id: shapeId, selected: true })}
        />
      ))}
    </div>
  );
}
