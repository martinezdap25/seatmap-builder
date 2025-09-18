import { Shape } from "@/types/types";
import React from "react";

type InteractionHandler = (
  e: React.MouseEvent<HTMLDivElement>,
  shape: Shape,
  onUpdate: (shape: Shape) => void
) => void;

export function useInteraction() {
  const handleDrag: InteractionHandler = (e, shape, onUpdate) => {
    const dragStart = { x: e.clientX - shape.x, y: e.clientY - shape.y };

    const SNAP_GRID_SIZE = 10; // Snap to a 10x10 grid

    const handleMouseMove = (moveEvent: MouseEvent) => {
      let newX = moveEvent.clientX - dragStart.x;
      let newY = moveEvent.clientY - dragStart.y;

      if (moveEvent.shiftKey) {
        newX = Math.round(newX / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;
        newY = Math.round(newY / SNAP_GRID_SIZE) * SNAP_GRID_SIZE;
      }

      onUpdate({
        ...shape,
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleResize = (
    e: React.MouseEvent<HTMLDivElement>,
    shape: Shape,
    onUpdate: (shape: Shape) => void,
    handlePosition: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  ) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = shape.width ?? 0;
    const startHeight = shape.height ?? 0;

    const doResize = (moveEvent: MouseEvent) => {
      const rawDx = moveEvent.clientX - startX;
      const rawDy = moveEvent.clientY - startY;

      const angleRad = (shape.rotation ?? 0) * (Math.PI / 180);
      const cos = Math.cos(-angleRad);
      const sin = Math.sin(-angleRad);
      const dx = rawDx * cos - rawDy * sin;
      const dy = rawDx * sin + rawDy * cos;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (handlePosition.includes("right")) newWidth = startWidth + dx;
      if (handlePosition.includes("bottom")) newHeight = startHeight + dy;
      if (handlePosition.includes("left")) newWidth = startWidth - dx;
      if (handlePosition.includes("top")) newHeight = startHeight - dy;

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

      const updatedShape: Shape = { ...shape, width: newWidth, height: newHeight };

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

  const handleRotate: InteractionHandler = (e, shape, onUpdate) => {
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