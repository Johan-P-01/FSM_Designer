"use client";
import React, { useState } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useStore } from "@/lib/store";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SmartBezierEdge } from "@tisoap/react-flow-smart-edge";

import StateNode from "@/components/StateNode";

const MOCK_RESPONSE = {
    c_code: `/**
 * @file fsm_logic.h
 * @brief Auto-generated Finite State Machine
 */

#ifndef FSM_LOGIC_H
#define FSM_LOGIC_H

#include <stdint.h>

/* State Definitions */
typedef enum {
    STATE_IDLE,
    STATE_HEATING,
    STATE_COOLDOWN,
    STATE_ERROR
} fsm_state_t;

/* Event Definitions */
typedef enum {
    EVENT_START_PRESSED,
    EVENT_TEMP_REACHED,
    EVENT_TIMER_EXPIRED,
    EVENT_FAULT_DETECTED
} fsm_event_t;

/**
 * @brief Main FSM Tick function
 * @param current_state Pointer to the current state variable
 * @param event The event to process
 */
void fsm_process_event(fsm_state_t *current_state, fsm_event_t event) {
    switch (*current_state) {
        case STATE_IDLE:
            if (event == EVENT_START_PRESSED) {
                *current_state = STATE_HEATING;
            }
            break;

        case STATE_HEATING:
            if (event == EVENT_TEMP_REACHED) {
                *current_state = STATE_COOLDOWN;
            } else if (event == EVENT_FAULT_DETECTED) {
                *current_state = STATE_ERROR;
            }
            break;

        case STATE_COOLDOWN:
            if (event == EVENT_TIMER_EXPIRED) {
                *current_state = STATE_IDLE;
            }
            break;

        case STATE_ERROR:
            // Recovery logic could be added here
            break;

        default:
            *current_state = STATE_ERROR;
            break;
    }
}

#endif // FSM_LOGIC_H`,
    audit: "• SAFETY WARNING: The 'STATE_HEATING' transition to 'STATE_ERROR' is defined, but there is no hardware shutdown call within the case logic.\n• LOGIC GAP: The 'STATE_ERROR' state is a terminal state (dead-end). Consider adding a 'RESET' event to return to 'STATE_IDLE'.\n• OPTIMIZATION: Current implementation uses a switch-case. For MCUs with very limited flash, a transition table might be more compact.\n• RACE CONDITION: Ensure 'event' is debounced before being passed to this function to prevent rapid state cycling.",
};

const nodeTypes = {
    stateNode: StateNode,
};

const edgeTypes = {
    smart: SmartBezierEdge,
};

export default function App() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onReconnect,
        addNode,
        updateNodeLabel,
        updateEdgeLabel,
    } = useStore();
    const [result, setResult] = useState<{ c_code: string; audit: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const generateCode = async () => {
        setLoading(true);

        // SIMULATE NETWORK DELAY
        setTimeout(() => {
            setResult(MOCK_RESPONSE);
            setLoading(false);
        }, 1000);

        // setLoading(true);
        // try {
        //     const res = await fetch("/api/generate", {
        //         method: "POST",
        //         body: JSON.stringify({ nodes, edges }),
        //     });
        //     const data = await res.json();
        //     console.log(data);
        //     setResult(data);
        // } catch (e) {
        //     console.error("Failed to parse AI response", e);
        // }
        // setLoading(false);
    };

    // Handler for clicking a node (State)
    const onNodeClick = (_: any, node: any) => {
        const newLabel = prompt("Enter State Name:", node.data.label);
        if (newLabel) {
            updateNodeLabel(node.id, newLabel.toUpperCase().replace(/\s+/g, "_"));
        }
    };

    // Handler for clicking an edge (Transition/Event)
    const onEdgeClick = (_: any, edge: any) => {
        const newLabel = prompt("Enter Event Name (e.g. TIMER_EXPIRED):", edge.label as string);
        if (newLabel) {
            updateEdgeLabel(edge.id, newLabel.toUpperCase().replace(/\s+/g, "_"));
        }
    };

    return (
        <div className="flex h-screen w-screen flex-col bg-slate-50">
            <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
                <h1 className="text-xl font-bold text-slate-800">AI FSM Architect</h1>
                <div className="space-x-2">
                    <button onClick={addNode} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        + Add State
                    </button>
                    <button
                        onClick={generateCode}
                        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                        {loading ? "Analyzing..." : "Generate Firmware"}
                    </button>
                </div>
            </header>

            <main className="flex flex-1 overflow-hidden">
                {/* <div className="h-full w-2/3 border-r">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        fitView>
                        <Background />
                        <Controls />
                    </ReactFlow>
                </div>

                <div className="h-full w-1/3 overflow-y-auto bg-slate-900 p-4 text-sm text-green-400 font-mono">
                    {output ? (
                        <pre className="whitespace-pre-wrap">{output}</pre>
                    ) : (
                        <div className="text-slate-500">Design your FSM and click Generate...</div>
                    )}
                </div> */}
                {/* LEFT: Canvas */}
                <div className="h-full w-1/2 border-r">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onReconnect={onReconnect}
                        onNodeClick={(_: any, node: any) => {
                            const newLabel = prompt("State Name:", node.data.label);
                            if (newLabel) updateNodeLabel(node.id, newLabel.toUpperCase().replace(/\s+/g, "_"));
                        }}
                        onEdgeClick={(_: any, edge: any) => {
                            const newLabel = prompt("Event Name:", edge.label as string);
                            if (newLabel) updateEdgeLabel(edge.id, newLabel.toUpperCase().replace(/\s+/g, "_"));
                        }}
                        fitView>
                        <Background />
                        <Controls />
                    </ReactFlow>
                </div>

                {/* RIGHT: Divided Output Panel */}
                <div className="flex h-full w-1/2 flex-col bg-[#1e1e1e]">
                    {/* TOP: Code Section */}
                    <div className="flex-1 overflow-auto border-b border-slate-700 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                Generated C Header
                            </span>
                            <button
                                onClick={() => navigator.clipboard.writeText(result?.c_code || "")}
                                className="text-xs text-blue-400 hover:text-blue-300">
                                Copy Code
                            </button>
                        </div>
                        {result ? (
                            <SyntaxHighlighter
                                language="cpp"
                                style={vscDarkPlus}
                                customStyle={{ background: "transparent", padding: 0, fontSize: "13px" }}>
                                {result.c_code}
                            </SyntaxHighlighter>
                        ) : (
                            <div className="mt-10 text-center text-slate-600">Design FSM and click Generate...</div>
                        )}
                    </div>

                    {/* BOTTOM: Audit Section */}
                    <div className="h-1/3 overflow-auto bg-slate-900 p-6">
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                            AI Safety Audit
                        </h3>
                        {result ? (
                            <div className="text-sm leading-relaxed text-slate-300">
                                {result.audit.split("\n").map((line, i) => (
                                    <p key={i} className="mb-2">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-700 italic">No issues detected yet.</div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
