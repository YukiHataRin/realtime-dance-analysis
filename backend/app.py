import asyncio
import cv2
import time
import json
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pose_engine import PoseEngine
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global states
camera = None
pose_engine = None
latest_metrics = {}
recording_state = {
    "is_recording": False,
    "writer": None,
    "filename": None,
    "metrics_buffer": []
}

# Ensure recordings directory exists
RECORDINGS_DIR = "recordings"
if not os.path.exists(RECORDINGS_DIR):
    os.makedirs(RECORDINGS_DIR)

connected_clients = []

def init_camera():
    global camera, pose_engine
    if camera is None:
        camera = cv2.VideoCapture(0)
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    if pose_engine is None:
        pose_engine = PoseEngine(model_path='../pose_landmarker_full.task')

async def generate_frames():
    global camera, pose_engine, latest_metrics, recording_state
    init_camera()
    
    while True:
        success, frame = camera.read()
        if not success:
            await asyncio.sleep(0.1)
            continue
            
        timestamp_ms = int(time.time() * 1000)
        
        # Process frame
        processed_frame, metrics = pose_engine.process_frame(frame, timestamp_ms)
        latest_metrics = metrics
        
        # Handle recording
        if recording_state["is_recording"] and recording_state["writer"] is not None:
            recording_state["writer"].write(processed_frame)
            # Store metrics with a relative timestamp for playback
            metrics_with_time = metrics.copy()
            metrics_with_time["time"] = timestamp_ms
            recording_state["metrics_buffer"].append(metrics_with_time)
            
        # Encode as JPEG
        ret, buffer = cv2.imencode('.jpg', processed_frame)
        frame_bytes = buffer.tobytes()
        
        # Yield for MJPEG stream
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
               
        await asyncio.sleep(0.01)

@app.on_event("shutdown")
def shutdown_event():
    global camera, pose_engine, recording_state
    if camera is not None:
        camera.release()
    if pose_engine is not None:
        pose_engine.close()
    if recording_state["writer"] is not None:
        recording_state["writer"].release()

@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

# Recording Endpoints
@app.post("/record/start")
async def start_recording():
    global recording_state, camera
    if recording_state["is_recording"]:
        return {"status": "already_recording"}
        
    init_camera()
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    filename = f"dance_{timestamp}.mp4"
    filepath = os.path.join(RECORDINGS_DIR, filename)
    
    # Define codec and writer - Using 'avc1' or 'H264' for better browser support
    # Note: On some systems, 'avc1' might require OpenH264 plugin. 
    # 'mp4v' is safer for writing but 'avc1' is better for web. 
    # Let's try 'H264' or fallback to 'avc1'
    fourcc = cv2.VideoWriter_fourcc(*'avc1')
    width = int(camera.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(camera.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    recording_state["writer"] = cv2.VideoWriter(filepath, fourcc, 20.0, (width, height))
    recording_state["filename"] = filename
    recording_state["is_recording"] = True
    recording_state["metrics_buffer"] = []
    
    return {"status": "started", "filename": filename}

@app.post("/record/stop")
async def stop_recording():
    global recording_state
    if not recording_state["is_recording"]:
        return {"status": "not_recording"}
        
    recording_state["is_recording"] = False
    if recording_state["writer"] is not None:
        recording_state["writer"].release()
        recording_state["writer"] = None
        
    filename = recording_state["filename"]
    
    # Save metrics buffer to JSON
    json_filename = filename.replace(".mp4", ".json")
    json_path = os.path.join(RECORDINGS_DIR, json_filename)
    with open(json_path, 'w') as f:
        json.dump(recording_state["metrics_buffer"], f)
        
    recording_state["filename"] = None
    recording_state["metrics_buffer"] = []
    
    return {"status": "stopped", "filename": filename}

@app.get("/recordings")
async def list_recordings():
    files = sorted(os.listdir(RECORDINGS_DIR), reverse=True)
    return {"recordings": [f for f in files if f.endswith('.mp4')]}

@app.get("/recordings/{filename}")
async def get_recording(filename: str):
    filepath = os.path.join(RECORDINGS_DIR, filename)
    if not os.path.exists(filepath):
        return {"error": "file_not_found"}
    return FileResponse(filepath, media_type="video/mp4")

@app.get("/recordings/{filename}/metrics")
async def get_recording_metrics(filename: str):
    json_filename = filename.replace(".mp4", ".json")
    json_path = os.path.join(RECORDINGS_DIR, json_filename)
    if not os.path.exists(json_path):
        return {"error": "metrics_not_found"}
    with open(json_path, 'r') as f:
        data = json.load(f)
    return data


# Background task to broadcast metrics
async def broadcast_metrics():
    while True:
        if connected_clients and latest_metrics:
            disconnected = []
            message = json.dumps(latest_metrics)
            for client in connected_clients:
                try:
                    await client.send_text(message)
                except Exception:
                    disconnected.append(client)
            for d in disconnected:
                connected_clients.remove(d)
        await asyncio.sleep(1/30) # Map to ~30 FPS broadcast

@app.websocket("/ws/metrics")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            # We don't really expect client to send much, just keep alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in connected_clients:
            connected_clients.remove(websocket)

# Start background broadcasting task
@app.on_event("startup")
async def start_broadcaster():
    asyncio.create_task(broadcast_metrics())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
