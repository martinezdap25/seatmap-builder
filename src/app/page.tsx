"use client";

import { useState } from "react";
import Toolbar from "@/components/Toolbar";
import Canvas from "@/components/Canvas";
import { Shape } from "@/types/types";

export default function HomePage() {
  const [shapes, setShapes] = useState<Shape[]>([]);

  const handleNewMap = () => setShapes([]);

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
        seats: [],
      },
    ]);
  };

  const handleBatchLabel = () => alert("Aquí abriremos el modal de etiquetado rápido ✨");
  const handleExport = () => alert("Exportar JSON todavía no implementado 🚀");
  const handleImport = (file: File) =>
    alert(`Importar JSON desde archivo: ${file.name} (a implementar)`);
  const handleDelete = () => alert("Eliminar cuadrados (pendiente)");

  const handleUpdateShape = (updatedShape: Shape) => {
    setShapes((prev) => prev.map((s) => (s.id === updatedShape.id ? updatedShape : s)));
  };

  return (
    <main className="flex flex-col min-h-screen">
      <Toolbar
        onNewMap={handleNewMap}
        onAddRect={handleAddRect}
        onBatchLabel={handleBatchLabel}
        onExport={handleExport}
        onImport={handleImport}
        onDelete={handleDelete}
      />
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <Canvas shapes={shapes} onUpdateShape={handleUpdateShape} />
      </div>
    </main>
  );
}
