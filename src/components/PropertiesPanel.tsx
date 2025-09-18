"use client";

import { Shape, TextOptions } from "@/types/types";
import { AlignLeft, AlignCenter, AlignRight, Bold } from "lucide-react";

interface CanvasSettings {
  backgroundColor: string;
}

interface PropertiesPanelProps {
  selectedShape: Shape | null;
  onUpdate: (updatedShape: Shape) => void;
  canvasSettings: CanvasSettings;
  onCanvasSettingsChange: (settings: CanvasSettings) => void;
}

function PropertyInput({ label, value, onChange }: { label: string; value: number; onChange: (newValue: number) => void; }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type="number"
        value={Math.round(value)}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-20 p-1 border border-gray-300 rounded-md text-sm text-right"
      />
    </div>
  );
}

export default function PropertiesPanel({
  selectedShape,
  onUpdate,
  canvasSettings,
  onCanvasSettingsChange,
}: PropertiesPanelProps) {
  if (!selectedShape) {
    return (
      <div className="w-64 p-4 border-l border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-800 mb-4">Propiedades del Canvas</h3>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Fondo</label>
          <input
            type="color"
            value={canvasSettings.backgroundColor}
            onChange={(e) => onCanvasSettingsChange({ ...canvasSettings, backgroundColor: e.target.value })}
            className="w-10 h-8 p-1 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    );
  }

  const handleUpdate = (prop: keyof Shape, value: unknown) => {
    onUpdate({ ...selectedShape, [prop]: value });
  };

  const handleTextOptionUpdate = (prop: keyof TextOptions, value: unknown) => {
    onUpdate({ ...selectedShape, textOptions: { ...selectedShape.textOptions, [prop]: value } });
  };

  return (
    <div className="w-64 p-4 border-l border-gray-200 bg-gray-50">
      <h3 className="font-semibold text-gray-800 mb-4">Propiedades</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">Etiqueta</label>
          <input
            type="text"
            value={selectedShape.label || ''}
            onChange={(e) => handleUpdate('label', e.target.value)}
            className="w-full mt-1 p-1 border border-gray-300 rounded-md text-sm"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <button onClick={() => handleTextOptionUpdate('align', 'left')} className={`p-1 rounded ${selectedShape.textOptions?.align === 'left' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}><AlignLeft size={16} /></button>
              <button onClick={() => handleTextOptionUpdate('align', 'center')} className={`p-1 rounded ${selectedShape.textOptions?.align === 'center' || !selectedShape.textOptions?.align ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}><AlignCenter size={16} /></button>
              <button onClick={() => handleTextOptionUpdate('align', 'right')} className={`p-1 rounded ${selectedShape.textOptions?.align === 'right' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}><AlignRight size={16} /></button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleTextOptionUpdate('isBold', !selectedShape.textOptions?.isBold)} className={`p-1 rounded ${selectedShape.textOptions?.isBold ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}><Bold size={16} /></button>
              <input
                type="color"
                value={selectedShape.textOptions?.color || '#333333'}
                onChange={(e) => handleTextOptionUpdate('color', e.target.value)}
                className="w-8 h-7 p-0.5 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        <PropertyInput
          label="Posición X"
          value={selectedShape.x}
          onChange={(val) => handleUpdate('x', val)}
        />
        <PropertyInput
          label="Posición Y"
          value={selectedShape.y}
          onChange={(val) => handleUpdate('y', val)}
        />
        <PropertyInput
          label="Ancho"
          value={selectedShape.width ?? 0}
          onChange={(val) => handleUpdate('width', val)}
        />
        <PropertyInput
          label="Alto"
          value={selectedShape.height ?? 0}
          onChange={(val) => handleUpdate('height', val)}
        />
        <PropertyInput
          label="Rotación"
          value={selectedShape.rotation ?? 0}
          onChange={(val) => handleUpdate('rotation', val)}
        />
      </div>
    </div>
  );
}