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
  const isShapeSelected = shapes.some((s) => s.selected);
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

  const handleSelectShape = (shapeId: string) => {
    setShapes((prev) =>
      prev.map((s) => ({
        ...s,
        selected: s.id === shapeId,
      }))
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
        onExport={handleExport}
        onImport={handleImport}
        onDelete={isShapeSelected ? () => handleDelete() : undefined}
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
