import React from 'react';

export default function DoorAvatar({ group, title, iconStr, onClick }) {
  const displayTitle = title || (group ? `${group.id} 部门` : '');
  const initial = iconStr || (group ? group.id.charAt(0).toUpperCase() : '');

  return (
    <div 
      className="absolute flex flex-col items-center justify-end transform -translate-x-1/2 -translate-y-[100%] cursor-pointer group z-20"
      onClick={onClick}
    >
      {/* Wall Nameplate (Above Door) */}
      <div className="bg-[#1a1f2e] text-cyan-400 px-3 py-1 rounded-t-md border-t-2 border-x-2 border-cyan-500/50 text-[9px] font-mono font-bold shadow-lg w-28 overflow-hidden text-center tracking-wider mb-[-2px] z-30">
         <div className="truncate w-full">{title || (group && group.id)}</div>
      </div>

      {/* Cyber Door */}
      <div className="w-24 h-32 bg-gradient-to-b from-[#0f172a] to-[#1e293b] backdrop-blur-md border-2 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)] rounded-t-xl rounded-b-none relative flex flex-col items-center justify-center group-hover:bg-[#1e293b] transition-all group-hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]">
         
         {/* Glowing vertical lines */}
         <div className="absolute left-2 top-0 bottom-0 w-[1px] bg-cyan-500/30"></div>
         <div className="absolute right-2 top-0 bottom-0 w-[1px] bg-cyan-500/30"></div>
         
         {/* Center Icon */}
         <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center text-cyan-400 font-bold text-2xl border border-cyan-400/50 shadow-[inset_0_0_10px_rgba(6,182,212,0.2)] group-hover:text-cyan-300 group-hover:border-cyan-300">
            {initial}
         </div>
      </div>
    </div>
  );
}
