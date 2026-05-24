import React, { useState, useEffect, useRef } from 'react';
import KpiModal from './KpiModal';
import HorseAvatar from './HorseAvatar';
import DoorAvatar from './DoorAvatar';
import { getEmployeeState } from '../utils/statusMapper';

export default function OfficeGrid() {
  const [employees, setEmployees] = useState([]); // Now contains both groups and singles
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('Main'); // 'Main' or group ID
  
  const deskAssignments = useRef(new Map());

  useEffect(() => {
    let ws = null;
    const connect = () => {
      ws = new WebSocket('ws://localhost:8000/ws');
      ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          if (type === 'update') {
            setEmployees(data);
          }
        } catch(e) {}
      };
      ws.onclose = () => {
        setTimeout(connect, 3000);
      };
    };
    connect();
    return () => { if (ws) ws.close(); };
  }, []);

  const handleFire = async (pid) => {
    try {
      const response = await fetch(`http://localhost:8000/api/fire/${pid}`, { method: 'POST' });
      const result = await response.json();
      if (result.status === 'success') {
         // The backend will automatically update via websocket on next tick
      }
    } catch(e) {}
    setSelectedEmp(null);
  };

  const LOC_PANTRY = { x: 180, y: 230 };
  const LOC_TREADMILL = { x: 180, y: 510 };
  const LOC_TOILET = { x: 180, y: 800 };
  
  const DESKS = [
    { x: 500, y: 300 }, { x: 750, y: 300 }, { x: 1000, y: 300 },
    { x: 500, y: 450 }, { x: 750, y: 450 }, { x: 1000, y: 450 },
    { x: 500, y: 600 }, { x: 750, y: 600 }, { x: 1000, y: 600 },
    { x: 500, y: 750 }, { x: 750, y: 750 }, { x: 1000, y: 750 },
    { x: 500, y: 900 }, { x: 750, y: 900 }, { x: 1000, y: 900 },
  ];

  // We need to decide what to render based on currentRoom
  let renderItems = [];
  
  if (currentRoom === 'Main') {
      renderItems = employees;
  } else {
      const roomGroup = employees.find(e => e.isGroup && e.id === currentRoom);
      if (roomGroup && roomGroup.children) {
          renderItems = roomGroup.children;
      } else {
          setCurrentRoom('Main'); // Fallback if group disappears
      }
  }

  // Calculate coordinates
  const mapProcessLocations = () => {
     let mappedAgents = [];
     let mappedDoors = [];
     
     let doorIdx = 0;
     
     // Clean up old pids from assignments to free up desks
     const currentPids = new Set(renderItems.filter(i => !i.isGroup).map(i => i.pid));
     for (let pid of deskAssignments.current.keys()) {
         if (!currentPids.has(pid)) {
             deskAssignments.current.delete(pid);
         }
     }
     
     const takenDesks = new Set(Array.from(deskAssignments.current.values()));
     
     for (let item of renderItems) {
         if (item.isGroup) {
             // Calculate evenly spaced positions for doors centered in dynamic wall sections
             const totalDoors = Math.max(1, renderItems.filter(i => i.isGroup).length);
             const containerWidth = 1300;
             const sectionWidth = containerWidth / totalDoors;
             const doorX = (doorIdx * sectionWidth) + (sectionWidth / 2);
             const doorY = 140; // Sitting exactly on the base of the wall
             mappedDoors.push({ ...item, locX: doorX, locY: doorY });
             doorIdx++;
         } else {
             // Individual Agent
             if (mappedAgents.length >= 15) continue; // Desk limit
             const state = getEmployeeState(item.cpu, item.memory_mb);
             
             let loc;
             if (state.icon === '☕') {
                 loc = LOC_TOILET;
             } else if (state.icon === '💦') {
                 loc = LOC_TREADMILL;
             } else {
                 let deskIdx = deskAssignments.current.get(item.pid);
                 if (deskIdx === undefined) {
                     // Find an empty desk
                     for (let i = 0; i < DESKS.length; i++) {
                         if (!takenDesks.has(i)) {
                             deskIdx = i;
                             break;
                         }
                     }
                     if (deskIdx === undefined) deskIdx = item.pid % DESKS.length; // fallback
                     deskAssignments.current.set(item.pid, deskIdx);
                     takenDesks.add(deskIdx);
                 }
                 loc = DESKS[deskIdx];
             }

             mappedAgents.push({ ...item, locX: loc.x, locY: loc.y, state: state });
         }
     }
     return { mappedAgents, mappedDoors };
  };

  const { mappedAgents, mappedDoors } = mapProcessLocations();

  const seamlessImageStyle = { 
    mixBlendMode: 'multiply', 
    WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)',
    maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)',
    filter: 'brightness(1.05) contrast(1.1)'
  };

  return (
    <div className="flex-1 w-full bg-[#f4f7fb] flex flex-col relative overflow-hidden font-sans pt-16">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-wider drop-shadow">
          {currentRoom === 'Main' ? '系统进程指挥中心' : `${currentRoom} 独立集群`}
        </h1>
      </div>

      <main className="flex-1 flex justify-center items-center w-full h-full mt-4">
        {/* Isometric Floorplan Container WITHOUT Wall Borders */}
        <div className="relative w-[1300px] h-[950px] bg-transparent" 
             style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
             
          {/* TOP WALL - Sleek Tech Bays */}
          <div className="absolute top-0 left-0 w-full h-[140px] bg-gradient-to-b from-white to-[#f0f4f8] border-b-[4px] border-[#d1d9e6] shadow-sm z-0 flex">
             {Array.from({ length: Math.max(1, renderItems.filter(i => i.isGroup).length) }).map((_, i) => (
                 <div key={i} className="flex-1 h-full border-r border-[#e2e8f0] relative flex flex-col items-center justify-start pt-6">
                     {/* Cyber HUD Accents */}
                     <div className="w-24 h-6 bg-[#f8fafc] rounded-full border border-[#cbd5e1] shadow-inner flex items-center justify-center gap-1.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                         <div className="w-4 h-1.5 rounded-full bg-cyan-400 opacity-80"></div>
                     </div>
                     {/* Data lines */}
                     <div className="absolute bottom-0 w-[80%] h-[2px] bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                 </div>
             ))}
          </div>

          {/* Static Furniture Scenes in Flat CSS Style */}
          
          {/* Pantry */}
          <div className="absolute transition-all duration-500 hover:scale-105 flex flex-col items-center" style={{ left: 80, top: 170, width: '200px', height: '200px' }}>
              <div className="w-48 h-32 bg-white shadow-[0_8px_30px_rgba(59,130,246,0.08)] rounded-xl border border-blue-50 relative flex flex-wrap p-3 gap-2 justify-center content-start">
                 <div className="absolute -top-3 bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest rounded-full shadow-md z-10">Energy Station</div>
                 
                 {/* Coffee cups */}
                 <div className="w-5 h-5 rounded-full bg-[#8B5A2B] border-[3px] border-white shadow-sm mt-6"></div>
                 <div className="w-5 h-5 rounded-full bg-[#8B5A2B] border-[3px] border-white shadow-sm mt-6"></div>
                 <div className="w-5 h-5 rounded-full bg-[#CD853F] border-[3px] border-white shadow-sm mt-6"></div>
                 <div className="w-5 h-5 rounded-full bg-[#D2691E] border-[3px] border-white shadow-sm mt-6"></div>
                 
                 {/* Glowing Coffee Machine */}
                 <div className="absolute bottom-4 right-4 w-16 h-12 bg-[#1a1f2e] rounded-lg border-2 border-[#2a3142] shadow-lg flex flex-col items-center justify-start pt-1.5">
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="w-10 h-2 bg-gray-600 mt-2.5 rounded-sm opacity-80"></div>
                 </div>
              </div>
          </div>

          {/* Treadmill (Gym) */}
          <div className="absolute transition-all duration-500 hover:scale-105 flex flex-col items-center" style={{ left: 80, top: 470, width: '200px', height: '200px' }}>
              <div className="w-48 h-24 bg-white shadow-[0_8px_30px_rgba(59,130,246,0.08)] rounded-xl border border-blue-50 relative flex items-center p-2">
                 <div className="absolute -top-3 bg-gradient-to-r from-red-500 to-orange-400 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest rounded-full shadow-md z-10">Overclock Gym</div>
                 
                 {/* Treadmill console */}
                 <div className="w-6 h-16 bg-blue-50 border-2 border-blue-200 rounded-md ml-2 shadow-sm z-10 flex flex-col items-center py-2 gap-1">
                    <div className="w-3 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                 </div>
                 
                 {/* Belt */}
                 <div className="w-32 h-14 bg-[#1a1f2e] rounded-lg border-4 border-[#2a3142] relative -ml-1 shadow-inner flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-blue-500/10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(59,130,246,0.2) 10px, rgba(59,130,246,0.2) 12px)' }}></div>
                 </div>
              </div>
          </div>

          {/* Bed (Rest Area) */}
          <div className="absolute transition-all duration-500 hover:scale-105 flex flex-col items-center" style={{ left: 80, top: 740, width: '200px', height: '140px' }}>
              <div className="w-48 h-28 bg-white shadow-[0_8px_30px_rgba(59,130,246,0.08)] rounded-xl border border-blue-50 relative flex items-center p-2">
                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-400 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest rounded-full shadow-md z-10 whitespace-nowrap">Sleep Mode</div>
                 
                 {/* Pillow */}
                 <div className="w-10 h-16 bg-gray-50 border border-gray-200 rounded-lg shadow-sm z-10 ml-1"></div>
                 
                 {/* Blanket */}
                 <div className="w-28 h-24 bg-gradient-to-r from-blue-100 to-indigo-50 border border-blue-200 rounded-lg shadow-inner ml-2 flex items-center justify-start pl-2">
                    <div className="w-4 h-16 bg-blue-200 rounded-full opacity-50"></div>
                 </div>
              </div>
          </div>

          {DESKS.map((pos, i) => (
             <div key={i} className="absolute flex flex-col items-center" style={{ left: pos.x - 80, top: pos.y - 70 }}>
                 {/* Cyber Tech Desk */}
                 <div className="w-40 h-20 bg-gradient-to-b from-white to-blue-50/30 shadow-[0_8px_20px_rgba(0,0,0,0.04)] rounded-lg border border-blue-100 relative flex justify-center">
                    {/* Glowing LED Strip on desk edge */}
                    <div className="absolute top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-50"></div>
                    
                    {/* Monitor Stand */}
                    <div className="absolute top-2 w-8 h-1 bg-gray-300 rounded"></div>
                    <div className="absolute top-3 w-2 h-4 bg-gray-400"></div>
                    {/* Monitor Display */}
                    <div className="absolute -top-6 w-24 h-14 bg-[#1a1f2e] rounded border-2 border-[#0f141e] shadow-lg relative overflow-hidden flex items-center justify-center">
                       {/* Cyber screen grid/lines */}
                       <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #3b82f6 2px, #3b82f6 3px)'}}></div>
                       <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/5"></div>
                    </div>
                    {/* Keyboard */}
                    <div className="absolute bottom-4 w-16 h-3 bg-white shadow-sm rounded border border-gray-200"></div>
                    {/* Mouse */}
                    <div className="absolute bottom-4 right-6 w-2.5 h-4 bg-white rounded-full shadow-sm border border-gray-100 flex justify-center">
                       <div className="w-0.5 h-1 bg-cyan-400 mt-0.5 rounded-full animate-pulse"></div>
                    </div>
                 </div>
             </div>
          ))}

          {/* Dynamic Doors Layer */}
          {mappedDoors.map((group) => (
             <div key={group.id} 
                  className="absolute transition-all duration-1000 ease-in-out z-10" 
                  style={{ left: group.locX, top: group.locY }}>
                 <DoorAvatar 
                    group={group} 
                    onClick={() => setCurrentRoom(group.id)} 
                 />
             </div>
          ))}

          {/* Exit Door when in Sub-Room */}
          {currentRoom !== 'Main' && (
             <div className="absolute transition-all duration-1000 ease-in-out z-10" 
                  style={{ left: 650, top: 140 }}>
                 <DoorAvatar 
                    title="← 返回主指挥中心"
                    iconStr="🏠"
                    onClick={() => setCurrentRoom('Main')} 
                 />
             </div>
          )}

          {/* Dynamic Agents Layer */}
          {mappedAgents.map((proc) => (
             <div key={proc.pid} 
                  className="absolute transition-all duration-1000 ease-linear z-20" 
                  style={{ left: proc.locX, top: proc.locY }}>
                 <HorseAvatar 
                     process={proc} 
                     state={proc.state}
                     locX={proc.locX}
                     locY={proc.locY}
                     onClick={() => setSelectedEmp(proc)} 
                 />
             </div>
          ))}
        </div>
      </main>

      {selectedEmp && (
        <KpiModal 
          emp={selectedEmp} 
          onClose={() => setSelectedEmp(null)} 
          onFire={() => handleFire(selectedEmp.pid)} 
        />
      )}
    </div>
  );
}
