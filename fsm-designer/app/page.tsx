"use client";
import React, { useState } from 'react';
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '@/lib/store';

export default function App() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useStore();
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    const res = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ nodes, edges }),
    });
    const data = await res.json();
    console.log(data);
    setOutput(data.output);
    setLoading(false);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">AI FSM Architect</h1>
        <div className="space-x-2">
          <button onClick={() => addNode('New State')} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            + Add State
          </button>
          <button onClick={generateCode} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            {loading ? 'Analyzing...' : 'Generate Firmware'}
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="h-full w-2/3 border-r">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
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
        </div>
      </main>
    </div>
  );
}
