export type Seat = {
  id: string;
  label: string;
  // Posición relativa dentro de la forma
};

export type Shape = {
  id: string;
  type: "rect" | "polygon";
  category: string;
  x: number;
  y: number;
  width?: number; // Opcional, ya que los polígonos no lo usan directamente
  height?: number; // Opcional
  rotation?: number; // en grados
  vertices?: { x: number; y: number }[]; // Para polígonos
  label?: string; // Para el texto dentro de la figura
  seats: Seat[];
  selected?: boolean;
  editingVertices?: boolean; // Nuevo estado para el modo de edición
};

export type SeatMap = {
  id: string;
  name: string;
  shapes: Shape[];
};
