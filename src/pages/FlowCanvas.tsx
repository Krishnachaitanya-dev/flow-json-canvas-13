
import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  Panel,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CustomNode } from "@/components/flow/CustomNode";
import { ControlPanel } from "@/components/flow/ControlPanel";
import { toast } from "sonner";
import { Save, FileUp, Download, Plus } from 'lucide-react';

// Define custom node types
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Initial nodes and edges
const initialNodes = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 100 },
    data: { label: 'Start', description: 'Begin the process here', nodeColor: '#c6e5ff' },
  },
];

const initialEdges: Edge[] = [];

const FlowCanvas = () => {
  // References
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [jsonInput, setJsonInput] = useState('');

  // Handle node connection
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3182CE' } }, eds)),
    [setEdges],
  );

  // Add new node with click
  const onAddNode = useCallback(() => {
    const newId = (nodes.length + 1).toString();
    const newNode = {
      id: newId,
      type: 'custom',
      position: {
        x: Math.random() * 400 + 50,
        y: Math.random() * 400 + 50,
      },
      data: {
        label: `Node ${newId}`,
        description: 'Description here',
        nodeColor: '#f0f9ff',
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  // Save flow as JSON
  const onSaveFlow = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const dataStr = JSON.stringify(flow, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `flowchart_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Flowchart exported successfully");
    }
  }, [reactFlowInstance]);

  // Load flow from JSON
  const onLoadFlow = useCallback(() => {
    try {
      const flow = JSON.parse(jsonInput);
      
      if (flow.nodes && flow.edges) {
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        toast.success("Flowchart loaded successfully");
      } else {
        toast.error("Invalid JSON format");
      }
    } catch (error) {
      toast.error("Failed to parse JSON");
      console.error(error);
    }
  }, [jsonInput, setNodes, setEdges]);

  // Handle drag and drop
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (reactFlowWrapper.current && reactFlowInstance) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');
        
        // Check if the dropped element is valid
        if (typeof type === 'undefined' || !type) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
        
        const newNode = {
          id: `${nodes.length + 1}`,
          type: 'custom',
          position,
          data: { 
            label: `${type} node`, 
            description: 'New node description',
            nodeColor: type === 'input' ? '#ebf8ff' : type === 'output' ? '#e6fffa' : '#f0f9ff',
          },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, nodes, setNodes],
  );

  return (
    <Layout title="Flow JSON Canvas">
      <div className="h-[calc(100vh-16rem)] flex flex-col gap-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button onClick={onAddNode}>
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onSaveFlow}>
              <Save className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex">
          <div className="flex-1">
            <div className="h-full border rounded-lg overflow-hidden" ref={reactFlowWrapper}>
              <ReactFlowProvider>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={setReactFlowInstance}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  nodeTypes={nodeTypes}
                  fitView
                  attributionPosition="bottom-right"
                >
                  <Controls />
                  <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                  
                  <Panel position="top-left" className="bg-white p-4 border rounded-md shadow-sm">
                    <ControlPanel />
                  </Panel>
                </ReactFlow>
              </ReactFlowProvider>
            </div>
          </div>
        </div>
        
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <h3 className="text-lg font-medium">Import Flow from JSON</h3>
              <div className="flex items-center space-x-2">
                <Textarea
                  placeholder="Paste JSON here"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="flex-1"
                  rows={3}
                />
                <Button onClick={onLoadFlow} className="h-full">
                  <FileUp className="h-4 w-4 mr-2" />
                  Load
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FlowCanvas;
