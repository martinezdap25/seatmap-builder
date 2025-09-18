export type Seat = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type Shape = {
  id: string;
  type: "rect";
  category: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  seats: Seat[];
  selected?: boolean;
};

export type SeatMap = {
  id: string;
  name: string;
  shapes: Shape[];
};
