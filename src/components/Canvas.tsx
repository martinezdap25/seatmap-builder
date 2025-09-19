"use client";

import React, { useRef, useEffect } from "react";
import { Stage, Layer, Transformer } from 'react-konva';
import ShapeComponent from "./ShapeComponent";

interface CanvasSettings {
  backgroundColor: string;
  zoom: number;
}

interface CanvasProps {
  shapes: import("@/types/types").Shape[];
  settings: CanvasSettings;
  setShapes: (updater: (prev: import("@/types/types").Shape[]) => import("@/types/types").Shape[]) => void;
  onUpdateShape: (shape: import("@/types/types").Shape) => void;
  onUpdateDuringDrag: (shapes: import("@/types/types").Shape[]) => void;
  onSelectShape: (shapeId: string, isShiftPressed: boolean) => void;
  onDeleteShape: (shapeId: string) => void;
  onDeleteVertex: (shapeId: string, vertexIndex: number) => void;
  floors: import("@/types/types").Floor[];
}

export default function Canvas({ shapes, settings, setShapes, onUpdateShape, onUpdateDuringDrag, onSelectShape, onDeleteShape, onDeleteVertex, floors }: CanvasProps) {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    if (transformerRef.current) {
      const stage = stageRef.current;
      const selectedNodes = stage.find('.selected');
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [shapes]);

  return (
    <Stage
      width={1000}
      height={700}
      style={{ backgroundColor: settings.backgroundColor, border: '1px solid #ccc' }}
      ref={stageRef}
      onMouseDown={(e) => {
        if (e.target === stageRef.current) {
          onSelectShape('', false);
        }
      }}
    >
      <Layer>
        {shapes.map((shape) => (
          <ShapeComponent
            key={shape.id}
            shape={shape}
            onUpdate={onUpdateShape}
            onUpdateDuringDrag={onUpdateDuringDrag}
            setShapes={setShapes}
            allShapes={shapes}
            canvasRef={stageRef as any}
            onSelect={onSelectShape}
            onDelete={onDeleteShape}
            onDeleteVertex={onDeleteVertex}
            floors={floors}
          />
        ))}
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      </Layer>
    </Stage>
  );
}
