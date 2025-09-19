"use client";

import { Shape } from "@/types/types";
import { useState, useCallback } from "react";

export interface Guide {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface SnapConfig {
  threshold?: number;
}

export function useVertexSnapping(config: SnapConfig = {}) {
  const { threshold = 5 } = config;
  const [guides, setGuides] = useState<Guide[]>([]);

  const getVertexSnap = useCallback(
    (
      movingVertex: { x: number; y: number },
      shapePosition: { x: number; y: number },
      staticShapes: Shape[]
    ) => {
      const movingPoint = {
        x: shapePosition.x + movingVertex.x,
        y: shapePosition.y + movingVertex.y,
      };

      let snapX: number | null = null;
      let snapY: number | null = null;
      const newGuides: Guide[] = [];

      const staticVertices = staticShapes.flatMap(s => 
        s.vertices?.map(v => ({
          x: s.x + v.x,
          y: s.y + v.y,
        })) ?? []
      );

      for (const staticVertex of staticVertices) {
        // Snap Horizontal (misma Y)
        if (Math.abs(movingPoint.y - staticVertex.y) < threshold) {
          snapY = staticVertex.y;
          newGuides.push({
            y: staticVertex.y,
            x: Math.min(movingPoint.x, staticVertex.x),
            width: Math.abs(movingPoint.x - staticVertex.x),
          });
        }

        // Snap Vertical (misma X)
        if (Math.abs(movingPoint.x - staticVertex.x) < threshold) {
          snapX = staticVertex.x;
          newGuides.push({
            x: staticVertex.x,
            y: Math.min(movingPoint.y, staticVertex.y),
            height: Math.abs(movingPoint.y - staticVertex.y),
          });
        }
      }

      setGuides(newGuides);

      return {
        x: snapX !== null ? snapX - shapePosition.x : movingVertex.x,
        y: snapY !== null ? snapY - shapePosition.y : movingVertex.y,
      };
    },
    [threshold]
  );

  const clearGuides = useCallback(() => {
    setGuides([]);
  }, []);

  return {
    vertexSnapGuides: guides,
    getVertexSnap,
    clearVertexSnapGuides: clearGuides,
  };
}