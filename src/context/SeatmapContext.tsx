"use client";

import { Shape, Floor } from "@/types/types";
import { produce } from "immer";
import { createContext, useReducer, ReactNode } from "react";

// --- 1. Definir el Estado y las Acciones ---

export interface SeatmapState {
  shapes: Shape[];
  history: Shape[][];
  historyIndex: number;
  floors: Floor[];
  canvasSettings: {
    backgroundColor: string;
    zoom: number;
  };
  clipboard: Shape | null;
}

export const initialState: SeatmapState = {
  shapes: [],
  history: [[]],
  historyIndex: 0,
  floors: [{ id: "default", name: "Piso por defecto", color: "#87CEEB" }],
  canvasSettings: {
    backgroundColor: "#ffffff",
    zoom: 1, // 1 = 100%
  },
  clipboard: null,
};

export type Action =
  | { type: "SET_SHAPES"; payload: Shape[] }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_FLOORS"; payload: Floor[] }
  | { type: "SET_CANVAS_SETTINGS"; payload: { backgroundColor: string; zoom: number } }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "COPY_SELECTION" }
  | { type: "PASTE_FROM_CLIPBOARD" }
  | { type: "UPDATE_SHAPES_DURING_DRAG"; payload: Shape[] };

// --- 2. Crear el Reducer ---

export const seatmapReducer = produce((draft: SeatmapState, action: Action) => {
  switch (action.type) {
    case "SET_SHAPES": {
      if (JSON.stringify(action.payload) !== JSON.stringify(draft.shapes)) {
        // Solo guardamos en el historial en la acción final, no durante el arrastre
        const newHistory = draft.history.slice(0, draft.historyIndex + 1);
        newHistory.push(action.payload);
        draft.history = newHistory;
        draft.historyIndex = newHistory.length - 1;
      }
      draft.shapes = action.payload;
      break;
    }
    case "UNDO": {
      if (draft.historyIndex > 0) {
        draft.historyIndex--;
        draft.shapes = draft.history[draft.historyIndex];
      }
      break;
    }
    case "REDO": {
      if (draft.historyIndex < draft.history.length - 1) {
        draft.historyIndex++;
        draft.shapes = draft.history[draft.historyIndex];
      }
      break;
    }
    case "SET_FLOORS": {
      draft.floors = action.payload;
      break;
    }
    case "SET_CANVAS_SETTINGS": {
      draft.canvasSettings = action.payload;
      break;
    }
    case "SET_ZOOM": {
      draft.canvasSettings.zoom = action.payload;
      break;
    }
    case "COPY_SELECTION": {
      const selectedShape = draft.shapes.find(s => s.selected);
      if (selectedShape) {
        draft.clipboard = { ...selectedShape, selected: false };
      }
      break;
    }
    case "PASTE_FROM_CLIPBOARD": {
      if (draft.clipboard) {
        const newShape: Shape = {
          ...draft.clipboard,
          id: crypto.randomUUID(),
          x: draft.clipboard.x + 20, // Offset para que no se pegue encima
          y: draft.clipboard.y + 20,
          selected: true, // La nueva figura queda seleccionada
        };
        // Deseleccionar todas las demás
        draft.shapes.forEach(s => s.selected = false);
        draft.shapes.push(newShape);
        // Actualizar historial
        const newHistory = draft.history.slice(0, draft.historyIndex + 1);
        newHistory.push(draft.shapes);
        draft.history = newHistory;
        draft.historyIndex = newHistory.length - 1;
      }
      break;
    }
    case "UPDATE_SHAPES_DURING_DRAG": {
      // Actualiza el estado visual sin afectar el historial
      draft.shapes = action.payload;
      break;
    }
  }
});

// --- 3. Crear el Contexto y el Provider ---

export type SeatmapContextType = {
  state: SeatmapState;
  dispatch: React.Dispatch<Action>;
};

export const SeatmapContext = createContext<SeatmapContextType | null>(null);

export const SeatmapProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(seatmapReducer, initialState);

  return (
    <SeatmapContext.Provider value={{ state, dispatch }}>
      {children}
    </SeatmapContext.Provider>
  );
};