import React from 'react';

export default function DoorAvatar({ group, title, iconStr, onClick }) {
  const displayTitle = title || (group ? `${group.id} 部门` : '');
  const initial = iconStr || (group ? group.id.charAt(0).toUpperCase() : '');

  return (
    <div 
      className="absolute flex flex-col items-center justify-end z-10 pointer-events-auto cursor-pointer group" 
      style={{ transform: 'translate(-50%, -100%)' }}
      onClick={onClick}
    >
      {/* Sleek Glass Door / Zone */}
      <div className="w-24 h-16 bg-white/50 backdrop-blur-md border border-white/40 shadow-lg rounded-xl relative flex items-center justify-center group-hover:bg-blue-50/80 transition-all group-hover:scale-105 group-hover:shadow-blue-200/50">
         {/* Glowing top accent */}
         <div className="absolute top-0 w-12 h-1 bg-blue-400 rounded-b-full"></div>
         
         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow flex items-center justify-center text-gray-500 font-bold text-lg border border-gray-300">
            {initial}
         </div>
      </div>
      
      {/* Tag */}
      <div className="bg-white/90 backdrop-blur px-3 py-1 mt-2 rounded-full text-[11px] font-bold shadow-sm text-gray-600 max-w-[120px] truncate text-center group-hover:text-blue-600 border border-gray-200">
         {displayTitle}
      </div>
    </div>
  );
}
