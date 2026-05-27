import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    OnConnect,
    OnNodesChange,
    OnEdgesChange,
    reconnectEdge,
    MarkerType,
} from "@xyflow/react";

interface FSMState {
    nodes: Node[];
    edges: Edge[];
    nodeCounter: number;
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    onReconnect: (oldEdge: Edge, newConnection: Connection) => void;
    addNode: () => void;
    updateNodeLabel: (id: string, label: string) => void;
    updateEdgeLabel: (id: string, label: string) => void;
    systemContext: string;
    setSystemContext: (context: string) => void;
    loadProject: (data: { nodes: Node[]; edges: Edge[]; nodeCounter: number; systemContext: string }) => void;
    resetProject: () => void;
}

export const useStore = create<FSMState>((set, get) => ({
    nodes: [{ id: "state_0", position: { x: 100, y: 100 }, data: { label: "INIT" }, type: "stateNode" }],
    edges: [],
    nodeCounter: 1,
    onNodesChange: (changes: NodeChange[]) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
    },
    onConnect: (connection: Connection) => {
        set({
            edges: addEdge(
                {
                    ...connection,
                    type: "smart",
                    label: "EVENT",
                    labelStyle: { fill: "#3b82f6", fontWeight: 700 },
                    animated: false,
                    style: { stroke: "#3b82f6", strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: "#3b82f6",
                    },
                },
                get().edges,
            ),
        });
    },
    onReconnect: (oldEdge, newConnection) => {
        set({
            edges: reconnectEdge(oldEdge, newConnection, get().edges),
        });
    },
    addNode: () => {
        const { nodeCounter, nodes } = get();
        const label = prompt("Name this state:") || `STATE_${nodeCounter}`;
        const sanitizedLabel = label.toUpperCase().replace(/\s+/g, "_");

        const id = `node_${nodeCounter}`;

        const newNode = {
            id,
            type: "stateNode",
            data: { label: sanitizedLabel },
            position: { x: 100, y: 250 },
        };
        set({ nodes: [...nodes, newNode], nodeCounter: nodeCounter + 1 });
    },
    updateNodeLabel: (id: string, label: string) => {
        set({
            nodes: get().nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, label } } : node)),
        });
    },
    updateEdgeLabel: (id: string, label: string) => {
        set({
            edges: get().edges.map((edge) => (edge.id === id ? { ...edge, label } : edge)),
        });
    },
    systemContext: "Target: ARM Cortex-M4\nLanguage: C99\nConstraints: Minimal memory usage, no dynamic allocation.",
    setSystemContext: (context: string) => set({ systemContext: context }),
    loadProject: (data) => {
        set({
            nodes: data.nodes || [],
            edges: data.edges || [],
            nodeCounter: data.nodeCounter || 0,
            systemContext: data.systemContext || "",
        });
    },
    resetProject: () => {
        const initialNode = {
            id: "node_0",
            type: "stateNode",
            data: { label: "INIT" },
            position: { x: 100, y: 100 },
        };

        set({
            nodes: [initialNode],
            edges: [],
            nodeCounter: 1, // Start next node at 1
            systemContext: "Target: ARM Cortex-M4...",
        });
    },
}));
