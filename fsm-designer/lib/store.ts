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
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    onReconnect: (oldEdge: Edge, newConnection: Connection) => void;
    addNode: () => void;
    updateNodeLabel: (id: string, label: string) => void;
    updateEdgeLabel: (id: string, label: string) => void;
}

// TODO: This needs expansion for renaming things
export const useStore = create<FSMState>((set, get) => ({
    nodes: [{ id: "1", position: { x: 100, y: 100 }, data: { label: "IDLE" }, type: "stateNode" }],
    edges: [],
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
        // FIXME: Random is a bad way of assigning ids if not checking that clashes occur
        const label = prompt("Name this state:") || "NEW_STATE";
        const id = Math.random().toString(36).substr(2, 9);
        const newNode = {
            id,
            type: "stateNode",
            data: { label: label.toUpperCase() },
            position: { x: Math.random() * 400, y: Math.random() * 400 },
        };
        set({ nodes: [...get().nodes, newNode] });
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
}));
