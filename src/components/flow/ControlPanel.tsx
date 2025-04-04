
import { useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";

const nodeTypes = [
  { type: 'process', label: 'Process', color: '#f0f9ff' },
  { type: 'decision', label: 'Decision', color: '#ebf8ff' },
  { type: 'output', label: 'Output', color: '#e6fffa' },
];

export function ControlPanel() {
  const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <div className="w-48">
      <h3 className="text-sm font-medium mb-2">Node Types</h3>
      <div className="space-y-2">
        {nodeTypes.map((nodeType) => (
          <div
            key={nodeType.type}
            className="p-2 border rounded cursor-move hover:border-primary transition-colors"
            onDragStart={(event) => onDragStart(event, nodeType.type)}
            draggable
            style={{ backgroundColor: nodeType.color }}
          >
            {nodeType.label}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Instructions:</h3>
        <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
          <li>Drag node types onto the canvas</li>
          <li>Connect nodes by dragging from outputs to inputs</li>
          <li>Edit text by clicking on node labels</li>
        </ul>
      </div>
    </div>
  );
}
