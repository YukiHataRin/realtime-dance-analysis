# Real-time Dance Aesthetics Analysis

A sophisticated real-time motion analysis dashboard designed for dance and movement aesthetics. This project leverages MediaPipe's Task API for pose estimation and calculates nine distinct metrics based on biomechanical principles to provide live feedback on a dancer's performance.

![Architecture](https://img.shields.io/badge/Architecture-FastAPI%20%2B%20React%20%2B%20MediaPipe-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Key Features

- **Real-time Pose Estimation**: High-fidelity 33-point body tracking using MediaPipe's Pose Landmarker.
- **Biomechanical Metrics Engine**: Calculates 9 distinct aesthetic indicators based on H36M compatible skeleton data.
- **WebSocket Synchronization**: Low-latency data transmission between the Python backend and React frontend.
- **Interactive Dashboard**: 3x3 grid visualization with real-time charts and value tracking.
- **Dynamic Skeleton Overlay**: Real-time visualization of the tracking skeleton (focusing on torso and limbs).

## 📊 The 9 Aesthetic Metrics

Our analysis engine decomposes movement into nine key indicators as defined in our system's pseudocode:

1.  **Intensity (Energy)**: Sum of limb angular velocities ($rad^2/s$). Reflects the overall physical output.
2.  **Sync - Balance**: The magnitude ratio between left and right limb velocities ([0, 1]). Measures spatial symmetry.
3.  **Sync - Correlation**: Rolling Pearson correlation between left and right side movements ([-1, 1]). Measures temporal synchronicity.
4.  **Volume (Expansion)**: The 3D convex hull volume occupied by the 17 key joints. Reflects spatial extension.
5.  **Roundness (Curvature)**: Geometric curvature ($\kappa$) of the extremities' (wrists/ankles) trajectories.
6.  **Stability - Height**: Vertical level of the body's Center of Mass (CoM).
7.  **Stability - Sway**: Horizontal deviation of the CoM from the Base of Support (mid-point of ankles).
8.  **Effort (Torque)**: Sum of limb angular accelerations ($rad/s^2$). Measures the force required for transitions.
9.  **Smoothness (Jerk)**: Time derivative of acceleration. Higher values indicate more abrupt, less fluid movements.

## 🛠️ Tech Stack

- **Backend**: Python 3.9+, FastAPI, MediaPipe Tasks API, OpenCV, SciPy, NumPy.
- **Frontend**: React (Vite), Tailwind CSS, Recharts (for live data visualization), Lucide React.
- **Communication**: WebSockets (Metrics) and MJPEG (Video Stream).

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+ & npm

### Backend Setup

1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
2.  Run the FastAPI server:
    ```bash
    cd backend
    python app.py
    ```
    The server will start on `http://localhost:8000`. It will automatically download the `pose_landmarker_full.task` model on first run.

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Build or Run:
    - **Development**: `npm run dev`
    - **Production**: `npm run build`

## 📂 Project Structure

```text
├── backend/
│   ├── app.py              # FastAPI & WebSocket server
│   ├── dance_metrics.py    # Metric calculation engine
│   ├── pose_engine.py      # MediaPipe integration & drawing
│   └── constants.py        # H36M joint mappings & weights
├── frontend/
│   ├── src/
│   │   ├── components/     # VideoFeed & MetricsDashboard
│   │   └── AppContent.jsx  # Main application logic
│   └── dist/               # Compiled static assets
├── pseudo_code.md          # Theoretical basis for metrics
└── requirements.txt        # Backend dependencies
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
