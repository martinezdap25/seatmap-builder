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
    (updater: { backgroundColor: string } | ((prev: { backgroundColor: string }) => { backgroundColor: string })) => {
      const newSettings =
        typeof updater === "function" ? updater(state.canvasSettings) : updater;
      dispatch({ type: "SET_CANVAS_SETTINGS", payload: newSettings });
    },
    [state.canvasSettings, dispatch]
  );

  return {
    // Estado
    shapes: state.shapes,
    floors: state.floors,
    canvasSettings: state.canvasSettings,
    // Acciones
    setShapes,
    undo,
    redo,
    setFloors,
    setCanvasSettings,
    // Para la UI
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
  };
};