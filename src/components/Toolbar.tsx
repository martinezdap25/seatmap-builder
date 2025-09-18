"use client";

import { Button } from "./ui/Button";
import {
  Plus,
  Square,
  Download,
  Upload,
  Trash2,
  Tag,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from "lucide-react";

interface ToolbarProps {
  onNewMap: () => void;
  onAddRect: () => void;
  onBatchLabel: () => void;
  onAlign: (
    alignment: "left" | "center-h" | "right" | "top" | "center-v" | "bottom"
  ) => void;
  canAlign: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  onDelete?: () => void; // Hacemos la prop opcional
}

export default function Toolbar({
  onNewMap,
  onAddRect,
  onBatchLabel,
  onAlign,
  canAlign,
  onExport,
  onImport,
  onDelete,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200 shadow-sm">
      <Button variant="outline" size="sm" onClick={onNewMap}>
        <Plus size={16} /> Nuevo
      </Button>

      <Button variant="outline" size="sm" onClick={onAddRect}>
        <Square size={16} /> Agregar Rectángulo
      </Button>

      <Button variant="outline" size="sm" onClick={onBatchLabel}>
        <Tag size={16} /> Etiquetar
      </Button>

      <div className="h-6 w-px bg-gray-300 mx-2"></div>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={!canAlign} onClick={() => onAlign("left")} title="Alinear a la Izquierda">
          <AlignHorizontalJustifyStart size={16} />
        </Button>
        <Button variant="outline" size="sm" disabled={!canAlign} onClick={() => onAlign("center-h")} title="Centrar Horizontalmente">
          <AlignHorizontalJustifyCenter size={16} />
        </Button>
        <Button variant="outline" size="sm" disabled={!canAlign} onClick={() => onAlign("right")} title="Alinear a la Derecha">
          <AlignHorizontalJustifyEnd size={16} />
        </Button>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-1"></div>

      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={!canAlign} onClick={() => onAlign("top")} title="Alinear Arriba">
          <AlignVerticalJustifyStart size={16} />
        </Button>
        <Button variant="outline" size="sm" disabled={!canAlign} onClick={() => onAlign("center-v")} title="Centrar Verticalmente">
          <AlignVerticalJustifyCenter size={16} />
        </Button>
        <Button variant="outline" size="sm" disabled={!canAlign} onClick={() => onAlign("bottom")} title="Alinear Abajo">
          <AlignVerticalJustifyEnd size={16} />
        </Button>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-2"></div>

      <Button
        variant="outline"
        size="sm"
        onClick={onDelete} // onDelete puede ser undefined
        disabled={!onDelete} // Deshabilitamos el botón si onDelete no se pasa
        className="disabled:opacity-50 disabled:cursor-not-allowed text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 size={16} /> Eliminar
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download size={16} /> Exportar
        </Button>
        <label className="flex items-center gap-1 cursor-pointer text-sm px-2 py-1 border rounded-md border-gray-300 hover:bg-gray-100">
          <Upload size={16} />
          Importar
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
          />
        </label>
      </div>
    </div>
  );
}
