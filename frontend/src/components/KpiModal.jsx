import React from 'react';

export default function KpiModal({ emp, onClose, onFire }) {
  if (!emp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full m-4 transform transition-all animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{emp.name}</h2>
            <p className="text-gray-500 text-sm">PID: {emp.pid}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* KPI Data */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">CPU</div>
            <div className="text-xl font-bold text-gray-800">{emp.cpu}%</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Memory</div>
            <div className="text-xl font-bold text-gray-800">{emp.memory_mb} MB</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 col-span-2">
            <div className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Uptime</div>
            <div className="text-xl font-bold text-gray-800">{Math.floor(emp.uptime / 60)} min {Math.floor(emp.uptime % 60)} sec</div>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onFire}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors"
          >
            强制下班 (Fire)
          </button>
        </div>
      </div>
    </div>
  );
}
