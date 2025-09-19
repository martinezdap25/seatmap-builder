"use client";

import { DragInteractionHandler, ResizeInteractionHandler, RotateInteractionHandler } from "@/hooks/useInteraction";
import { Shape, Floor } from "@/types/types";
import { useRef } from "react";
import ShapeComponent from "./ShapeComponent";

interface CanvasSettings {
  backgroundColor: string;
  zoom: number;
}

interface CanvasProps {
  shapes: Shape[];
  settings: CanvasSettings;
  setShapes: (updater: (prev: Shape[]) => Shape[]) => void;
  onUpdateShape: (shape: Shape) => void;
  onUpdateDuringDrag: (shapes: Shape[]) => void;
  onSelectShape: (shapeId: string, isShiftPressed: boolean) => void;
  onDeleteShape: (shapeId: string) => void;
  onDeleteVertex: (shapeId: string, vertexIndex: number) => void;
  floors: Floor[];
  handleDrag: DragInteractionHandler;
  handleResize: ResizeInteractionHandler;
  handleRotate: RotateInteractionHandler;
  getSnapLines: (movingShape: Shape, staticShapes: Shape[]) => { x: number | null; y: number | null };
  clearGuides: () => void;
  getVertexSnap: (movingVertex: { x: number; y: number }, shapePosition: { x: number; y: number }, staticShapes: Shape[]) => { x: number; y: number };
  clearVertexSnapGuides: () => void;
}

export default function Canvas({ shapes, settings, setShapes, onUpdateShape, onUpdateDuringDrag, onSelectShape, onDeleteShape, onDeleteVertex, floors, handleDrag, handleResize, handleRotate, getSnapLines, clearGuides, getVertexSnap, clearVertexSnapGuides }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative w-[1000px] h-[700px] bg-transparent border border-gray-300 overflow-hidden"
      // Deseleccionar todo al hacer clic o doble clic en el fondo
      onDoubleClick={(e) => {
        if (e.target === e.currentTarget) {
          setShapes(prev =>
            prev.map(s => ({ ...s, selected: false, editingVertices: false }))
          );
        }
      }}
      style={{
        backgroundColor: settings.backgroundColor,
      }}
      ref={canvasRef}
    >
      {shapes.map((shape) => (
        <ShapeComponent
          key={shape.id}
          shape={shape}
          onUpdate={onUpdateShape}
          onUpdateDuringDrag={onUpdateDuringDrag}
          setShapes={setShapes}
          allShapes={shapes}
          canvasRef={canvasRef}
          onSelect={onSelectShape}
          onDelete={onDeleteShape}
          onDeleteVertex={onDeleteVertex}
          floors={floors}
          handleDrag={handleDrag}
          handleResize={handleResize}
          handleRotate={handleRotate}
          getSnapLines={getSnapLines}
          clearGuides={clearGuides}
          getVertexSnap={getVertexSnap}
          clearVertexSnapGuides={clearVertexSnapGuides}
        />
      ))}
    </div>
  );
}
