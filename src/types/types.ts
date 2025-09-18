export type Seat = {
  id: string;
  label: string;
  // Posición relativa dentro de la forma
};

export type Shape = {
  id: string;
  type: "rect"; // Por ahora solo rectángulos
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  seats: Seat[];
  selected?: boolean;
};

export type SeatMap = {
  id: string;
  name: string;
  shapes: Shape[];
};
