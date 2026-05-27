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
} from "@xyflow/react";

interface FSMState {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    addNode: (label: string) => void;
}

// TODO: This needs expansion for renaming things
export const useStore = create<FSMState>((set, get) => ({
    nodes: [{ id: "1", position: { x: 100, y: 100 }, data: { label: "IDLE" }, type: "default" }],
    edges: [],
    onNodesChange: (changes: NodeChange[]) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
    },
    onConnect: (connection: Connection) => {
        set({ edges: addEdge({ ...connection, label: "EVENT" }, get().edges) });
    },
    addNode: (label: string) => {
        // FIXME: Random is a bad way of assigning ids if not checking that clashes occur
        const id = Math.random().toString(36).substr(2, 9);
        const newNode = {
            id,
            data: { label: label.toUpperCase() },
            position: { x: Math.random() * 400, y: Math.random() * 400 },
        };
        set({ nodes: [...get().nodes, newNode] });
    },
}));
