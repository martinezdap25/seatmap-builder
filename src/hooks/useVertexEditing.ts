import { Shape } from "@/types/types";
import React, { useState, useEffect } from "react";

interface VertexEditingParams {
  shape: Shape;
  onUpdate: (shape: Shape) => void;
  onDeleteVertex: (shapeId: string, vertexIndex: number) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function useVertexEditing({ shape, onUpdate, onDeleteVertex, canvasRef }: VertexEditingParams) {
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);

  const handleVertexMouseDown = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    setSelectedVertexIndex(index);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!shape.vertices || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseX = moveEvent.clientX - canvasRect.left;
      const mouseY = moveEvent.clientY - canvasRect.top;

      const newVertexPos = {
        x: mouseX - shape.x,
        y: mouseY - shape.y,
      };

      const newVertices = [...shape.vertices];
      newVertices[index] = newVertexPos;

      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      newVertices.forEach(v => {
        minX = Math.min(minX, v.x);
        minY = Math.min(minY, v.y);
        maxX = Math.max(maxX, v.x);
        maxY = Math.max(maxY, v.y);
      });

      const newShapeX = shape.x + minX;
      const newShapeY = shape.y + minY;
      const newWidth = maxX - minX;
      const newHeight = maxY - minY;

      const updatedVertices = newVertices.map(v => ({ x: v.x - minX, y: v.y - minY }));

      onUpdate({ ...shape, x: newShapeX, y: newShapeY, width: newWidth, height: newHeight, vertices: updatedVertices });
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