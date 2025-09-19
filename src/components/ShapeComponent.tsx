/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Rect, Path, Text } from 'react-konva';
import React from "react";
import { Shape as ShapeType } from "@/types/types";
import { useVertexEditing } from "@/hooks/useVertexEditing"; // El nuevo hook

interface ShapeComponentProps {
  shape: ShapeType;
  onUpdate: (shape: ShapeType) => void;
  onUpdateDuringDrag: (shapes: ShapeType[]) => void;
  setShapes: (updater: (prev: ShapeType[]) => ShapeType[]) => void; // Para el arrastre múltiple
  onSelect: (shapeId: string, isShiftPressed: boolean) => void;
  canvasRef: React.RefObject<any>;
  onDelete: (shapeId: string) => void;
  onDeleteVertex: (shapeId: string, vertexIndex: number) => void;
  floors: import("@/types/types").Floor[];
  allShapes: ShapeType[]; // Necesitamos todas las formas para el arrastre múltiple
}

export default function ShapeComponent({ shape, onUpdate, onUpdateDuringDrag, setShapes, onSelect, canvasRef, onDelete, onDeleteVertex, floors, allShapes }: ShapeComponentProps) {
  const shapeRef = React.useRef<any>(null);
  const {
    selectedVertexIndex,
    setSelectedVertexIndex,
    handleVertexMouseDown,
    handleSegmentClick,
  } = useVertexEditing({
    shape, allShapes, onUpdate, onDeleteVertex, canvasRef
  });

  React.useEffect(() => {
    if (shape.type !== 'text' || !shape.isEditing) {
      return;
    }
    const textNode = shapeRef.current;
    if (!textNode) return;

    textNode.hide();

    const stage = textNode.getStage();
    if (!stage) return;

    const textPosition = textNode.getAbsolutePosition();
    const stageBox = stage.container().getBoundingClientRect();
    const scale = stage.scaleX();

    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${textNode.width() * scale}px`;
    textarea.style.height = `${textNode.height() * scale}px`;
    textarea.style.fontSize = `${textNode.fontSize()}px`;
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = String(textNode.lineHeight());
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = String(textNode.fill());
    textarea.style.transform = `rotateZ(${textNode.rotation()}deg) scale(${scale})`;

    textarea.focus();

    const handleTextareaChange = () => {
      const newText = textarea.value;
      textNode.text(newText);
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
      onUpdate({ ...shape, label: newText, height: Math.ceil(textarea.scrollHeight / scale) });
    };

    const removeTextarea = () => {
      if (document.body.contains(textarea)) {
        document.body.removeChild(textarea);
      }
      window.removeEventListener('click', handleOutsideClick);
      textarea.removeEventListener('keydown', handleKeyDown);
      textNode.show();
    };

    const handleTextareaBlur = () => {
      onUpdate({ ...shape, label: textarea.value, isEditing: false });
      removeTextarea();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        handleTextareaBlur();
      }
      if (e.key === 'Escape') {
        onUpdate({ ...shape, isEditing: false }); // Revert changes by not saving textarea.value
        removeTextarea();
      }
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target !== textarea) {
        handleTextareaBlur();
      }
    };

    textarea.addEventListener('input', handleTextareaChange);
    textarea.addEventListener('keydown', handleKeyDown);
    // Use a timeout to avoid the same click event that triggers editing from also triggering the outside click
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });

    return () => {
      // Cleanup function to remove textarea and listeners
      if (document.body.contains(textarea)) {
        document.body.removeChild(textarea);
      }
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [shape.isEditing, shape.type]); // Only re-run when isEditing or type changes

  const handleDoubleClick = () => {
    if (shape.type === 'text') {
      onUpdate({ ...shape, isEditing: true, selected: false });
    }
  };

  // Generar el path del polígono para SVG
  const polygonPath = shape.vertices
    ? shape.vertices.map((v, i) => (i === 0 ? `M ${v.x} ${v.y}` : `L ${v.x} ${v.y}`)).join(' ') + ' Z'
    : '';

  const floorColor = floors.find(f => f.id === shape.floorId)?.color || '#cccccc';
  const backgroundColor = `rgba(${parseInt(floorColor.slice(1, 3), 16)}, ${parseInt(floorColor.slice(3, 5), 16)}, ${parseInt(floorColor.slice(5, 7), 16)}, 0.4)`;

  const commonProps = {
    id: shape.id,
    name: shape.selected ? 'selected' : '',
    x: shape.x,
    y: shape.y,
    rotation: shape.rotation,
    scaleX: shape.flippedX ? -1 : 1,
    scaleY: shape.flippedY ? -1 : 1,
    draggable: !shape.editingVertices,
    onClick: (e: any) => onSelect(shape.id, e.evt.shiftKey),
    onTap: (e: any) => onSelect(shape.id, e.evt.shiftKey),
    onDragEnd: (e: any) => onUpdate({ ...shape, x: e.target.x(), y: e.target.y(), selected: true }),
    onDblClick: handleDoubleClick,
    onDblTap: handleDoubleClick,
    onTransformEnd: (e: any) => {
      const node = e.target;
      onUpdate({
        ...shape,
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY(),
        rotation: node.rotation(),
      });
    },
  };

  if (shape.type === 'text') {
    return (
      <Text
        {...commonProps}
        ref={shapeRef}
        text={shape.label}
        fontSize={shape.fontSize} // Assuming fontSize is directly on shape
        fill={shape.textOptions?.color}
        width={shape.width}
        align={shape.textOptions?.align}
        fontStyle={shape.textOptions?.isBold ? 'bold' : 'normal'}
        visible={!shape.isEditing}
      />
    );
  }

  if (shape.type === 'rect') {
    return (
      <Rect
        {...commonProps}
        ref={shapeRef}
        width={shape.width}
        height={shape.height}
        fill={backgroundColor}
        stroke={floorColor}
        strokeWidth={2}
      />
    );
  }

  if (shape.type === 'polygon') {
    return (
      <Path
        {...commonProps}
        ref={shapeRef}
        data={polygonPath}
        fill={backgroundColor}
        stroke={floorColor}
        strokeWidth={2}
        closed
      />
    );
  }

  return (
    null
  );
}