"use client";

import { Shape } from "@/types/types";

interface CanvasProps {
  shapes: Shape[];
  onUpdateShape: (shape: Shape) => void;
}

export default function Canvas({ shapes, onUpdateShape }: CanvasProps) {
  const handleSelectShape = (shapeId: string) => {
    // Deselecciona todas las demás y selecciona la actual
    const updatedShapes = shapes.map((s) => ({
      ...s,
      selected: s.id === shapeId,
    }));
    // Para actualizar el estado, necesitamos llamar a una función que reemplace todo el array
    // Por ahora, lo manejaremos en el padre. Aquí solo notificamos el cambio.
    const selectedShape = updatedShapes.find((s) => s.id === shapeId);
    if (selectedShape) {
      onUpdateShape(selectedShape);
    }
  };

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
        <div
          key={shape.id}
          onClick={() => handleSelectShape(shape.id)}
          className={`absolute cursor-pointer ${shape.selected ? 'border-2 border-blue-500' : 'border border-gray-400'}`}
          style={{
            left: shape.x,
            top: shape.y,
            width: shape.width,
            height: shape.height,
            backgroundColor: 'rgba(0, 0, 255, 0.1)',
          }}
        />
      ))}
    </div>
  );
}
