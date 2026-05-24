import React from 'react';

export default function DoorAvatar({ group, title, iconStr, onClick }) {
  const displayTitle = title || (group ? `${group.id} 部门` : '');
  const initial = iconStr || (group ? group.id.charAt(0).toUpperCase() : '');

  return (
    <div 
      className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-[80%] cursor-pointer group"
      onClick={onClick}
    >
      {/* Tall Holographic Cyber Door */}
      <div className="w-28 h-32 bg-gradient-to-b from-white/80 to-white/40 backdrop-blur-md border border-blue-200/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] rounded-xl relative flex flex-col items-center justify-start pt-3 group-hover:bg-blue-50/80 transition-all group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]">
         
         {/* Glowing HUD accent */}
         <div className="absolute top-0 w-20 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
         <div className="absolute bottom-0 w-12 h-1 bg-cyan-400 rounded-t-full opacity-50"></div>
         
         {/* Door Nameplate (Top) */}
         <div className="w-[90%] bg-[#1a1f2e] text-cyan-400 px-1 py-1 rounded border border-[#2a3142] text-[8px] font-mono font-bold shadow-inner truncate text-center tracking-wider uppercase mb-4">
             {title || (group && group.id)}
         </div>

         {/* Center Icon */}
         <div className="w-12 h-12 rounded-full bg-white/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-center text-blue-600 font-bold text-2xl border border-blue-100">
            {initial}
         </div>
      </div>
    </div>
  );
}
