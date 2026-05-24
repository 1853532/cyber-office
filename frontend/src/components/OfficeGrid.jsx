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
             // Calculate evenly spaced positions for doors based on total doors
             const totalDoors = renderItems.filter(i => i.isGroup).length;
             const containerWidth = 1300;
             const spacing = containerWidth / (totalDoors + 1);
             const doorX = spacing * (doorIdx + 1);
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
    <div className="flex-1 w-full bg-gray-100 flex flex-col relative overflow-hidden font-sans pt-16">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-wider drop-shadow">
          {currentRoom === 'Main' ? '系统进程指挥中心' : `${currentRoom} 独立集群`}
        </h1>
      </div>

      <main className="flex-1 flex justify-center items-center w-full h-full mt-4">
        {/* Isometric Floorplan Container WITHOUT Wall Borders */}
        <div className="relative w-[1300px] h-[950px] bg-transparent" 
             style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
             
          {/* TOP WALL */}
          <div className="absolute top-0 left-0 w-full h-[140px] bg-gradient-to-b from-gray-200 to-gray-300 border-b-[4px] border-gray-400 shadow-[0_10px_30px_rgba(0,0,0,0.05)] z-0">
             {/* Wall detailing */}
             <div className="w-full h-full opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 100px, #000 100px, #000 102px)'}}></div>
          </div>

          {/* Static Furniture Scenes in Flat CSS Style */}
          
          {/* Pantry */}
          <div className="absolute transition-all duration-500 hover:scale-105 flex flex-col items-center" style={{ left: 80, top: 170, width: '200px', height: '200px' }}>
              <div className="w-48 h-32 bg-gradient-to-b from-white to-gray-50 shadow-md rounded-lg border border-gray-200 relative flex flex-wrap p-3 gap-2 justify-center content-start">
                 <div className="absolute -top-3 bg-white px-2 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-full shadow-sm border border-gray-100 z-10">Pantry</div>
                 
                 {/* Coffee cups */}
                 <div className="w-5 h-5 rounded-full bg-[#8B5A2B] border-[3px] border-white shadow-sm mt-6"></div>
                 <div className="w-5 h-5 rounded-full bg-[#8B5A2B] border-[3px] border-white shadow-sm mt-6"></div>
                 <div className="w-5 h-5 rounded-full bg-[#CD853F] border-[3px] border-white shadow-sm mt-6"></div>
                 <div className="w-5 h-5 rounded-full bg-[#D2691E] border-[3px] border-white shadow-sm mt-6"></div>
                 
                 {/* Coffee Machine */}
                 <div className="absolute bottom-4 right-4 w-16 h-12 bg-gray-700 rounded border-2 border-gray-600 shadow-md flex justify-center">
                    <div className="w-10 h-3 bg-gray-400 mt-2 rounded-sm opacity-80"></div>
                 </div>
              </div>
          </div>

          {/* Treadmill (Gym) */}
          <div className="absolute transition-all duration-500 hover:scale-105 flex flex-col items-center" style={{ left: 80, top: 470, width: '200px', height: '200px' }}>
              <div className="w-48 h-24 bg-gradient-to-b from-white to-gray-50 shadow-md rounded-lg border border-gray-200 relative flex items-center p-2">
                 <div className="absolute -top-3 bg-white px-2 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-full shadow-sm border border-gray-100 z-10">Gym</div>
                 
                 {/* Treadmill console */}
                 <div className="w-6 h-16 bg-blue-100 border-2 border-blue-200 rounded ml-2 shadow-sm z-10"></div>
                 
                 {/* Belt */}
                 <div className="w-32 h-14 bg-gray-800 rounded-lg border-4 border-gray-300 relative -ml-1 shadow-inner flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gray-700 opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.2) 12px)' }}></div>
                 </div>
              </div>
          </div>

          {/* Bed (Rest Area) */}
          <div className="absolute transition-all duration-500 hover:scale-105 flex flex-col items-center" style={{ left: 80, top: 740, width: '200px', height: '140px' }}>
              <div className="w-48 h-28 bg-gradient-to-b from-white to-gray-50 shadow-md rounded-lg border border-gray-200 relative flex items-center p-2">
                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-full shadow-sm border border-gray-100 z-10 whitespace-nowrap">Rest Area</div>
                 
                 {/* Pillow */}
                 <div className="w-10 h-16 bg-white border border-gray-200 rounded-lg shadow-sm z-10 ml-1"></div>
                 
                 {/* Blanket */}
                 <div className="w-28 h-24 bg-blue-50 border border-blue-100 rounded-lg shadow-inner ml-2 flex items-center justify-start pl-2">
                    <div className="w-4 h-16 bg-blue-100 rounded-full opacity-50"></div>
                 </div>
              </div>
          </div>

          {DESKS.map((pos, i) => (
             <div key={i} className="absolute flex flex-col items-center" style={{ left: pos.x - 80, top: pos.y - 70 }}>
                 {/* Pure CSS Desk resembling Marvis style */}
                 <div className="w-40 h-20 bg-gradient-to-b from-white to-gray-100 shadow-md rounded border border-gray-200 relative flex justify-center">
                    {/* Monitor Stand */}
                    <div className="absolute top-2 w-10 h-1 bg-gray-300 rounded"></div>
                    <div className="absolute top-3 w-3 h-4 bg-gray-400"></div>
                    {/* Monitor Display */}
                    <div className="absolute -top-6 w-24 h-14 bg-gray-800 rounded border-2 border-gray-700 shadow-lg relative overflow-hidden">
                       <div className="absolute inset-x-0 bottom-0 h-1/2 bg-white/5"></div>
                    </div>
                    {/* Keyboard */}
                    <div className="absolute bottom-4 w-16 h-3 bg-gray-200 rounded border border-gray-300"></div>
                    {/* Mouse */}
                    <div className="absolute bottom-4 right-6 w-2 h-3 bg-gray-200 rounded-full shadow-sm"></div>
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
