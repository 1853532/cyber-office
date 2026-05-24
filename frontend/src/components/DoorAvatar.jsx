import React from 'react';

export default function DoorAvatar({ group, title, iconStr, onClick }) {
  const displayTitle = title || (group ? `${group.id} 部门` : '');
  const initial = iconStr || (group ? group.id.charAt(0).toUpperCase() : '');

  return (
    <div 
      className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-[80%] cursor-pointer group"
      onClick={onClick}
    >
      {/* Holographic Cyber Node */}
      <div className="w-24 h-16 bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-md border border-blue-200/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] rounded-xl relative flex items-center justify-center group-hover:bg-blue-50/80 transition-all group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]">
         {/* Glowing HUD accent */}
         <div className="absolute top-0 w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
         <div className="absolute bottom-0 w-8 h-1 bg-cyan-400 rounded-t-full opacity-50"></div>
         
         <div className="w-10 h-10 rounded-full bg-white/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-center text-blue-600 font-bold text-xl border border-blue-100">
            {initial}
         </div>
      </div>
      
      {/* Tag */}
      <div className="bg-white/90 backdrop-blur px-3 py-1 mt-2 rounded border border-blue-100 text-[10px] font-mono font-bold shadow-sm text-gray-600 w-max whitespace-nowrap text-center group-hover:text-blue-600 tracking-wider uppercase">
         {displayTitle}
      </div>
    </div>
  );
}
