"use client";

import { Guide } from "@/hooks/useSmartGuides";

interface SmartGuidesOverlayProps {
  guides: Guide[];
}

export default function SmartGuidesOverlay({ guides }: SmartGuidesOverlayProps) {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {guides.map((guide, index) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          backgroundColor: 'cyan',
          opacity: 0.7,
        };
        if (guide.x !== undefined) {
          style.left = guide.x;
          style.top = guide.y;
          style.width = 1;
          style.height = guide.height;
        } else if (guide.y !== undefined) {
          style.left = guide.x;
          style.top = guide.y;
          style.height = 1;
          style.width = guide.width;
        }
        return <div key={index} style={style} />;
      })}
    </div>
  );
}