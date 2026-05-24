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

  const LOC_PANTRY = { x: 180, y: 314 };
  const LOC_TREADMILL = { x: 180, y: 498 };
  const LOC_TOILET = { x: 180, y: 706 };
  
  const DESKS = [
    { x: 430, y: 340 }, { x: 650, y: 340 }, { x: 870, y: 340 }, { x: 1090, y: 340 },
    { x: 430, y: 500 }, { x: 650, y: 500 }, { x: 870, y: 500 }, { x: 1090, y: 500 },
    { x: 430, y: 660 }, { x: 650, y: 660 }, { x: 870, y: 660 }, { x: 1090, y: 660 },
    { x: 430, y: 820 }, { x: 650, y: 820 }, { x: 870, y: 820 }, { x: 1090, y: 820 },
  ];

  // We need to decide what to render based on currentRoom
  let renderItems = [];
  if (currentRoom === 'Main') {
      // In the main room, we want to show the doors (groups) AND the top 16 processes working at the desks
      const allSingles = [];
      employees.forEach(e => {
          if (e.isGroup && e.children) {
              e.children.forEach(c => {
                  let child = { ...c };
                  child.isGroup = false;
                  child.id = String(child.pid);
                  allSingles.push(child);
              });
          } else if (!e.isGroup) {
              allSingles.push(e);
          }
      });
      allSingles.sort((a, b) => b.memory_mb - a.memory_mb);
      const deskProcesses = allSingles.slice(0, 16);
      
      renderItems = [...employees.filter(e => e.isGroup), ...deskProcesses];
  } else {
      const roomGroup = employees.find(e => e.isGroup && e.id === currentRoom);
      if (roomGroup && roomGroup.children) {
          renderItems = roomGroup.children.map(c => {
             let child = { ...c };
             child.isGroup = false;
             child.id = String(child.pid);
             return child;
          });
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
             const doorY = 210; // Sitting exactly on the base of the taller wall
             mappedDoors.push({ ...item, locX: doorX, locY: doorY });
             doorIdx++;
         } else {
             // Individual Agent
             if (mappedAgents.length >= 16) continue; // Desk limit
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
        <div className="bg-[#1a1f2e] border-y-2 border-x border-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.3)] px-10 py-3 rounded-md relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 tracking-widest uppercase">
            {currentRoom === 'Main' ? '系统进程指挥中心' : `${currentRoom} 独立集群`}
          </h1>
        </div>
      </div>

      <main className="flex-1 flex justify-center items-center w-full h-full mt-4">
        {/* Isometric Floorplan Container WITHOUT Wall Borders */}
        <div className="relative w-[1300px] h-[1000px]">
          
          {/* Top Wall Dynamic Sections */}
          <div className="absolute top-0 left-0 w-full h-[210px] bg-gradient-to-b from-white to-[#f0f4f8] border-b-[4px] border-[#d1d9e6] shadow-sm z-0 flex">
             {Array.from({ length: Math.max(1, renderItems.filter(i => i.isGroup).length) }).map((_, i) => (
                 <div key={i} className="flex-1 h-full border-r border-[#e2e8f0] relative flex flex-col items-center justify-start pt-6">
                     {/* Cyber HUD Accents Removed */}
                     {/* Data lines */}
                     <div className="absolute bottom-0 w-[80%] h-[2px] bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                 </div>
             ))}
          </div>

          {/* Static Furniture Scenes in Flat CSS Style */}
          
          {/* Pantry */}
          <div className="absolute transition-all duration-500 hover:scale-105 flex flex-col items-center" style={{ left: 80, top: 250, width: '200px', height: '200px' }}>
              <div className="w-48 h-32 bg-white shadow-[0_8px_30px_rgba(59,130,246,0.08)] rounded-xl border border-blue-50 relative flex flex-wrap p-3 gap-2 justify-center content-start">
                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest rounded-full shadow-md z-10 whitespace-nowrap">Energy Station</div>
                 
                 {/* Coffee cups */}
                 <div className="w-4 h-4 bg-[#8B5A2B] rounded-full border border-gray-200"></div>
                 <div className="w-4 h-4 bg-[#A0522D] rounded-full border border-gray-200"></div>
                 <div className="w-4 h-4 bg-[#CD853F] rounded-full border border-gray-200"></div>
                 <div className="w-4 h-4 bg-[#D2691E] rounded-full border border-gray-200"></div>
                 
                 {/* Coffee Machine */}
                 <div className="w-16 h-12 bg-gray-800 rounded-lg absolute bottom-2 right-2 border border-gray-700 flex justify-center items-center">
                    <div className="w-10 h-6 bg-gray-900 rounded border border-gray-600 flex justify-center items-start pt-1 gap-1">
                       <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                       <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                    </div>
                 </div>
              </div>
          </div>

          {/* Treadmill (Gym) */}
          <div className="absolute transition-all duration-500 hover:scale-105 flex flex-col items-center" style={{ left: 80, top: 450, width: '200px', height: '200px' }}>
              <div className="w-48 h-24 bg-white shadow-[0_8px_30px_rgba(59,130,246,0.08)] rounded-xl border border-blue-50 relative flex items-center p-2">
                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-orange-400 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-widest rounded-full shadow-md z-10 whitespace-nowrap">Overclock Gym</div>
                 
                 {/* Treadmill console */}
                 <div className="w-6 h-16 bg-blue-50 border-2 border-blue-200 rounded-md ml-2 shadow-sm z-10 flex flex-col items-center py-2 gap-1">
                    <div className="w-3 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                 </div>
                 {/* Treadmill belt */}
                 <div className="flex-1 h-16 bg-gradient-to-r from-gray-800 to-gray-700 rounded-r-xl border-y-2 border-r-2 border-gray-600 relative overflow-hidden">
                     {/* Belt animation lines */}
                     <div className="w-full h-full opacity-30 flex flex-col justify-between py-1 animate-[slide_1s_linear_infinite]">
                        <div className="w-full h-[1px] bg-cyan-400"></div>
                        <div className="w-full h-[1px] bg-cyan-400"></div>
                        <div className="w-full h-[1px] bg-cyan-400"></div>
                     </div>
                 </div>
              </div>
          </div>

          {/* Rest Area */}
          <div className="absolute transition-all duration-500 hover:scale-105 flex flex-col items-center" style={{ left: 80, top: 650, width: '200px', height: '140px' }}>
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

          {DESKS.map((pos, i) => {
             // Find who is assigned to this desk
             let assignedPid = null;
             for (let [pid, dIdx] of deskAssignments.current.entries()) {
                 if (dIdx === i) {
                     assignedPid = pid;
                     break;
                 }
             }
             
             // Only show the nameplate if the process is currently rendered in this room
             const proc = assignedPid ? renderItems.find(item => !item.isGroup && String(item.pid) === String(assignedPid)) : null;
             
             let displayName = "";
             if (proc && proc.name) {
                 displayName = proc.name.length > 12 ? proc.name.substring(0, 10) + '..' : proc.name;
             }

             return (
                 <div key={i} className="absolute flex flex-col items-center" style={{ left: pos.x - 96, top: pos.y - 70 }}>
                     {/* Cyber Tech Desk - Enlarged to w-48 h-28 */}
                     <div className="w-48 h-28 bg-gradient-to-b from-white to-blue-50/30 shadow-[0_8px_20px_rgba(0,0,0,0.06)] rounded-lg border border-blue-200 relative flex justify-center">
                        {/* Glowing LED Strip on desk edge */}
                        <div className="absolute top-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
                        
                        {/* Monitor Stand */}
                        <div className="absolute top-3 w-10 h-2 bg-gray-300 rounded"></div>
                        <div className="absolute top-5 w-2.5 h-6 bg-gray-400"></div>
                        {/* Monitor Display */}
                        <div className="absolute -top-8 w-32 h-18 bg-[#1a1f2e] rounded border-2 border-[#0f141e] shadow-lg relative overflow-hidden flex items-center justify-center" style={{ height: '72px' }}>
                           {/* Cyber screen grid/lines */}
                           <div className="w-full h-full opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #3b82f6 2px, #3b82f6 3px)'}}></div>
                           <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/5"></div>
                           
                           {/* Monitor Screen Name */}
                           {displayName && (
                               <div className="absolute text-[9px] text-cyan-400 font-mono font-bold tracking-wider px-1 opacity-80 shadow-sm">
                                   {displayName}
                               </div>
                           )}
                        </div>
                        {/* Keyboard */}
                        <div className="absolute bottom-6 w-20 h-4 bg-white shadow-sm rounded border border-gray-200"></div>
                        {/* Mouse */}
                        <div className="absolute bottom-6 right-8 w-3 h-5 bg-white rounded-full shadow-sm border border-gray-100 flex justify-center">
                           <div className="w-1 h-1 bg-cyan-400 mt-1 rounded-full animate-pulse"></div>
                        </div>
                        
                        {/* Physical Nameplate on the Desk */}
                        {proc && (
                           <div className="absolute bottom-[18px] left-2 w-[60px] h-5 bg-[#1a1f2e] border-2 border-gray-600 rounded shadow-md flex flex-col items-center justify-center z-10" style={{ transform: 'perspective(100px) rotateX(10deg)' }}>
                               <div className="w-11/12 h-[1px] bg-cyan-500 opacity-50 mb-0.5"></div>
                               <span className="text-[6px] text-cyan-400 font-bold w-full truncate text-center tracking-widest leading-none px-1">
                                   {proc.name}
                               </span>
                           </div>
                        )}
                     </div>
                 </div>
             );
          })}

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
                  style={{ left: 650, top: 210 }}>
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
