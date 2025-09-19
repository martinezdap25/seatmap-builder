/* eslint-disable @typescript-eslint/no-explicit-any */
import { Shape } from "@/types/types";
import React, { useState, useEffect } from "react";
import { useVertexSnapping } from "./useVertexSnapping";

interface VertexEditingParams {
  shape: Shape;
  allShapes: Shape[];
  onUpdate: (shape: Shape) => void;
  onDeleteVertex: (shapeId: string, vertexIndex: number) => void;
  canvasRef: React.RefObject<any>;
}

export function useVertexEditing({ shape, allShapes, onUpdate, onDeleteVertex, canvasRef }: VertexEditingParams) {
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);

  const handleVertexMouseDown = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    setSelectedVertexIndex(index);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!shape.vertices || !canvasRef.current) return;

      const stage = canvasRef.current;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const newVertices = [...shape.vertices];
      newVertices[index] = { x: pointer.x - shape.x, y: pointer.y - shape.y };

      // Simplemente actualizamos los vértices. El componente se encargará de redibujar el SVG.
      onUpdate({ ...shape, vertices: newVertices });
    };

    const handleMouseUp = () => {
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