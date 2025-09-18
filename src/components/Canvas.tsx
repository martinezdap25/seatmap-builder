"use client";

import { Stage, Layer, Rect, Transformer, Group } from "react-konva";
import { useRef, useEffect } from "react";
import { Shape } from "@/types/types";
import Konva from "konva";

interface CanvasProps {
  shapes: Shape[];
  onUpdateShape: (shape: Shape) => void;
}

export default function Canvas({ shapes, onUpdateShape }: CanvasProps) {
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedId = shapes.find((s) => s.selected)?.id || null;

  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const layer = transformerRef.current.getLayer();
      const node = layer?.findOne(`#${selectedId}`);
      transformerRef.current.nodes(node ? [node] : []);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, shapes]);

  const updateShapePosition = (id: string, x: number, y: number) => {
    const shape = shapes.find((s) => s.id === id);
    if (!shape) return;
    onUpdateShape({ ...shape, x, y });
  };

  const updateShapeSize = (id: string, width: number, height: number) => {
    const shape = shapes.find((s) => s.id === id);
    if (!shape) return;
    onUpdateShape({ ...shape, width, height });
  };

  return (
    <Stage width={1000} height={700} style={{ border: "1px solid #ccc" }}>
      <Layer>
        {shapes.map((shape) => (
          <Group key={shape.id}>
            <Rect
              id={shape.id}
              x={shape.x}
              y={shape.y}
              width={shape.width ?? 150}
              height={shape.height ?? 100}
              fill="rgba(0,0,255,0.2)"
              stroke="blue"
              strokeWidth={2}
              draggable
              onDragEnd={(e) => updateShapePosition(shape.id, e.target.x(), e.target.y())}
              onTransformEnd={(e) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);
                updateShapeSize(
                  shape.id,
                  (shape.width ?? 150) * scaleX,
                  (shape.height ?? 100) * scaleY
                );
              }}
            />
          </Group>
        ))}
        <Transformer
          ref={transformerRef}
          rotateEnabled
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
        />
      </Layer>
    </Stage>
  );
}
