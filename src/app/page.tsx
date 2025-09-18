"use client";

import { useState } from "react";
import Toolbar from "@/components/Toolbar";
import PropertiesPanel from "@/components/PropertiesPanel";
import Canvas from "@/components/Canvas";
import { Shape } from "@/types/types";

export default function HomePage() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [canvasSettings, setCanvasSettings] = useState({
    backgroundColor: "#ffffff",
  });

  const handleNewMap = () => {
    setShapes([]);
  };

  const handleAddRect = () => {
    setShapes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "rect",
        category: "sin-categoría",
        x: 100,
        y: 100,
        width: 150,
        height: 100,
        rotation: 0,
        label: '',
        seats: [],
      },
    ]);
  };

  const handleBatchLabel = () => alert("Aquí abriremos el modal de etiquetado rápido ✨");
  const handleExport = () => alert("Exportar JSON todavía no implementado 🚀");
  const handleImport = (file: File) =>
    alert(`Importar JSON desde archivo: ${file.name} (a implementar)`);
  
  const handleDelete = (shapeId?: string) => {
    setShapes((prev) => prev.filter((s) => (shapeId ? s.id !== shapeId : !s.selected)));
  };

  // Para habilitar/deshabilitar el botón de la toolbar
  const selectedShapes = shapes.filter((s) => s.selected);
  const selectedShape = shapes.find((s) => s.selected) || null;

  const handleUpdateShape = (updatedShape: Shape) => {
    setShapes((prev) =>
      prev.map((s) => {
        if (s.id === updatedShape.id) {
          return updatedShape;
        }
        // Si la forma actualizada está seleccionada, deselecciona las demás
        return updatedShape.selected ? { ...s, selected: false } : s;
      })
    );
  };

  const handleSelectShape = (shapeId: string, isShiftPressed: boolean) => {
    setShapes((prev) => {
      if (isShiftPressed) {
        // Si Shift está presionado, alterna la selección de la figura clickeada
        return prev.map((s) =>
          s.id === shapeId ? { ...s, selected: !s.selected } : s
        );
      } else {
        // Comportamiento normal: selecciona solo la figura clickeada
        return prev.map((s) => ({
          ...s,
          selected: s.id === shapeId,
        }));
      }
    });
  };

  const handleAlign = (
    alignment: "left" | "center-h" | "right" | "top" | "center-v" | "bottom"
  ) => {
    if (selectedShapes.length < 1) return;

    const CANVAS_WIDTH = 1000;
    const CANVAS_HEIGHT = 700;

    const targetX = {
      left: 0,
      "center-h": CANVAS_WIDTH / 2,
      right: CANVAS_WIDTH,
    };
    const targetY = {
      top: 0,
      "center-v": CANVAS_HEIGHT / 2,
      bottom: CANVAS_HEIGHT,
    };

    setShapes((prev) =>
      prev.map((s) => {
        if (!s.selected) return s;

        switch (alignment) {
          case "left": return { ...s, x: targetX.left };
          case "center-h": return { ...s, x: targetX["center-h"] - (s.width ?? 0) / 2 };
          case "right": return { ...s, x: targetX.right - (s.width ?? 0) };
          case "top": return { ...s, y: targetY.top };
          case "center-v": return { ...s, y: targetY["center-v"] - (s.height ?? 0) / 2 };
          case "bottom": return { ...s, y: targetY.bottom - (s.height ?? 0) };
          default: return s;
        }
      })
    );
  };

  const handleDeleteVertex = (shapeId: string, vertexIndex: number) => {
    setShapes((prev) =>
      prev.map((s) => {
        if (s.id === shapeId && s.vertices && s.vertices.length > 3) { // Mínimo 3 vértices para un polígono
          const newVertices = [...s.vertices];
          newVertices.splice(vertexIndex, 1);
          return { ...s, vertices: newVertices };
        }
        return s;
      })
    );
  };

  return (
    <main className="flex flex-col min-h-screen">
      <Toolbar
        onNewMap={handleNewMap}
        onAddRect={handleAddRect}
        onBatchLabel={handleBatchLabel}
        onAlign={handleAlign}
        canAlign={selectedShapes.length > 0}
        onExport={handleExport}
        onImport={handleImport}
        onDelete={selectedShapes.length > 0 ? () => handleDelete() : undefined}
      />
      <div className="flex flex-1 overflow-hidden">
        <div
          className="flex-1 flex items-center justify-center p-4 bg-gray-100"
        >
          <Canvas
            shapes={shapes}
            settings={canvasSettings}
            onUpdateShape={handleUpdateShape}
            onSelectShape={handleSelectShape}
            onDeleteShape={handleDelete}
            onDeleteVertex={handleDeleteVertex}
          />
        </div>
        <PropertiesPanel
          selectedShape={selectedShape}
          onUpdate={handleUpdateShape}
          canvasSettings={canvasSettings}
          onCanvasSettingsChange={setCanvasSettings}
        />
      </div>
    </main>
  );
}
