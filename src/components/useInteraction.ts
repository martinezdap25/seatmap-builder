import { Shape } from "@/types/types";
import React from "react";

export type DragInteractionHandler = (
  e: React.MouseEvent<HTMLDivElement>,
  shape: Shape,
  allShapes: Shape[],
  setShapes: (updater: (prev: Shape[]) => Shape[]) => void,
  onUpdateDuringDrag: (shapes: Shape[]) => void,
  getSnapLines: (movingShape: Shape, staticShapes: Shape[]) => { x: number | null; y: number | null },
  clearGuides: () => void
) => void;

export type RotateInteractionHandler = (
    e: React.MouseEvent<HTMLDivElement>,
    shape: Shape,
    onUpdate: (shape: Shape) => void
  ) => void;

export type ResizeInteractionHandler = (
  e: React.MouseEvent<HTMLDivElement>,
  shape: Shape,
  onUpdate: (shape: Shape) => void,
  handlePosition: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
) => void;

interface InteractionParams {
  getSnapLines: (movingShape: Shape, staticShapes: Shape[]) => { x: number | null; y: number | null };
  clearGuides: () => void;
}

export function useInteraction({ getSnapLines, clearGuides }: InteractionParams) {
  const handleDrag: DragInteractionHandler = (e, draggedShape, allShapes, setShapes, onUpdateDuringDrag, getSnapLines, clearGuides) => {    
    const shapesToDrag = draggedShape.selected && allShapes.some(s => s.id === draggedShape.id && s.selected)
      ? allShapes.filter(s => s.selected)
      : [draggedShape];
    const startPositions = new Map(shapesToDrag.map(s => [s.id, { x: s.x, y: s.y }]));    

    // Usamos una ref para guardar el estado final sin causar re-renders
    let finalShapesState = allShapes;

    const SNAP_GRID_SIZE = 10; // Snap to a 10x10 grid

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - e.clientX;
      const dy = moveEvent.clientY - e.clientY;

      const currentDraggedShape = { ...draggedShape, x: (startPositions.get(draggedShape.id)?.x ?? 0) + dx, y: (startPositions.get(draggedShape.id)?.y ?? 0) + dy };
      const snapOffset = getSnapLines(currentDraggedShape, allShapes.filter(s => !shapesToDrag.find(d => d.id === s.id)));

      const finalDx = snapOffset.x !== null ? snapOffset.x - draggedShape.x : dx;
      const finalDy = snapOffset.y !== null ? snapOffset.y - draggedShape.y : dy;

      const newShapes = allShapes.map(s => {
          const startPos = startPositions.get(s.id);
          if (startPos) {
            let movedX = startPos.x + finalDx;
            let movedY = startPos.y + finalDy;

            if (moveEvent.shiftKey) {
              movedX = Math.round(movedX / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;
              movedY = Math.round(movedY / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;
            }
            return { ...s, x: movedX, y: movedY };
          }
          return s;
      });
      finalShapesState = newShapes;
      onUpdateDuringDrag(newShapes);
    };

    const handleMouseUp = () => {
      clearGuides();
      // Limpieza robusta: removemos los listeners de window.
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      setShapes(() => finalShapesState);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleResize: ResizeInteractionHandler = (e, shape, onUpdate, handlePosition) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = shape.width ?? 0;
    const startHeight = shape.height ?? 0;
    const startShapeX = shape.x;
    const startShapeY = shape.y;

    const doResize = (moveEvent: MouseEvent) => {
      const rawDx = moveEvent.clientX - startX;
      const rawDy = moveEvent.clientY - startY;

      const angleRad = (shape.rotation ?? 0) * (Math.PI / 180);
      const cos = Math.cos(-angleRad);
      const sin = Math.sin(-angleRad);
      const dx = rawDx * cos - rawDy * sin;
      const dy = rawDx * sin + rawDy * cos;

      let newX = startShapeX;
      let newY = startShapeY;
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (handlePosition.includes("right")) {
        newWidth = startWidth + dx;
      }
      if (handlePosition.includes("bottom")) {
        newHeight = startHeight + dy;
      }
      if (handlePosition.includes("left")) {
        newWidth = startWidth - dx;
        newX = startShapeX + dx;
      }
      if (handlePosition.includes("top")) {
        newHeight = startHeight - dy;
        newY = startShapeY + dy;
      }

      // Mantener la proporción con Shift
      if (moveEvent.shiftKey && startWidth > 0 && startHeight > 0) {
        const aspectRatio = startWidth / startHeight;
        if (handlePosition.includes('left') || handlePosition.includes('right')) {
          newHeight = newWidth / aspectRatio;
        } else {
          newWidth = newHeight * aspectRatio;
        }
      }

      if (newWidth < 20) newWidth = 20;
      if (newHeight < 20) newHeight = 20;

      const updatedShape: Shape = { ...shape, x: newX, y: newY, width: newWidth, height: newHeight };

      if (shape.type === 'polygon' && shape.vertices && startWidth > 0 && startHeight > 0) {
        const scaleX = newWidth / startWidth;
        const scaleY = newHeight / startHeight;
        updatedShape.vertices = shape.vertices.map(vertex => ({
          x: vertex.x * scaleX,
          y: vertex.y * scaleY,
        }));
      }

      onUpdate(updatedShape);
    };

    const stopResize = () => {
      window.removeEventListener("mousemove", doResize);
      window.removeEventListener("mouseup", stopResize);
    };

    window.addEventListener("mousemove", doResize);
    window.addEventListener("mouseup", stopResize);
  };

  const handleRotate: RotateInteractionHandler = (e, shape, onUpdate) => {
    const shapeElement = e.currentTarget.parentElement?.parentElement?.parentElement;
    if (!shapeElement) return;

    const rect = shapeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const doRotate = (moveEvent: MouseEvent) => {
      const SNAP_ANGLE = 15; // Snap to 15-degree increments
      const angleRad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      let angleDeg = angleRad * (180 / Math.PI) + 90;

      if (moveEvent.shiftKey) {
        angleDeg = Math.round(angleDeg / SNAP_ANGLE) * SNAP_ANGLE;
      }

      onUpdate({ ...shape, rotation: angleDeg });
    };

    const stopRotate = () => {
      window.removeEventListener("mousemove", doRotate);
      window.removeEventListener("mouseup", stopRotate);
    };

    window.addEventListener("mousemove", doRotate);
    window.addEventListener("mouseup", stopRotate);
  };

  return { handleDrag, handleResize, handleRotate };
}