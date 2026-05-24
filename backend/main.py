from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from process_manager import get_active_processes, kill_process

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/processes")
def read_processes():
    return {"status": "success", "data": get_active_processes()}

@app.post("/api/fire/{pid}")
def fire_employee(pid: int):
    success, msg = kill_process(pid)
    if success:
        return {"status": "success", "message": msg}
    raise HTTPException(status_code=400, detail=msg)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = get_active_processes()
            await websocket.send_json({"type": "update", "data": data})
            await asyncio.sleep(2)
    except Exception as e:
        print("WebSocket disconnected", e)
