"use client";

import { Shape } from "@/types/types";
import { RotateCw } from "lucide-react";
import VertexHandle from "./VertexHandle";
import ResizeHandle from "./ResizeHandle";
import React, { useState, useRef } from "react";

interface ShapeComponentProps {
  shape: Shape;
  onUpdate: (shape: Shape) => void;
  onSelect: (shapeId: string) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDeleteVertex: (shapeId: string, vertexIndex: number) => void;
}

export default function ShapeComponent({ shape, onUpdate, onSelect, canvasRef, onDeleteVertex, }: ShapeComponentProps) {
  const isDraggingRef = useRef(false);
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);

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
    const startWidth = shape.width ?? 0;
    const startHeight = shape.height ?? 0;

    const doResize = (moveEvent: MouseEvent) => {
      const rawDx = moveEvent.clientX - startX;
      const rawDy = moveEvent.clientY - startY;

      // "Des-rotar" el movimiento del mouse para alinearlo con los ejes de la forma
      const angleRad = (shape.rotation ?? 0) * (Math.PI / 180);
      const cos = Math.cos(-angleRad);
      const sin = Math.sin(-angleRad);
      const dx = rawDx * cos - rawDy * sin;
      const dy = rawDx * sin + rawDy * cos;

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
      }
      if (handlePosition.includes("top")) {
        newHeight = startHeight - dy;
      }

      // Prevenir que la forma se invierta (ancho/alto negativo)
      if (newWidth < 20) newWidth = 20;
      if (newHeight < 20) newHeight = 20;

      const updatedShape: Shape = { ...shape, width: newWidth, height: newHeight };

      // Si la forma es un polígono, debemos escalar sus vértices.
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

    // Limpiamos listeners previos por si acaso
    window.removeEventListener("mousemove", doResize);
    window.removeEventListener("mouseup", stopResize);

    window.addEventListener("mousemove", doResize);
    window.addEventListener("mouseup", stopResize);
  };

  const handleVertexMouseDown = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    setSelectedVertexIndex(index);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!shape.vertices || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const mouseX = moveEvent.clientX - canvasRect.left;
      const mouseY = moveEvent.clientY - canvasRect.top;

      const newVertexPos = {
        // La posición del vértice es relativa a la posición (x, y) de la forma
        x: mouseX - shape.x,
        y: mouseY - shape.y,
      };

      const newVertices = [...shape.vertices];
      newVertices[index] = newVertexPos;

      // Recalcular el bounding box del polígono
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      newVertices.forEach(v => {
        minX = Math.min(minX, v.x);
        minY = Math.min(minY, v.y);
        maxX = Math.max(maxX, v.x);
        maxY = Math.max(maxY, v.y);
      });

      // Actualizar la posición y dimensiones de la forma para que coincidan con el nuevo bounding box
      const newShapeX = shape.x + minX;
      const newShapeY = shape.y + minY;
      const newWidth = maxX - minX;
      const newHeight = maxY - minY;

      // Ajustar los vértices para que sean relativos al nuevo origen (0,0) del bounding box
      const updatedVertices = newVertices.map(v => ({ x: v.x - minX, y: v.y - minY }));

      onUpdate({ ...shape, x: newShapeX, y: newShapeY, width: newWidth, height: newHeight, vertices: updatedVertices });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    // Limpieza proactiva
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleSegmentClick = (e: React.MouseEvent<SVGPathElement>, index: number) => {
    e.stopPropagation();
    if (!shape.vertices || !shape.editingVertices) return;

    // Obtener el punto de clic relativo al SVG
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

  const handleDoubleClick = () => {
    if (shape.editingVertices) {
      // Salimos del modo edición y "consolidamos" la forma.
      // El bounding box ya fue calculado al mover los vértices, así que la forma
      // ya tiene el width/height correcto. Solo necesitamos cambiar el estado.
      onUpdate({
        ...shape,
        type: "polygon", // Mantenemos el tipo por si se vuelve a editar
        editingVertices: false,
        selected: true,
      });
      setSelectedVertexIndex(null);
    } else {
      // Si no estamos en modo edición, entramos.
      let initialVertices: { x: number; y: number }[] = [];
      if (shape.type === 'rect' && shape.width != null && shape.height != null) {
        initialVertices = [
          { x: 0, y: 0 },
          { x: shape.width, y: 0 },
          { x: shape.width, y: shape.height },
          { x: 0, y: shape.height },
        ];
      } else if (shape.vertices) {
        initialVertices = shape.vertices;
      }
      onUpdate({
        ...shape,
        type: 'polygon',
        editingVertices: true,
        selected: false, // Ocultamos los manejadores de transformación
        vertices: initialVertices,
      });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && shape.editingVertices) {
      // Salimos del modo edición y "consolidamos" la forma.
      // Similar al doble clic, solo cambiamos el estado.
      onUpdate({
        ...shape,
        type: "polygon",
        editingVertices: false,
        selected: true,
      });
      setSelectedVertexIndex(null);
    }
    if (e.key === 'Delete' && shape.editingVertices && selectedVertexIndex !== null) {
      onDeleteVertex(shape.id, selectedVertexIndex);
      setSelectedVertexIndex(null);
    }
  };

  React.useEffect(() => {
    // Usamos una función nombrada para poder agregar y quitar el mismo listener
    const keydownListener = (e: KeyboardEvent) => handleKeyDown(e);

    if (shape.editingVertices) {
      window.addEventListener('keydown', keydownListener);
    }
    return () => {
      window.removeEventListener('keydown', keydownListener);
    };
  }, [shape.editingVertices, selectedVertexIndex, shape, onUpdate, onDeleteVertex]); // Añadir dependencias

  // Generar el path del polígono para SVG
  const polygonPath = shape.vertices
    ? shape.vertices.map((v, i) => (i === 0 ? `M ${v.x} ${v.y}` : `L ${v.x} ${v.y}`)).join(' ') + ' Z'
    : '';

  // Generar paths invisibles para los segmentos de línea (para hacerlos clickeables)
  const segmentPaths = shape.vertices && shape.editingVertices
    ? shape.vertices.map((v, i) => {
        const nextV = shape.vertices![(i + 1) % shape.vertices!.length];
        return `M ${v.x} ${v.y} L ${nextV.x} ${nextV.y}`;
      })
    : [];

  const handleRotateMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const shapeElement = e.currentTarget.parentElement?.parentElement;
    if (!shapeElement) return;

    const rect = shapeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const doRotate = (moveEvent: MouseEvent) => {
      const angleRad = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      const angleDeg = angleRad * (180 / Math.PI) + 90; // +90 para alinear con el eje Y

      onUpdate({ ...shape, rotation: angleDeg });
    };

    const stopRotate = () => {
      window.removeEventListener("mousemove", doRotate);
      window.removeEventListener("mouseup", stopRotate);
    };

    // Limpiamos listeners previos por si acaso
    window.removeEventListener("mousemove", doRotate);
    window.removeEventListener("mouseup", stopRotate);

    window.addEventListener("mousemove", doRotate);
    window.addEventListener("mouseup", stopRotate);
  };

  return (
    <div
      // Este div ahora es solo un contenedor para posicionamiento y los manejadores
      className="absolute"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width ?? 0,
        height: shape.height ?? 0,
        transform: `rotate(${shape.rotation || 0}deg)`,
      }}
    >
      {/* Este div interno es el que se ve, se selecciona y se arrastra */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className={`w-full h-full transition-shadow duration-150 ${isDraggingRef.current ? 'cursor-grabbing' : 'cursor-grab'} ${shape.selected ? 'outline outline-2 outline-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.3)]' : ''}`}
      >
        {shape.type === 'rect' && !shape.editingVertices && (
          <div className="w-full h-full border border-gray-400" style={{ backgroundColor: "rgba(0, 0, 255, 0.1)" }} />
        )}
        {(shape.type === 'polygon' || shape.editingVertices) && shape.vertices && (
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            <path d={polygonPath} fill="rgba(0, 0, 255, 0.1)" stroke="rgb(59, 130, 246)" strokeWidth="2" />
            {/* Líneas invisibles para capturar clics y añadir vértices */}
            {segmentPaths.map((path, index) => (
              <path
                key={index}
                d={path}
                stroke="transparent"
                strokeWidth="10"
                className="cursor-copy"
                onClick={(e) => handleSegmentClick(e, index)}
              />
            ))}
          </svg>
        )}
      </div>

      {shape.editingVertices && shape.vertices?.map((vertex, index) => (
        <VertexHandle
          key={index}
          x={vertex.x}
          y={vertex.y}
          isSelected={selectedVertexIndex === index}
          onMouseDown={(e) => handleVertexMouseDown(e, index)}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedVertexIndex(index);
          }}
        />
      ))}

      {shape.selected && !shape.editingVertices && (
        <>
          {/* Manejador de Rotación con Icono */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 h-8 w-px bg-blue-500">
            <div
              title="Rotar forma"
              onMouseDown={handleRotateMouseDown}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full p-1 bg-white border-2 border-blue-500 rounded-full cursor-alias"
            >
              <RotateCw size={16} className="text-blue-600" />
            </div>
          </div>

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