import React from 'react';
import { getEmployeeState } from '../utils/statusMapper';

export default function Employee({ data, onClick }) {
  const state = getEmployeeState(data.cpu, data.memory_mb);

  return (
    <div 
      onClick={onClick}
      className={`relative w-28 h-36 flex flex-col items-center justify-end rounded-xl shadow-md cursor-pointer transform transition-transform hover:scale-110 hover:-translate-y-2 hover:shadow-2xl bg-white border-2 border-transparent hover:border-indigo-400 group`}
    >
      {/* 办公桌 */}
      <div className="absolute bottom-4 w-24 h-12 bg-gray-100 rounded-lg shadow-inner flex flex-col items-center justify-center">
         <div className="w-16 h-8 bg-gray-800 rounded-sm mb-1 relative">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-gray-400"></div>
         </div>
      </div>
      
      {/* 员工头像 */}
      <div className={`absolute bottom-12 text-4xl drop-shadow-md transition-all duration-300 group-hover:-translate-y-2 ${state.animation}`}>
        {state.icon}
      </div>

      {/* 状态指示灯 */}
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${state.bg} shadow-sm border border-white`}></div>
      
      {/* 员工名牌 */}
      <div className="absolute -bottom-3 z-10 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg truncate w-26 text-center border border-gray-700">
        {data.name}
      </div>
    </div>
  );
}
