"use client";

import { useEffect, useRef, useCallback, useState as useReactState } from "react";
import Toolbar from "@/components/Toolbar";
import PropertiesPanel from "@/components/PropertiesPanel";
import Canvas from "@/components/Canvas";
import { Shape } from "@/types/types";
import { useSmartGuides, Guide } from "@/hooks/useSmartGuides";
import SmartGuidesOverlay from "@/components/SmartGuidesOverlay";
import { useSeatmapStore } from "@/hooks/useSeatmapStore";
import { SeatmapProvider } from "@/context/SeatmapContext";

function Editor() {
  const {
    shapes,
    floors,
    canvasSettings,
    setShapes,
    updateShapesDuringDrag,
    undo,
    redo,
    setFloors,
    setCanvasSettings,
    setZoom,
    copySelection,
    pasteFromClipboard,
  } = useSeatmapStore();

  const { guides, getSnapLines, clearGuides } = useSmartGuides();
  const [isDragging, setIsDragging] = useReactState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const handleNewMap = () => {
    setShapes([]);
  };

  const handleAddRect = () => {
    setShapes((prev) => [
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
        label: "",
        flippedX: false,
        flippedY: false,
        textOptions: {
          align: "center",
          isBold: false,
          color: "#333333",
        },
        seats: [],
      },
    ]);
  };

  const handleAddText = () => {
    setShapes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: 'text',
        floorId: floors[0]?.id,
        x: 150,
        y: 150,
        width: 200,
        height: 50,
        rotation: 0,
        label: 'Texto editable',
        fontSize: 20,
        textOptions: {
          align: 'left',
          isBold: false,
          color: '#333333',
        },
        seats: [],
      },
    ]);
  };

  const handleBatchLabel = () =>
    alert("Aquí abriremos el modal de etiquetado rápido ✨");
  const handleExport = () => alert("Exportar JSON todavía no implementado 🚀");
  const handleImport = (file: File) =>
    alert(`Importar JSON desde archivo: ${file.name} (a implementar)`);

  const handleDelete = (shapeId?: string) => {
    setShapes((prev) =>
      prev.filter((s) => (shapeId ? s.id !== shapeId : !s.selected))
    );
  };

  const selectedShapes = shapes.filter((s) => s.selected);
  const selectedShape = shapes.find((s) => s.selected) || null;

  const handleUpdateShape = (updatedShape: Shape) => {
    setShapes((prev) =>
      prev.map((s) => {
        if (s.id === updatedShape.id) {
          return updatedShape;
        }
        // si la nueva forma está seleccionada, deseleccionar las demás
        return updatedShape.selected ? { ...s, selected: false, isEditing: false } : s;
      })
    );
  };

  const handleSelectShape = (shapeId: string, isShiftPressed: boolean) => {
    setShapes((prev) => {
      if (isShiftPressed) {
        return prev.map((s) =>
          s.id === shapeId ? { ...s, selected: !s.selected } : s
        );
      } else {
        const isAlreadySelected = prev.find(s => s.id === shapeId)?.selected;
        // no deseleccionar si ya está seleccionada (para permitir doble clic)
        if (isAlreadySelected && prev.filter(s => s.selected).length === 1) {
          return prev;
        }
        return prev.map((s) => ({
          ...s,
          selected: s.id === shapeId,
          isEditing: false, // salir del modo de edición de texto
        }));
      }
    });
  };

  const handleAlign = (alignment: "left" | "center-h" | "right" | "top" | "center-v" | "bottom") => {
    if (selectedShapes.length < 1) return;
    const CANVAS_WIDTH = 1000;
    const CANVAS_HEIGHT = 700;
    const targetX = { left: 0, "center-h": CANVAS_WIDTH / 2, right: CANVAS_WIDTH };
    const targetY = { top: 0, "center-v": CANVAS_HEIGHT / 2, bottom: CANVAS_HEIGHT };
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
        if (s.id === shapeId && s.vertices && s.vertices.length > 3) {
          const newVertices = [...s.vertices];
          newVertices.splice(vertexIndex, 1);
          return { ...s, vertices: newVertices };
        }
        return s;
      })
    );
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    setShapes(prev =>
      prev.map(s => {
        if (!s.selected) return s;
        if (direction === 'horizontal') {
          return { ...s, flippedX: !s.flippedX };
        }
        return { ...s, flippedY: !s.flippedY };
      })
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar atajos si se está escribiendo en un input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.ctrlKey || e.metaKey) { // metaKey es para Command en Mac
        if (e.key === 'z') undo();
        if (e.key === 'y') redo();
        if (e.key === 'c') copySelection();
        if (e.key === 'v') pasteFromClipboard();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, copySelection, pasteFromClipboard]);

  // Efecto para reasignar figuras si su piso es eliminado
  useEffect(() => {
    const floorIds = new Set(floors.map(f => f.id));
    const defaultFloorId = floors[0]?.id;

    // Comprobar si alguna figura necesita ser actualizada
    const needsUpdate = shapes.some(s => s.floorId && !floorIds.has(s.floorId));

    if (needsUpdate && defaultFloorId) {
      setShapes(prevShapes => prevShapes.map(s => 
        s.floorId && !floorIds.has(s.floorId) ? { ...s, floorId: defaultFloorId } : s
      ));
    }
  }, [floors, shapes, setShapes]);

  const handleZoom = useCallback((direction: 'in' | 'out' | 'reset') => {
    const currentZoom = canvasSettings.zoom;
    const ZOOM_STEP = 0.1;
    if (direction === 'in') setZoom(currentZoom + ZOOM_STEP);
    if (direction === 'out') setZoom(Math.max(0.1, currentZoom - ZOOM_STEP)); // No permitir zoom menor a 10%
    if (direction === 'reset') setZoom(1);
  }, [canvasSettings.zoom, setZoom]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoom('in');
        } else {
          handleZoom('out');
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleZoom]);

  return (
    <main className="flex flex-col min-h-screen">
      <Toolbar
        onNewMap={handleNewMap}
        onAddRect={handleAddRect}
        onAddText={handleAddText}
        onBatchLabel={handleBatchLabel}
        onAlign={handleAlign}
        canAlign={selectedShapes.length > 0}
        onFlip={handleFlip}
        canFlip={selectedShapes.length > 0}
        onExport={handleExport}
        onImport={handleImport}
        onDelete={selectedShapes.length > 0 ? () => handleDelete() : undefined}
        zoom={canvasSettings.zoom}
        onZoomIn={() => handleZoom('in')}
        onZoomOut={() => handleZoom('out')}
        onZoomReset={() => handleZoom('reset')}
      />
      <div className="flex flex-1 overflow-hidden">
        <div
          ref={canvasContainerRef}
          className="flex-1 p-4 bg-gray-100 overflow-auto grid place-items-center"
          onDoubleClick={(e) => {
            // Si el doble clic es en el fondo y no en una figura
            if (e.target === e.currentTarget) {
              setShapes(prev => prev.map(s => ({ ...s, selected: false, editingVertices: false })));
            }
          }}
        >
          <div
            className="relative"
            style={{ transform: `scale(${canvasSettings.zoom})` }}
          >
            <Canvas
              shapes={shapes}
              settings={canvasSettings}
              setShapes={setShapes}
              onUpdateShape={handleUpdateShape}
              onUpdateDuringDrag={updateShapesDuringDrag}
              onSelectShape={handleSelectShape}
              onDeleteShape={handleDelete}
              onDeleteVertex={handleDeleteVertex}
              floors={floors}
            />
          </div>
        </div>
        <PropertiesPanel
          selectedShape={selectedShape}
          onUpdate={handleUpdateShape}
          canvasSettings={canvasSettings}
          floors={floors}
          setFloors={setFloors}
          onAlign={handleAlign}
          onFlip={handleFlip}
          onCanvasSettingsChange={setCanvasSettings}
        />
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <SeatmapProvider>
      <Editor />
    </SeatmapProvider>
  );
}
