# SmartFactory Guardian — Project Map

## Architecture Overview

```
 CSV / Simulation ──► Flask API ──► Preprocessing ──► CNN (features) ──► XGBoost (classify) ──► Dashboard
                         │                                                                    │
                         ▼                                                                    ▼
                     SQLite DB ──► Predictions, Alerts, Sensor Data ──► Socket.IO ──► React UI
```

**Pipeline**: Raw sensor data → sliding window (10 readings) → CNN feature extraction → XGBoost classification → store + push to UI.

---

## Directory Structure

```
SmartGaurdian/
├── backend/                          # Flask API server
│   ├── __init__.py
│   ├── app.py                        # Flask app factory, route registration, socketio.init_app
│   ├── config.py                     # Configuration (DB, CSV paths, model dirs, sensor fields, simulation interval)
│   ├── requirements.txt              # Python dependencies (Keras 3 + JAX, XGBoost, Flask-SocketIO, etc.)
│   ├── models/
│   │   ├── __init__.py
│   │   └── database.py               # SQLAlchemy models (Machine, SensorData, Prediction, Alert)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── api.py                    # REST endpoints (health, machines, sensor-data, predictions, alerts, stats)
│   │   └── socketio_events.py        # Socket.IO events (simulation start/stop, real-time sensor_update, failure cause detection)
│   ├── preprocessing/
│   │   ├── __init__.py
│   │   └── pipeline.py               # Data loading, StandardScaler, sequence creation (seq_length=10), single-record transform
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── model_manager.py          # Orchestrates CNN + XGBoost; sliding-window buffer per machine (10 reads before predict)
│   │   ├── cnn_feature_extractor.py  # 1D CNN (Keras 3 + JAX): 2×Conv1D → GlobalAvgPool → Dense(32) latent → Softmax(3)
│   │   └── xgboost_classifier.py     # XGBoost trained on 32-dim CNN features; predict + predict_proba + confidence
│   ├── data/
│   │   ├── __init__.py
│   │   └── ingestion.py              # CSV loading, simulated live stream with Gaussian noise + scenario cycling (Normal→Warning→Failure)
│   └── utils/
│       ├── __init__.py
│       └── logger.py                 # Centralised logging
├── frontend/                         # React dashboard (Vite + TailwindCSS + Recharts)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js                # Vite config with proxy to Flask (localhost:5000)
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Root component with SocketProvider
│       ├── index.css                 # Tailwind imports + custom scrollbar
│       ├── context/
│       │   └── SocketContext.jsx      # Socket.IO connection context + useSocket hook (polling-only transport)
│       ├── components/
│       │   ├── Layout.jsx            # Sidebar navigation shell (Overview, Analytics, Alerts, History tabs)
│       │   ├── KPICards.jsx          # 5 real-time sensor KPI tiles
│       │   ├── Charts.jsx            # Recharts multi-line sensor trend chart (last 60 points)
│       │   ├── AIPanel.jsx           # AI prediction card with label, animated confidence bar, buffering state
│       │   ├── AlertsPanel.jsx       # Live alert feed with acknowledge button + click-to-detail
│       │   ├── HistoryPanel.jsx      # Recent prediction history scrollable list
│       │   ├── NetworkStatus.jsx     # Connection indicator (Wifi / WifiOff)
│       │   ├── SensorDetailChart.jsx # Individual sensor line chart (used in Analytics tab)
│       │   └── AlertDetail.jsx       # Full alert context: message, severity, prediction, sensor readings with OVER LIMIT highlighting
│       └── pages/
│           └── Dashboard.jsx         # Main dashboard: tabbed layout, simulation control, alert detail navigation, desktop notifications
├── data/
│   ├── machine_failure_data.csv      # Raw 3000-row dataset (binary failure: 0/1)
│   └── machine_failure_3class.csv    # Prepared 5702-row dataset (2702 Normal, 2702 Warning, 298 Failure)
├── models/                           # Trained model artifacts
│   ├── cnn_model.h5                  # Trained CNN feature extractor (Keras 3)
│   ├── xgboost_model.json            # Trained XGBoost classifier
│   └── scaler.joblib                 # Fitted StandardScaler
├── scripts/
│   ├── prepare_data.py               # Generates 3-class dataset from binary CSV (interpolates Warning)
│   └── train_model.py                # End-to-end model training pipeline
├── run.py                            # Backend entry point (socketio.run with debug reloader disabled)
├── run_backend.bat                   # Windows shortcut to start Flask + SocketIO
├── run_frontend.bat                  # Windows shortcut to start Vite dev server
└── PROJECT_MAP.md                    # This file
```

---

## Data Flow

1. **Data Ingestion** (`backend/data/ingestion.py`)
   - Reads CSV records and streams them live at configurable interval (default 2s)
   - **Scenario cycling**: Normal (20 readings ×0.2–0.4 multipliers) → Warning (12 readings ×0.8–0.9) → Failure (8 readings ×1.4–1.8) → repeat
   - Adds Gaussian noise (σ = 2% of value) to simulate real sensor variance
   - Yields sensor dictionaries with `machine_id`, `timestamp`, and 5 sensor values

2. **REST API** (`backend/routes/api.py`)
   - `GET /api/health` — server health check
   - `GET /api/machines` — list registered machines
   - `POST /api/machines` — register new machine
   - `POST /api/sensor-data` — ingest sensor reading
   - `POST /api/sensor-data/batch` — batch ingest
   - `GET /api/predictions/<machine_id>` — prediction history
   - `GET /api/alerts` — list/filter alerts
   - `PATCH /api/alerts/<id>/acknowledge` — acknowledge alert
   - `GET /api/stats` — aggregate dashboard stats

