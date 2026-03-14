import asyncio
import cv2
import time
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pose_engine import PoseEngine

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

connected_clients = []

def init_camera():
    global camera, pose_engine, latest_metrics
    if camera is None:
        camera = cv2.VideoCapture(0)
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    if pose_engine is None:
        pose_engine = PoseEngine(model_path='../pose_landmarker_full.task')

async def generate_frames():
    global camera, pose_engine, latest_metrics
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
        
        # Encode as JPEG
        ret, buffer = cv2.imencode('.jpg', processed_frame)
        frame_bytes = buffer.tobytes()
        
        # Yield for MJPEG stream
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
               
        await asyncio.sleep(0.01) # Small sleep to yield to event loop

@app.on_event("startup")
async def startup_event():
    # We delay camera init until actual endpoints hit it to 
    # prevent blocking the event loop on startup
    pass

@app.on_event("shutdown")
def shutdown_event():
    global camera, pose_engine
    if camera is not None:
        camera.release()
    if pose_engine is not None:
        pose_engine.close()

@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")


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
