"use client";

import { Shape } from "@/types/types";
import ResizeHandle from "./ResizeHandle";
import React, { useEffect, useRef } from "react";

interface ShapeComponentProps {
  shape: Shape;
  onUpdate: (shape: Shape) => void;
  onSelect: (shapeId: string) => void;
}

export default function ShapeComponent({ shape, onUpdate, onSelect }: ShapeComponentProps) {
  const isDraggingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevenir que el evento se propague al canvas y deseleccione
    e.stopPropagation();
    onSelect(shape.id);

    isDraggingRef.current = true;
    const dragStart = { x: e.clientX - shape.x, y: e.clientY - shape.y };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onUpdate({
        ...shape,
        x: moveEvent.clientX - dragStart.x,
        y: moveEvent.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Manejador genérico para el redimensionamiento
  const handleResizeMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    handlePosition: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  ) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startShapeX = shape.x;
    const startShapeY = shape.y;
    const startWidth = shape.width;
    const startHeight = shape.height;

    const doResize = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newX = startShapeX;
      let newY = startShapeY;
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (handlePosition.includes('right')) {
        newWidth = startWidth + dx;
      }
      if (handlePosition.includes('bottom')) {
        newHeight = startHeight + dy;
      }
      if (handlePosition.includes('left')) {
        newWidth = startWidth - dx;
        newX = startShapeX + dx; // La posición se mueve con el cursor
      }
      if (handlePosition.includes('top')) {
        newHeight = startHeight - dy;
        newY = startShapeY + dy; // La posición se mueve con el cursor
      }

      // Prevenir que la forma se invierta (ancho/alto negativo)
      if (newWidth < 20) newWidth = 20;
      if (newHeight < 20) newHeight = 20;

      onUpdate({ ...shape, x: newX, y: newY, width: newWidth, height: newHeight });
    };
    
    const stopResize = () => {
      window.removeEventListener("mousemove", doResize);
      window.removeEventListener("mouseup", stopResize);
    };

    // Limpiamos listeners previos por si acaso
    window.removeEventListener("mousemove", doResize);
    window.removeEventListener("mouseup", stopResize);

    window.addEventListener("mousemove", doResize);
    window.addEventListener("mouseup", stopResize);
  };

  return (
    <div
      // Este div ahora es solo un contenedor para posicionamiento y los manejadores
      className="absolute"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width,
        height: shape.height,
      }}
    >
      {/* Este div interno es el que se ve, se selecciona y se arrastra */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-full h-full transition-shadow duration-150 ${isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab'} ${shape.selected ? 'outline outline-2 outline-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.3)]' : 'border border-gray-400'}`}
        style={{ backgroundColor: "rgba(0, 0, 255, 0.1)" }}
      ></div>

      {shape.selected && (
        <>
          {/* Esquinas */}
          <ResizeHandle position="-top-1.5 -left-1.5" cursor="cursor-nwse-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')} />
          <ResizeHandle position="-top-1.5 -right-1.5" cursor="cursor-nesw-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')} />
          <ResizeHandle position="-bottom-1.5 -left-1.5" cursor="cursor-nesw-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')} />
          <ResizeHandle position="-bottom-1.5 -right-1.5" cursor="cursor-nwse-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')} />
          {/* Medios */}
          <ResizeHandle position="-top-1.5 left-1/2 -translate-x-1/2" cursor="cursor-ns-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'top')} />
          <ResizeHandle position="-bottom-1.5 left-1/2 -translate-x-1/2" cursor="cursor-ns-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')} />
          <ResizeHandle position="top-1/2 -translate-y-1/2 -left-1.5" cursor="cursor-ew-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'left')} />
          <ResizeHandle position="top-1/2 -translate-y-1/2 -right-1.5" cursor="cursor-ew-resize" onMouseDown={(e) => handleResizeMouseDown(e, 'right')} />
        </>
      )}
    </div>
  );
}