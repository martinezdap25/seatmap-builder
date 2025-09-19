"use client";

import { Shape, Floor } from "@/types/types";
import { useContext, useCallback } from "react";
import { SeatmapContext } from "@/context/SeatmapContext";

// --- 4. Crear el Hook de Acceso ---

export const useSeatmapStore = () => {
  const context = useContext(SeatmapContext);
  if (!context) {
    throw new Error("useSeatmapStore debe usarse dentro de un SeatmapProvider");
  }

  const { state, dispatch } = context;

  // --- 5. Crear Acciones Despachables (Action Creators) ---

  const setShapes = useCallback(
    (updater: Shape[] | ((prev: Shape[]) => Shape[])) => {
      const newShapes =
        typeof updater === "function" ? updater(state.shapes) : updater;
      dispatch({ type: "SET_SHAPES", payload: newShapes });
    },
    [state.shapes, dispatch]
  );

  const updateShapesDuringDrag = useCallback(
    (newShapes: Shape[]) => {
      dispatch({ type: "UPDATE_SHAPES_DURING_DRAG", payload: newShapes });
    },
    [dispatch]
  );

  const undo = useCallback(() => dispatch({ type: "UNDO" }), [dispatch]);
  const redo = useCallback(() => dispatch({ type: "REDO" }), [dispatch]);

  const setFloors = useCallback(
    (updater: Floor[] | ((prev: Floor[]) => Floor[])) => {
      const newFloors =
        typeof updater === "function" ? updater(state.floors) : updater;
      dispatch({ type: "SET_FLOORS", payload: newFloors });
    },
    [state.floors, dispatch]
  );

  const setCanvasSettings = useCallback(
    (updater: { backgroundColor: string; zoom: number } | ((prev: { backgroundColor: string; zoom: number }) => { backgroundColor: string; zoom: number })) => {
      const newSettings =
        typeof updater === "function" ? updater(state.canvasSettings) : updater;
      dispatch({ type: "SET_CANVAS_SETTINGS", payload: newSettings });
    },
    [state.canvasSettings, dispatch]
  );

  const setZoom = useCallback(
    (newZoom: number) => {
      dispatch({ type: "SET_ZOOM", payload: newZoom });
    },
    [dispatch]
  );

  const copySelection = useCallback(() => dispatch({ type: "COPY_SELECTION" }), [dispatch]);
  const pasteFromClipboard = useCallback(() => dispatch({ type: "PASTE_FROM_CLIPBOARD" }), [dispatch]);

  return {
    // Estado
    shapes: state.shapes,
    floors: state.floors,
    canvasSettings: state.canvasSettings,
    // Acciones
    setShapes,
    updateShapesDuringDrag,
    undo,
    redo,
    setFloors,
    setCanvasSettings,
    setZoom,
    copySelection,
    pasteFromClipboard,
    // Para la UI
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
  };
};