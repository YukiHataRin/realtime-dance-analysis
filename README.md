# Real-time Dance Aesthetics Analysis

A real-time dance and movement analysis dashboard built with MediaPipe, FastAPI, and React. The browser captures camera frames, the Python backend estimates pose landmarks and calculates nine H36M-compatible movement descriptors, and the dashboard displays the annotated video and live metrics.

![Architecture](https://img.shields.io/badge/Architecture-FastAPI%20%2B%20React%20%2B%20MediaPipe-blue)

## 🌟 Key Features

- **Browser camera permission**: Camera access starts only after the user clicks **啟用攝影機**.
- **Camera selection**: Switch between available cameras after permission is granted.
- **Real-time pose estimation**: Track 33 MediaPipe landmarks and convert them to a 17-joint H36M-compatible skeleton.
- **Nine movement metrics**: Display live intensity, synchronization, expansion, curvature, stability, effort, and smoothness descriptors.
- **Skeleton overlay**: Return an annotated video frame from the local analysis service.
- **Recording and playback**: Save analyzed video together with timestamped metrics, then replay previous sessions.
- **Local processing**: Camera frames are sent only to the FastAPI service running on the same machine.

## 📊 The 9 Movement Metrics

These values are movement descriptors implemented in `backend/dance_metrics.py`. Labels such as “Torque” are analysis proxies rather than direct physical measurements from force sensors.

1. **Intensity (Energy)**: Weighted sum of squared limb angular speeds ($rad^2/s^2$).
2. **Sync – Balance**: Similarity ratio between left- and right-side angular-speed magnitudes ([0, 1]).
3. **Sync – Correlation**: Rolling Pearson correlation between left- and right-side motion histories ([-1, 1]).
4. **Volume (Expansion)**: Scaled 3D convex-hull volume of the 17 joints.
5. **Roundness (Curvature)**: Mean trajectory curvature of the wrists and ankles.
6. **Stability – Height**: Estimated vertical Center of Mass (CoM) position in meters.
7. **Stability – Sway**: CoM displacement from the ankle midpoint in the horizontal plane, in meters.
8. **Effort (Torque proxy)**: Weighted sum of absolute limb angular accelerations ($rad/s^2$).
9. **Smoothness (Jerk cost)**: Weighted sum of squared angular jerk; higher values indicate more abrupt movement.

## 🛠️ Architecture

- **Backend**: Python, FastAPI, MediaPipe Tasks API, OpenCV, SciPy, and NumPy.
- **Frontend**: React, Vite, Tailwind CSS, Recharts, and Lucide React.
- **Camera channel**: The browser sends JPEG frames through `/ws/camera`; the backend returns JPEG frames with the skeleton overlay.
- **Metrics channel**: The backend broadcasts live metric JSON through `/ws/metrics`.
- **HTTP API**: Recording controls and saved video/metric files are exposed through `/record/*` and `/recordings/*`.

## ✅ Requirements

- Python 3.9 or newer
- Node.js `^20.19.0` or `>=22.12.0` (required by Vite 8)
- npm
- A modern browser with `getUserMedia` support
- A camera for live analysis; saved recordings can be played without one

## 🚀 Quick Start

Run the launcher from the repository root:

```bash
python start_app.py
```

The launcher will:

1. Install the Python requirements.
2. Download `pose_landmarker_full.task` when it is missing.
3. Build the frontend when `frontend/dist` is missing.
4. Start FastAPI on `http://127.0.0.1:8000` and the frontend on `http://127.0.0.1:5173`.
5. Open the dashboard in the system's default browser.

In the dashboard, click **啟用攝影機** and allow access when the browser asks. Once permission is granted, use the camera selector above the video to change devices.

Keep the launcher terminal open while using the application. Press `Ctrl+C` in that terminal to stop both services.

> If frontend source files have changed while `frontend/dist` already exists, rebuild with `npm run build` inside `frontend/` before starting the launcher.

## 🔧 Manual Development Setup

### Backend

From the repository root:

```bash
python -m pip install -r requirements.txt
cd backend
python app.py
```

The backend runs at `http://127.0.0.1:8000`.

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173` or `http://localhost:5173`. Keep the backend running at port `8000`.

Useful frontend commands:

```bash
npm run lint
npm run build
npm run preview
```

`npm run build` creates production assets but does not start a server. Use `npm run preview` to preview that build, or use `python start_app.py` to serve it with the complete application.

## 📷 Camera and Recording Notes

- Camera permission is requested by the browser, not by Python directly.
- Open the application through the localhost URL; opening `frontend/dist/index.html` directly may block camera access and backend connections.
- Device names may remain hidden until camera permission has been granted.
- Only one live camera stream can use the backend at a time.
- Starting a recording requires an active camera and analysis connection.
- Videos and matching metric JSON files are stored in `backend/recordings/`.

## 📂 Project Structure

```text
├── backend/
│   ├── app.py              # FastAPI HTTP and WebSocket server
│   ├── dance_metrics.py    # Metric calculation engine
│   ├── pose_engine.py      # MediaPipe inference and overlay drawing
│   ├── constants.py        # H36M joint mappings and weights
│   └── recordings/         # Generated videos and metric JSON files
├── frontend/
│   ├── src/
│   │   ├── components/     # Camera, recording, and metric UI
│   │   └── AppContent.jsx  # Main application state and connections
│   └── dist/               # Generated production assets
├── design-system/          # UI design guidance
├── pseudo_code.md          # Theoretical basis for the metrics
├── start_app.py            # One-command local launcher
└── requirements.txt        # Python dependencies
```

## Troubleshooting

- **No permission dialog**: Check the browser's camera permission for `127.0.0.1`, then click **重新嘗試**.
- **Camera is busy**: Close other applications or tabs using the same camera.
- **No metrics**: Make sure the backend is running on port `8000` and the dashboard shows that pose analysis is connected.
- **Frontend changes are missing**: Rebuild `frontend/dist`, then restart the launcher.

## License

No license file has been added to this repository yet.
