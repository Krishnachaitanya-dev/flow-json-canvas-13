
import { useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface CustomNodeData {
  label: string;
  description?: string;
  nodeColor?: string;
}

export function CustomNode({ data, isConnectable }: NodeProps<CustomNodeData>) {
  const handleStyle = {
    width: '8px',
    height: '8px',
    backgroundColor: '#3182CE',
  };

  const onLabelChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    console.log('label changed:', evt.target.value);
  }, []);

  const onDescriptionChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('description changed:', evt.target.value);
  }, []);

  return (
    <Card className="w-64 shadow-md" style={{ backgroundColor: data.nodeColor || '#ffffff' }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={handleStyle}
      />
      <CardHeader className="p-3 pb-0">
        <CardTitle>
          <input
            className="w-full bg-transparent text-sm font-medium border-none outline-none focus:ring-0 p-0"
            defaultValue={data.label}
            onChange={onLabelChange}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <textarea
          className="w-full bg-transparent text-xs text-gray-600 border-none outline-none focus:ring-0 resize-none p-0"
          defaultValue={data.description || ''}
          onChange={onDescriptionChange}
          rows={2}
        />
      </CardContent>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={handleStyle}
      />
    </Card>
  );
}