3. **WebSocket / Socket.IO** (`backend/routes/socketio_events.py`)
   - `start_simulation` — begin streaming from CSV (force-stops any stale thread first)
   - `stop_simulation` — halt the stream
   - `sensor_update` → pushed to dashboard on each reading (sensors + AI prediction + optional alert with failure cause)
   - `simulation_status` → "started" / "stopped" / "already_running"
   - **Failure cause detection**: `identify_failure_cause()` compares each sensor against thresholds (Temp>90, Pressure>150, Vibration>6, Humidity>85, Power>130) and includes top cause(s) in alert message
   - Uses `threading` async mode with polling transport (no WebSocket dependency)

4. **Preprocessing** (`backend/preprocessing/pipeline.py`)
   - StandardScaler normalises 5 sensor fields
   - Sliding window of 10 timesteps creates sequences for CNN training
   - Single-record transform (same scaler) for real-time inference

5. **AI Pipeline** (`backend/ai/`)
   - **CNN** (Keras 3 + JAX): Conv1D(64, kernel=3) → Conv1D(128, kernel=3) → GlobalAveragePooling1D → Dense(32) latent → Dropout(0.5) → Dense(3, softmax)
     - Trained on 10-step sequences; penultimate Dense(32) layer serves as feature extractor
     - ~91% validation accuracy, cached extractor model avoids recomputation
   - **XGBoost**: trained on 32-dim CNN feature vectors
     - 3 classes: Normal (0), Warning (1), Failure (2)
     - Returns class label + probability confidence
   - **ModelManager**: loads artifacts on startup; maintains per-machine sliding buffer (10 readings) before making real predictions
     - While <10 readings: returns `{buffering: true, buffer_size: N}` → frontend shows "Buffering N/10" progress bar
     - First real prediction after full buffer

6. **Database** (`backend/models/database.py`)
   - `machines` — registered equipment (auto-registered on first use)
   - `sensor_data` — raw sensor readings with FK to machine + timestamp
   - `predictions` — AI inference results (class, label, confidence, feature snapshot)
   - `alerts` — system alerts (severity, message with failure cause, acknowledged flag)

7. **Frontend** (`frontend/`)
   - Socket.IO client (polling-only transport) receives `sensor_update` events
   - **Dashboard tabs**: Overview (main KPIs + charts + AI + alerts), Analytics (2-column per-sensor charts), Alerts (full feed), History (prediction log)
   - **KPICards** — temperature, pressure, vibration, humidity, power (dark tiles)
   - **Charts** — multi-line Recharts trend (last 60 data points)
   - **AIPanel** — current prediction label + animated confidence bar + buffering progress
   - **AlertsPanel** — live feed with severity icons, acknowledge, click-to-detail; unacknowledged count badge
   - **AlertDetail** — full failure context: alert message (with cause), prediction, sensor readings at failure with **OVER LIMIT** red highlighting
   - **SensorDetailChart** — individual line chart per sensor (Analytics tab)
   - **Start/Stop button** — optimistic UI toggle; auto-resets if no data arrives within 5s (safety timeout)
   - **Desktop notifications** — browser Notification API, click to open alert detail
   - Alerts stored with sensor snapshot at failure time for detail drill-down

---

## Failure Classes

| Code | Label     | Description |
|------|-----------|-------------|
| 0    | Normal    | All sensors within safe range |
| 1    | Warning   | Sensor readings approach critical thresholds |
| 2    | Failure   | Machine failure imminent or occurring — alert generated with specific cause |

---

## Key Conventions

- All sensor field names lowercase, underscore-separated: `temperature`, `pressure`, `vibration_level`, `humidity`, `power_consumption`
- Timestamps in ISO 8601 format
- 2-second simulation interval by default (configurable via `Config.SIMULATION_INTERVAL`)
- CNN sequence length: 10 readings
- Simulation cycle: ~40s Normal → ~24s Warning → ~16s Failure → repeat
- Alerts only trigger on Failure (class 2); Warning shows prediction but no alert
- Windows paths throughout; Mac/Linux users should adjust `run_backend.bat` / `run_frontend.bat`

---

## Quick Start

```bash
# 1. Install backend dependencies
cd backend
pip install -r requirements.txt

# 2. Prepare 3-class dataset
cd ../scripts
python prepare_data.py

# 3. Train AI models
python train_model.py

# 4. Start backend (terminal 1)
cd ..
python run.py

# 5. Start frontend (terminal 2)
cd frontend
npm install
npm run dev

# 6. Open http://localhost:5173 and click "Start"
```

---

## Phase 2+ Roadmap

- **ESP32 integration**: replace CSV simulation with real MQTT/HTTP sensor data
- **Multi-machine**: dashboard machine selector, per-machine analytics
- **Authentication**: user login, role-based access
- **Notifications**: email/SMS/Telegram alerts via webhook
- **Docker Compose**: containerised deployment
- **PostgreSQL**: production database migration
- **Model retraining**: periodic automated retraining on accumulated sensor data

---

## Known Limitations

- Keras 3 + JAX backend used instead of TensorFlow (incompatible with Python 3.14)
- Socket.IO polling-only transport (eventlet WebSocket fails on Windows)
- First 10 readings show "Buffering" progress — no predictions stored until buffer is full
- Initial load may show "Warning" at 100% confidence (zero-padded sequence before buffer is full; now prevented)
- Eventlet deprecation warning is harmless with threading mode
