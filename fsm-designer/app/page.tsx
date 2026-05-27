"use client";
import React, { useState, useEffect } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useStore } from "@/lib/store";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SmartBezierEdge } from "@tisoap/react-flow-smart-edge";
import ReactMarkdown from "react-markdown";

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
    audit: `### ⚠️ Safety Warnings
- **Critical:** No transition from \`HEATING\` to \`ERROR\` detected. If the sensor fails, the system could enter a thermal runaway state.
- **GPIO Conflict:** The system context mentions Pin 13 for the heater, but Pin 13 is the default internal LED on many boards. Ensure this doesn't cause signal noise.

### 💡 Design Suggestions
1. **Add a Watchdog:** The \`COOLDOWN\` state lacks a timeout. If the temperature sensor hangs, the FSM will wait indefinitely.
2. **Power Optimization:** Since this is for an ESP32, consider using \`light_sleep()\` during the \`IDLE\` state to save battery.

### 🔍 Logic Consistency
- The transition on event \`TIMER_EXPIRED\` is consistent with standard FSM patterns.`,
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
        nodeCounter,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onReconnect,
        addNode,
        updateNodeLabel,
        updateEdgeLabel,
        systemContext,
        setSystemContext,
        loadProject,
        resetProject,
    } = useStore();
    const [result, setResult] = useState<{ c_code: string; audit: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Auto-load on first start
    useEffect(() => {
        const saved = localStorage.getItem("fsm_autosave");
        if (saved) {
            try {
                loadProject(JSON.parse(saved));
            } catch (e) {}
        }
    }, []);

    // Auto-save whenever nodes/edges change
    useEffect(() => {
        const projectData = { nodes, edges, nodeCounter, systemContext };
        localStorage.setItem("fsm_autosave", JSON.stringify(projectData));
    }, [nodes, edges, nodeCounter, systemContext]);

    const generateCode = async () => {
        setLoading(true);

        // SIMULATE NETWORK DELAY
        // setTimeout(() => {
        //     setResult(MOCK_RESPONSE);
        //     setLoading(false);
        // }, 1000);

        // setLoading(true);
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                body: JSON.stringify({ nodes, edges }),
            });
            const data = await res.json();
            console.log(data);
            setResult(data);
        } catch (e) {
            console.error("Failed to parse AI response", e);
        }
        setLoading(false);
    };

    // --- SAVE LOGIC ---
    const saveProject = () => {
        const projectData = {
            nodes,
            edges,
            nodeCounter,
            systemContext,
            version: "1.0",
        };

        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `fsm_project_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // --- LOAD LOGIC ---
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                loadProject(json); // This updates our Zustand store
            } catch (err) {
                alert("Invalid project file");
            }
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        const confirmed = window.confirm(
            "Are you sure you want to clear the entire state machine? This action cannot be undone.",
        );
        if (confirmed) {
            resetProject();
            // Clear the AI output as well
            setResult(null);
            // Optional: clear local storage too
            localStorage.removeItem("fsm_autosave");
        }
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
            {/* <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
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
            </header> */}
            <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
                <h1 className="text-xl font-bold text-slate-800">AI FSM Architect</h1>

                <div className="flex items-center gap-2">
                    {/* File Management */}
                    <button
                        onClick={saveProject}
                        className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        Save JSON
                    </button>
                    <label className="cursor-pointer rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        Load JSON
                        <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} />
                    </label>
                    {/* RESET BUTTON */}
                    <button
                        onClick={handleReset}
                        className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors">
                        Reset
                    </button>
                    <div className="mx-2 h-6 w-[1px] bg-slate-200" /> {/* Divider */}
                    <button
                        onClick={() => addNode()}
                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
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
                <div className="relative h-full w-1/2 border-r">
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

                    {/* Floating Context Panel */}
                    <div className="absolute bottom-4 left-4 z-10 w-80 rounded-lg border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur-sm">
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                            System Context & Constraints
                        </label>
                        <textarea
                            className="h-32 w-full rounded border border-slate-200 bg-transparent p-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                            placeholder="e.g. Use hardware timers, Pin 5 is the LED, target STM32..."
                            value={systemContext}
                            onChange={(e) => setSystemContext(e.target.value)}
                        />
                        <p className="mt-1 text-[10px] text-slate-400 italic">
                            This info is sent to the AI to specialize the generated code.
                        </p>
                    </div>
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
                    {/* <div className="h-1/3 overflow-auto bg-slate-900 p-6">
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
                    </div> */}
                    <div className="h-1/3 overflow-auto bg-slate-900 p-6 border-t border-slate-700">
                        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                            AI Safety Audit
                        </h3>

                        {result ? (
                            <div
                                className="prose prose-invert prose-sm max-w-none text-slate-300 
      /* Custom styles to ensure markdown elements look right in dark mode */
      [&>h3]:text-amber-400 [&>h3]:text-sm [&>h3]:font-bold [&>h3]:mt-4 [&>h3]:mb-2
      [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:space-y-2
      [&>p]:mb-2
      [&>code]:text-blue-300 [&>code]:bg-slate-800 [&>code]:px-1 [&>code]:rounded">
                                <ReactMarkdown>{result.audit}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="text-slate-700 italic text-sm">
                                No issues detected yet. Analyze the FSM to begin audit.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
