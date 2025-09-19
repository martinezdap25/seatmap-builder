import { Shape } from "@/types/types";
import React, { useState, useEffect } from "react";
import { useVertexSnapping } from "./useVertexSnapping";

interface VertexEditingParams {
  shape: Shape;
  allShapes: Shape[];
  onUpdate: (shape: Shape) => void;
  onDeleteVertex: (shapeId: string, vertexIndex: number) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  getVertexSnap: (movingVertex: { x: number; y: number }, shapePosition: { x: number; y: number }, staticShapes: Shape[]) => { x: number; y: number };
  clearVertexSnapGuides: () => void;
}

export function useVertexEditing({ shape, allShapes, onUpdate, onDeleteVertex, canvasRef, getVertexSnap, clearVertexSnapGuides }: VertexEditingParams) {
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);

  const handleVertexMouseDown = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    setSelectedVertexIndex(index);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!shape.vertices || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseX = moveEvent.clientX - canvasRect.left;
      const mouseY = moveEvent.clientY - canvasRect.top;

      let newVertexPos = {
        x: mouseX - shape.x,
        y: mouseY - shape.y,
      };

      // Aplicar snapping
      const staticShapes = allShapes.filter(s => s.id !== shape.id || (s.vertices && s.vertices.length > 1));
      const snappedPos = getVertexSnap(newVertexPos, { x: shape.x, y: shape.y }, staticShapes);
      newVertexPos = snappedPos;

      const newVertices = [...shape.vertices];
      newVertices[index] = newVertexPos;

      // Simplemente actualizamos los vértices. El componente se encargará de redibujar el SVG.
      onUpdate({ ...shape, vertices: newVertices });
    };

    const handleMouseUp = () => {
      clearVertexSnapGuides();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleSegmentClick = (e: React.MouseEvent<SVGPathElement>, index: number) => {
    e.stopPropagation();
    if (!shape.vertices || !shape.editingVertices) return;

    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const newVertex = { x: svgP.x, y: svgP.y };

    const newVertices = [...shape.vertices];
    newVertices.splice(index + 1, 0, newVertex);
    onUpdate({ ...shape, vertices: newVertices });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && shape.editingVertices) {
      onUpdate({ ...shape, editingVertices: false, selected: true });
      setSelectedVertexIndex(null);
    }
    if (e.key === 'Delete' && shape.editingVertices && selectedVertexIndex !== null) {
      onDeleteVertex(shape.id, selectedVertexIndex);
      setSelectedVertexIndex(null);
    }
  };

  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => handleKeyDown(e);
    if (shape.editingVertices) {
      window.addEventListener('keydown', keydownListener);
    }
    return () => {
      window.removeEventListener('keydown', keydownListener);
    };
  }, [shape.editingVertices, selectedVertexIndex, shape, onUpdate, onDeleteVertex]);

  return {
    selectedVertexIndex,
    setSelectedVertexIndex,
    handleVertexMouseDown,
    handleSegmentClick,
  };
}