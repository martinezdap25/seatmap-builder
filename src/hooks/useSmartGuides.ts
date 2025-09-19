"use client";

import { Shape } from "@/types/types";
import { useState, useCallback } from "react";

export interface Guide {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface SmartGuidesConfig {
  snapThreshold?: number;
  showGuides?: boolean;
}

export function useSmartGuides(config: SmartGuidesConfig = {}) {
  const { snapThreshold = 5, showGuides = true } = config;
  const [guides, setGuides] = useState<Guide[]>([]);

  const getSnapLines = useCallback((movingShape: Shape, staticShapes: Shape[]) => {
    const movingBox = {
      left: movingShape.x,
      right: movingShape.x + (movingShape.width ?? 0),
      top: movingShape.y,
      bottom: movingShape.y + (movingShape.height ?? 0),
      hCenter: movingShape.x + (movingShape.width ?? 0) / 2,
      vCenter: movingShape.y + (movingShape.height ?? 0) / 2,
    };

    let snapX: number | null = null;
    let snapY: number | null = null;
    const newGuides: Guide[] = [];

    for (const staticShape of staticShapes) {
      if (staticShape.id === movingShape.id) continue;

      const staticBox = {
        left: staticShape.x,
        right: staticShape.x + (staticShape.width ?? 0),
        top: staticShape.y,
        bottom: staticShape.y + (staticShape.height ?? 0),
        hCenter: staticShape.x + (staticShape.width ?? 0) / 2,
        vCenter: staticShape.y + (staticShape.height ?? 0) / 2,
      };

      const checkSnap = (a: number, b: number, setSnap: (val: number) => void, currentSnap: number | null) => {
        if (Math.abs(a - b) < snapThreshold) {
          if (currentSnap === null || Math.abs(a - b) < Math.abs(a - currentSnap)) {
            setSnap(b);
            return true;
          }
        }
        return false;
      };

      // Horizontal Snapping (X axis)
      if (checkSnap(movingBox.left, staticBox.left, (val) => snapX = val, snapX)) newGuides.push({ x: staticBox.left, y: Math.min(movingBox.top, staticBox.top), height: Math.max(movingBox.bottom, staticBox.bottom) - Math.min(movingBox.top, staticBox.top) });
      if (checkSnap(movingBox.left, staticBox.right, (val) => snapX = val, snapX)) newGuides.push({ x: staticBox.right, y: Math.min(movingBox.top, staticBox.top), height: Math.max(movingBox.bottom, staticBox.bottom) - Math.min(movingBox.top, staticBox.top) });
      if (checkSnap(movingBox.left, staticBox.hCenter, (val) => snapX = val, snapX)) newGuides.push({ x: staticBox.hCenter, y: Math.min(movingBox.top, staticBox.top), height: Math.max(movingBox.bottom, staticBox.bottom) - Math.min(movingBox.top, staticBox.top) });

      if (checkSnap(movingBox.right, staticBox.left, (val) => snapX = val - (movingShape.width ?? 0), snapX)) newGuides.push({ x: staticBox.left, y: Math.min(movingBox.top, staticBox.top), height: Math.max(movingBox.bottom, staticBox.bottom) - Math.min(movingBox.top, staticBox.top) });
      if (checkSnap(movingBox.right, staticBox.right, (val) => snapX = val - (movingShape.width ?? 0), snapX)) newGuides.push({ x: staticBox.right, y: Math.min(movingBox.top, staticBox.top), height: Math.max(movingBox.bottom, staticBox.bottom) - Math.min(movingBox.top, staticBox.top) });
      if (checkSnap(movingBox.right, staticBox.hCenter, (val) => snapX = val - (movingShape.width ?? 0), snapX)) newGuides.push({ x: staticBox.hCenter, y: Math.min(movingBox.top, staticBox.top), height: Math.max(movingBox.bottom, staticBox.bottom) - Math.min(movingBox.top, staticBox.top) });

      if (checkSnap(movingBox.hCenter, staticBox.left, (val) => snapX = val - (movingShape.width ?? 0) / 2, snapX)) newGuides.push({ x: staticBox.left, y: Math.min(movingBox.top, staticBox.top), height: Math.max(movingBox.bottom, staticBox.bottom) - Math.min(movingBox.top, staticBox.top) });
      if (checkSnap(movingBox.hCenter, staticBox.right, (val) => snapX = val - (movingShape.width ?? 0) / 2, snapX)) newGuides.push({ x: staticBox.right, y: Math.min(movingBox.top, staticBox.top), height: Math.max(movingBox.bottom, staticBox.bottom) - Math.min(movingBox.top, staticBox.top) });
      if (checkSnap(movingBox.hCenter, staticBox.hCenter, (val) => snapX = val - (movingShape.width ?? 0) / 2, snapX)) newGuides.push({ x: staticBox.hCenter, y: Math.min(movingBox.top, staticBox.top), height: Math.max(movingBox.bottom, staticBox.bottom) - Math.min(movingBox.top, staticBox.top) });

      // Vertical Snapping (Y axis)
      if (checkSnap(movingBox.top, staticBox.top, (val) => snapY = val, snapY)) newGuides.push({ y: staticBox.top, x: Math.min(movingBox.left, staticBox.left), width: Math.max(movingBox.right, staticBox.right) - Math.min(movingBox.left, staticBox.left) });
      if (checkSnap(movingBox.top, staticBox.bottom, (val) => snapY = val, snapY)) newGuides.push({ y: staticBox.bottom, x: Math.min(movingBox.left, staticBox.left), width: Math.max(movingBox.right, staticBox.right) - Math.min(movingBox.left, staticBox.left) });
      if (checkSnap(movingBox.top, staticBox.vCenter, (val) => snapY = val, snapY)) newGuides.push({ y: staticBox.vCenter, x: Math.min(movingBox.left, staticBox.left), width: Math.max(movingBox.right, staticBox.right) - Math.min(movingBox.left, staticBox.left) });

      if (checkSnap(movingBox.bottom, staticBox.top, (val) => snapY = val - (movingShape.height ?? 0), snapY)) newGuides.push({ y: staticBox.top, x: Math.min(movingBox.left, staticBox.left), width: Math.max(movingBox.right, staticBox.right) - Math.min(movingBox.left, staticBox.left) });
      if (checkSnap(movingBox.bottom, staticBox.bottom, (val) => snapY = val - (movingShape.height ?? 0), snapY)) newGuides.push({ y: staticBox.bottom, x: Math.min(movingBox.left, staticBox.left), width: Math.max(movingBox.right, staticBox.right) - Math.min(movingBox.left, staticBox.left) });
      if (checkSnap(movingBox.bottom, staticBox.vCenter, (val) => snapY = val - (movingShape.height ?? 0), snapY)) newGuides.push({ y: staticBox.vCenter, x: Math.min(movingBox.left, staticBox.left), width: Math.max(movingBox.right, staticBox.right) - Math.min(movingBox.left, staticBox.left) });

      if (checkSnap(movingBox.vCenter, staticBox.top, (val) => snapY = val - (movingShape.height ?? 0) / 2, snapY)) newGuides.push({ y: staticBox.top, x: Math.min(movingBox.left, staticBox.left), width: Math.max(movingBox.right, staticBox.right) - Math.min(movingBox.left, staticBox.left) });
      if (checkSnap(movingBox.vCenter, staticBox.bottom, (val) => snapY = val - (movingShape.height ?? 0) / 2, snapY)) newGuides.push({ y: staticBox.bottom, x: Math.min(movingBox.left, staticBox.left), width: Math.max(movingBox.right, staticBox.right) - Math.min(movingBox.left, staticBox.left) });
      if (checkSnap(movingBox.vCenter, staticBox.vCenter, (val) => snapY = val - (movingShape.height ?? 0) / 2, snapY)) newGuides.push({ y: staticBox.vCenter, x: Math.min(movingBox.left, staticBox.left), width: Math.max(movingBox.right, staticBox.right) - Math.min(movingBox.left, staticBox.left) });
    }

    if (showGuides) {
      setGuides(newGuides);
    }

    return {
      x: snapX,
      y: snapY,
    };
  }, [snapThreshold, showGuides]);

  const clearGuides = useCallback(() => {
    setGuides([]);
  }, []);

  return { guides, getSnapLines, clearGuides };
}