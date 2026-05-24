import React from 'react';
import './HorseAvatar.css';

export default function HorseAvatar({ process, state, locX, locY, onClick }) {
  if (!process) return null;
  const role = process.role || 'system';
  
  const [isWalking, setIsWalking] = React.useState(false);
  const [walkDir, setWalkDir] = React.useState(1); // 1 for right, -1 for left
  const prevLocRef = React.useRef({ x: locX, y: locY });

  React.useEffect(() => {
     if (prevLocRef.current.x !== locX || prevLocRef.current.y !== locY) {
         setIsWalking(true);
         setWalkDir(locX < prevLocRef.current.x ? -1 : 1);
         prevLocRef.current = { x: locX, y: locY };
         const timer = setTimeout(() => setIsWalking(false), 1000);
         return () => clearTimeout(timer);
     }
  }, [locX, locY]);
  
  let scarfColor = '#00f0ff'; // Cyan default
  if (state.bg === 'bg-red-500') scarfColor = '#ff3b30'; // Red
  if (state.bg === 'bg-yellow-500') scarfColor = '#ffcc00'; // Yellow

  const isSleeping = state.icon === '☕';
  const isSweating = state.icon === '💦';
  
  // Decide the active animation
  let activeAnim = '';
  if (isWalking) {
      activeAnim = 'anim-running'; // Use running anim for walking
  } else if (isSleeping) {
      activeAnim = 'anim-breathing';
  } else if (isSweating) {
      activeAnim = 'anim-running';
  } else {
      activeAnim = 'anim-working';
  }

  let flip = 'none';
  if (isWalking) {
      flip = walkDir === -1 ? 'scaleX(-1)' : 'none';
  } else if (isSweating) {
      flip = 'scaleX(-1)';
  } else if (isSleeping) {
      flip = 'rotate(-90deg) translate(-20px, 0px)'; // head points up for the bed!
  }

  // Use PID to determine desk action: 0 = Chilling, 1 = Typing
  const deskAction = process.pid % 2 === 0 ? 'chilling' : 'typing';

  return (
    <div className="absolute flex flex-col items-center justify-center z-20 pointer-events-auto cursor-pointer group w-24 h-24" style={{ transform: 'translate(-50%, -50%)' }} onClick={onClick}>
       {/* Label Box */}
       <div className="absolute -top-10 flex flex-col items-center opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <div className={`px-2 py-1 rounded text-xs text-white font-bold whitespace-nowrap shadow-md ${state.bg}`}>
             {process.name} ({process.pid})
          </div>
          <div className="bg-white text-gray-800 text-[10px] px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap border border-gray-200">
             Mem: {process.memory_mb.toFixed(1)} MB
          </div>
       </div>

       {/* Zzz or Sweat animations */}
       {isSleeping && (
         <div className="absolute -top-6 -right-4 font-bold text-gray-300 text-lg anim-float">zZ</div>
       )}
       {isSweating && (
         <div className="absolute -top-4 -right-2 text-blue-400 text-lg anim-float">💦</div>
       )}

       {/* Horse Base & Overlays */}
       <div className={`relative w-full h-full filter drop-shadow-md ${activeAnim}`}>
          {(!isSleeping && !isSweating && !isWalking) ? (
             /* BACK VIEW (Working at desk) */
             <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
                {/* Glowing Monitor Screen (Simulated by drawing a blue rect slightly above the horse) */}
                <rect x="35" y="-10" width="30" height="20" fill="#1e90ff" rx="2" className={deskAction === 'typing' ? 'opacity-90 animate-pulse' : 'opacity-70'} />
                
                {/* Body (Back view) */}
                <path d="M 35 70 Q 35 30 50 30 Q 65 30 65 70 Z" fill="#111" className={deskAction === 'typing' ? 'animate-bounce-slow' : ''} />
                
                {/* Head (Back view) */}
                <circle cx="50" cy="25" r="14" fill="#111" className={deskAction === 'typing' ? 'animate-bounce-slow' : ''} />
                
                {/* Ears sticking out */}
                <path d="M 38 18 L 34 8 L 42 14 Z" fill="#111" className={deskAction === 'typing' ? 'animate-bounce-slow' : ''} />
                <path d="M 62 18 L 66 8 L 58 14 Z" fill="#111" className={deskAction === 'typing' ? 'animate-bounce-slow' : ''} />

                {/* Arms / Hands */}
                {deskAction === 'chilling' ? (
                   <>
                     <path d="M 35 48 Q 20 30 42 20" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" />
                     <path d="M 65 48 Q 80 30 58 20" fill="none" stroke="#111" strokeWidth="6" strokeLinecap="round" />
                   </>
                ) : (
                   <>
                     {/* Typing arms going UP towards the screen */}
                     <path d="M 35 48 Q 20 30 40 10" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" className="animate-pulse" />
                     <path d="M 65 48 Q 80 30 60 10" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" className="animate-pulse" />
                   </>
                )}

                {/* Scarf / Collar (from behind) */}
                <rect x="36" y="36" width="28" height="6" fill={scarfColor} rx="2" className={deskAction === 'typing' ? 'animate-bounce-slow' : ''} />

                {/* Role Overlays for Back View */}
                {role === 'programmer' && (
                  <>
                    <path d="M 35 70 Q 35 45 50 45 Q 65 45 65 70 Z" fill="#cc0000" opacity="0.8" />
                    <path d="M 42 45 L 42 70 M 50 45 L 50 70 M 58 45 L 58 70 M 35 55 L 65 55 M 35 62 L 65 62" stroke="#111" strokeWidth="2" opacity="0.6" />
                  </>
                )}
                {role === 'system' && (
                  <>
                    <path d="M 35 70 Q 35 45 50 45 Q 65 45 65 70 Z" fill="#222" opacity="0.9" />
                    <path d="M 50 45 L 50 70" stroke="#111" strokeWidth="2" />
                  </>
                )}
                {role === 'assistant' && (
                  <path d="M 35 70 Q 35 45 50 45 Q 65 45 65 70 Z" fill="#00ffff" opacity="0.2" />
                )}
             </svg>
          ) : (
             /* FRONT / SIDE VIEW (Pantry, Treadmill, Bed, Walking) */
             <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0" style={{ transform: flip }}>
                {/* If Sleeping change legs */}
                {isSleeping ? (
                   <>
                     {/* Legs sleeping (horizontal) */}
                     <rect x="35" y="65" width="25" height="8" fill="#111" rx="4" />
                     <rect x="35" y="55" width="25" height="8" fill="#111" rx="4" />
                   </>
                ) : (
                   <>
                     {/* Left Leg */}
                     <rect x="35" y="65" width="8" height="25" fill="#111" rx="4" className={isWalking || isSweating ? 'leg-left' : ''} />
                     {/* Right Leg */}
                     <rect x="55" y="65" width="8" height="25" fill="#111" rx="4" className={isWalking || isSweating ? 'leg-right' : ''} />
                   </>
                )}
                
                {/* Body */}
                <path d={isSleeping ? "M 30 65 Q 30 20 50 20 Q 70 20 70 65 Z" : "M 30 70 Q 30 20 50 20 Q 70 20 70 70 Z"} fill="#111" />
                
                {/* Head & Snout */}
                <path d={isSleeping ? "M 50 20 Q 80 20 90 30 Q 95 35 90 40 L 65 40 Z" : "M 50 20 Q 80 20 90 30 Q 95 35 90 40 L 65 40 Z"} fill="#111" />
                
                {/* White Muzzle */}
                <path d="M 85 32 Q 92 35 88 40 L 80 38 Z" fill="#fff" />
                
                {/* Ear */}
                <path d="M 55 20 L 60 5 L 65 20 Z" fill="#111" />
                <path d="M 45 22 L 50 8 L 55 22 Z" fill="#111" />
                
                {/* Eye */}
                <circle cx="65" cy="28" r="4" fill="#fff" />
                <circle cx="67" cy="28" r="1.5" fill="#111" />

                {/* Scarf / Collar */}
                <rect x="55" y="40" width="25" height="8" fill={scarfColor} rx="2" transform="rotate(-15 55 40)" />

                {/* Role Overlays */}
                {role === 'programmer' && (
                   <>
                     <path d={isSleeping ? "M 30 65 Q 30 40 50 40 Q 70 40 70 65 Z" : "M 30 70 Q 30 40 50 40 Q 70 40 70 70 Z"} fill="#cc0000" opacity="0.8" />
                     <path d={isSleeping ? "M 40 40 L 40 65 M 50 40 L 50 65 M 60 40 L 60 65 M 30 50 L 70 50 M 30 60 L 70 60" : "M 40 40 L 40 70 M 50 40 L 50 70 M 60 40 L 60 70 M 30 50 L 70 50 M 30 60 L 70 60"} stroke="#111" strokeWidth="2" opacity="0.6" />
                   </>
                )}
                {role === 'system' && (
                   <>
                     <polygon points="45,45 55,45 50,55" fill="#fff" />
                     <polygon points="48,45 50,45 51,53 49,53" fill="#cc0000" />
                     <path d={isSleeping ? "M 30 65 Q 30 45 50 45 Q 70 45 70 65 Z" : "M 30 70 Q 30 45 50 45 Q 70 45 70 70 Z"} fill="#222" opacity="0.9" />
                   </>
                )}
                {role === 'assistant' && (
                   <rect x="58" y="24" width="16" height="8" fill="#00ffff" rx="2" opacity="0.8" />
                )}
                {role === 'social' && (
                   <>
                     <circle cx="65" cy="28" r="5" fill="#111" stroke="#ff00ff" strokeWidth="2" />
                     <rect x="35" y="50" width="30" height="20" fill="#00ffcc" opacity="0.8" rx="5" />
                   </>
                )}
                {role === 'entertainment' && (
                   <>
                      <polygon points="40,25 45,10 50,22" fill="none" stroke="#ff00ff" strokeWidth="3" />
                      <polygon points="55,20 60,5 65,18" fill="none" stroke="#00ffff" strokeWidth="3" />
                   </>
                )}
             </svg>
          )}
       </div>
    </div>
  );
}
