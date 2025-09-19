"use client";

import { Shape, Floor } from "@/types/types";
import { RotateCw } from "lucide-react";
import VertexHandle from "./VertexHandle";
import ResizeHandle from "./ResizeHandle";
import React from "react";
import { DragInteractionHandler, ResizeInteractionHandler, RotateInteractionHandler } from "@/hooks/useInteraction";
import { useVertexEditing } from "@/hooks/useVertexEditing"; // El nuevo hook

interface ShapeComponentProps {
  shape: Shape;
  onUpdate: (shape: Shape) => void;
  onUpdateDuringDrag: (shapes: Shape[]) => void;
  setShapes: (updater: (prev: Shape[]) => Shape[]) => void; // Para el arrastre múltiple
  onSelect: (shapeId: string, isShiftPressed: boolean) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDelete: (shapeId: string) => void;
  onDeleteVertex: (shapeId: string, vertexIndex: number) => void;
  floors: Floor[];
  allShapes: Shape[]; // Necesitamos todas las formas para el arrastre múltiple
  handleDrag: DragInteractionHandler;
  handleResize: ResizeInteractionHandler;
  handleRotate: RotateInteractionHandler;
  getSnapLines: (movingShape: Shape, staticShapes: Shape[]) => { x: number | null; y: number | null };
  clearGuides: () => void;
}

export default function ShapeComponent({ shape, onUpdate, onUpdateDuringDrag, setShapes, onSelect, canvasRef, onDelete, onDeleteVertex, floors, allShapes, handleDrag, handleResize, handleRotate, getSnapLines, clearGuides }: ShapeComponentProps) {
  const {
    selectedVertexIndex,
    setSelectedVertexIndex,
    handleVertexMouseDown,
    handleSegmentClick,
  } = useVertexEditing({
    shape, onUpdate, onDeleteVertex, canvasRef
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    const initialX = e.clientX;
    const initialY = e.clientY;
    let hasDragged = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = Math.abs(moveEvent.clientX - initialX);
      const dy = Math.abs(moveEvent.clientY - initialY);
      if (!hasDragged && (dx > 3 || dy > 3)) {
        hasDragged = true;
        // Iniciar el arrastre solo cuando el mouse se ha movido
        handleDrag(e, shape, allShapes, setShapes, onUpdateDuringDrag, getSnapLines, clearGuides);
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (!hasDragged) {
        // Si no se arrastró, fue un clic. Ejecutamos la selección.
        onSelect(shape.id, upEvent.shiftKey);
      } else {
        // Si se arrastró, el estado final ya se guardó en el mouseup del hook.
        // Pero necesitamos asegurarnos de que la selección sea correcta.
        // Si la figura no estaba seleccionada, la seleccionamos ahora.
        if (!shape.selected && !upEvent.shiftKey) onSelect(shape.id, false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClick = () => {
    if (shape.editingVertices) {
      onUpdate({
        ...shape,
        editingVertices: false,
        selected: true,
      });
      setSelectedVertexIndex(null);
    } else {
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

  // Listener para la tecla Suprimir
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input, textarea, etc.
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && shape.selected && !shape.editingVertices) {
        // Prevenir que el navegador retroceda la página con la tecla Backspace
        e.preventDefault();
        onDelete(shape.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shape.selected, shape.editingVertices, shape.id, onDelete]);

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

  const floorColor = floors.find(f => f.id === shape.floorId)?.color || '#cccccc';
  const backgroundColor = `rgba(${parseInt(floorColor.slice(1, 3), 16)}, ${parseInt(floorColor.slice(3, 5), 16)}, ${parseInt(floorColor.slice(5, 7), 16)}, 0.4)`;

  return (
    <div
      // Este div ahora es solo un contenedor para posicionamiento y los manejadores
      className="absolute"
      style={{
        left: shape.x,
        top: shape.y,
        width: shape.width ?? 0,
        height: shape.height ?? 0,
        transform: [
          `rotate(${shape.rotation || 0}deg)`,
          shape.flippedX ? 'scaleX(-1)' : '',
          shape.flippedY ? 'scaleY(-1)' : '',
        ].join(' '),
      }}
    >
      {/* Este div interno es el que se ve, se selecciona y se arrastra */}
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className={`relative w-full h-full transition-shadow duration-150 ${shape.selected ? 'outline outline-2 outline-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.3)]' : ''}`}
      >
        {/* Contenedor para el texto */}
        <div
          className="absolute inset-0 flex items-center pointer-events-none select-none p-2"
          style={{
            justifyContent:
              shape.textOptions?.align === 'left' ? 'flex-start' :
              shape.textOptions?.align === 'right' ? 'flex-end' :
              'center',
            color: shape.textOptions?.color || '#333333',
            fontWeight: shape.textOptions?.isBold ? 'bold' : 'normal',
            transform: `${shape.flippedX ? 'scaleX(-1)' : ''} ${shape.flippedY ? 'scaleY(-1)' : ''}`,
          }}
        >
          {shape.label}
        </div>

        {shape.type === 'rect' && !shape.editingVertices && (
          <div className="w-full h-full border border-gray-400" style={{ backgroundColor }} />
        )}
        {(shape.type === 'polygon' || shape.editingVertices) && shape.vertices && (
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            <path d={polygonPath} fill={backgroundColor} stroke={floorColor} strokeWidth="2" />
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
              onMouseDown={(e) => handleRotate(e, shape, onUpdate)}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full p-1 bg-white border-2 border-blue-500 rounded-full cursor-alias"
            >
              <RotateCw size={16} className="text-blue-600" />
            </div>
          </div>

          {/* Esquinas */}
          <ResizeHandle position="-top-1.5 -left-1.5" cursor="cursor-nwse-resize" onMouseDown={(e) => handleResize(e, shape, onUpdate, 'top-left')} />
          <ResizeHandle position="-top-1.5 -right-1.5" cursor="cursor-nesw-resize" onMouseDown={(e) => handleResize(e, shape, onUpdate, 'top-right')} />
          <ResizeHandle position="-bottom-1.5 -left-1.5" cursor="cursor-nesw-resize" onMouseDown={(e) => handleResize(e, shape, onUpdate, 'bottom-left')} />
          <ResizeHandle position="-bottom-1.5 -right-1.5" cursor="cursor-nwse-resize" onMouseDown={(e) => handleResize(e, shape, onUpdate, 'bottom-right')} />
          {/* Medios */}
          <ResizeHandle position="-top-1.5 left-1/2 -translate-x-1/2" cursor="cursor-ns-resize" onMouseDown={(e) => handleResize(e, shape, onUpdate, 'top')} />
          <ResizeHandle position="-bottom-1.5 left-1/2 -translate-x-1/2" cursor="cursor-ns-resize" onMouseDown={(e) => handleResize(e, shape, onUpdate, 'bottom')} />
          <ResizeHandle position="top-1/2 -translate-y-1/2 -left-1.5" cursor="cursor-ew-resize" onMouseDown={(e) => handleResize(e, shape, onUpdate, 'left')} />
          <ResizeHandle position="top-1/2 -translate-y-1/2 -right-1.5" cursor="cursor-ew-resize" onMouseDown={(e) => handleResize(e, shape, onUpdate, 'right')} />
        </>
      )}
    </div>
  );
}