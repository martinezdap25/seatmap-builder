/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Rect, Text } from "react-konva";
import { useState } from "react";

export default function Seat({ seat }: { seat: any }) {
    const [selected, setSelected] = useState(seat.selected);

    return (
        <>
            <Rect
                x={seat.x}
                y={seat.y}
                width={40}
                height={40}
                fill={selected ? "dodgerblue" : "lightgray"}
                stroke="black"
                strokeWidth={1}
                cornerRadius={8}
                shadowBlur={selected ? 10 : 0}
                onClick={() => setSelected(!selected)}
            />
            <Text
                x={seat.x}
                y={seat.y + 45}
                text={seat.label}
                fontSize={14}
                fill="black"
                width={40}
                align="center"
            />
        </>
    );
}
