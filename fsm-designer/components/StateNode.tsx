import { Handle, Position } from '@xyflow/react';

export default function StateNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500 min-w-[120px] text-center">
      {/* Handles allow transitions to connect */}
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-400" />
      
      <div className="font-bold text-slate-900">
        {data.label}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-400" />
    </div>
  );
}
