"use client";

import { Shape, Floor } from "@/types/types";
import { useRef } from "react";
import ShapeComponent from "./ShapeComponent";

interface CanvasSettings {
  backgroundColor: string;
}

interface CanvasProps {
  shapes: Shape[];
  settings: CanvasSettings;
  onUpdateShape: (shape: Shape) => void;
  onSelectShape: (shapeId: string, isShiftPressed: boolean) => void;
  onDeleteShape: (shapeId: string) => void;
  onDeleteVertex: (shapeId: string, vertexIndex: number) => void;
  floors: Floor[];
}

export default function Canvas({ shapes, settings, onUpdateShape, onSelectShape, onDeleteShape, onDeleteVertex, floors }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative w-[1000px] h-[700px] bg-transparent border border-gray-300 overflow-hidden"
      // Deseleccionar al hacer clic en el fondo
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const selected = shapes.find(s => s.selected);
          if (selected) onUpdateShape({ ...selected, selected: false });
        }
      }}
      style={{ backgroundColor: settings.backgroundColor }}
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
          floors={floors}
        />
      ))}
    </div>
  );
}
