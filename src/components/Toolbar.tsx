"use client";

import { Button } from "./ui/button";
import { Plus, Square, Download, Upload, Trash2, Tag } from "lucide-react";

interface ToolbarProps {
  onNewMap: () => void;
  onAddRect: () => void;
  onBatchLabel: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onDelete: () => void;
}

export default function Toolbar({
  onNewMap,
  onAddRect,
  onBatchLabel,
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

      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="text-red-600 border-red-400"
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
