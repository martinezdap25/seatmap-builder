"use client";

import { useState, useEffect, useCallback, SetStateAction } from "react";
import Toolbar from "@/components/Toolbar";
import PropertiesPanel from "@/components/PropertiesPanel";
import Canvas from "@/components/Canvas";
import { Shape, Floor } from "@/types/types";

export default function HomePage() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [floors, _setFloors] = useState<Floor[]>([
    { id: 'default', name: 'Piso por defecto', color: '#87CEEB' } // Un piso inicial
  ]);

  const [canvasSettings, _setCanvasSettings] = useState({
    backgroundColor: "#ffffff",
  });

  // Envolvemos los setters en useCallback para estabilizarlos
  const setFloors = useCallback((newFloors: SetStateAction<Floor[]>) => { // SetStateAction<Floor[]> es lo mismo que Floor[] | ((prevState: Floor[]) => Floor[])
    _setFloors(newFloors);
  }, []);
  const setCanvasSettings = useCallback((newSettings: SetStateAction<{ backgroundColor: string; }>) => {
    _setCanvasSettings(newSettings);
  }, []);

  const updateShapesAndHistory = (newShapes: Shape[] | ((prev: Shape[]) => Shape[])) => {
    const resolvedShapes = typeof newShapes === 'function' ? newShapes(shapes) : newShapes;
    setShapes(resolvedShapes);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(resolvedShapes);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleNewMap = () => {
    updateShapesAndHistory([]);
  };

  const handleAddRect = () => {
    updateShapesAndHistory((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "rect",
        floorId: floors[0]?.id, // Asignar el primer piso por defecto
        x: 100,
        y: 100,
        width: 150,
        height: 100,
        rotation: 0,
        label: '',
        textOptions: {
          align: 'center',
          isBold: false,
          color: '#333333',
        },
        seats: [],
      },
    ]);
  };

  const handleBatchLabel = () => alert("Aquí abriremos el modal de etiquetado rápido ✨");
  const handleExport = () => alert("Exportar JSON todavía no implementado 🚀");
  const handleImport = (file: File) =>
    alert(`Importar JSON desde archivo: ${file.name} (a implementar)`);
  
  const handleDelete = (shapeId?: string) => {
    updateShapesAndHistory((prev) => prev.filter((s) => (shapeId ? s.id !== shapeId : !s.selected)));
  };

  // Para habilitar/deshabilitar el botón de la toolbar
  const selectedShapes = shapes.filter((s) => s.selected);
  const selectedShape = shapes.find((s) => s.selected) || null;

  const handleUpdateShape = (updatedShape: Shape) => {
    updateShapesAndHistory((prev) =>
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
    updateShapesAndHistory((prev) => {
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

    updateShapesAndHistory((prev) =>
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
    updateShapesAndHistory((prev) =>
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

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setShapes(history[newIndex]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setShapes(history[newIndex]);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') handleUndo();
      if (e.ctrlKey && e.key === 'y') handleRedo();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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
            floors={floors}
          />
        </div>
        <PropertiesPanel
          selectedShape={selectedShape}
          onUpdate={handleUpdateShape}
          canvasSettings={canvasSettings}
          floors={floors}
          setFloors={setFloors}
          onCanvasSettingsChange={setCanvasSettings}
        />
      </div>
    </main>
  );
}
