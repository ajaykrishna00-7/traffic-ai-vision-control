
# AI Traffic Signal Control System - Backend

## Setup Instructions

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Create the required directories:
```bash
mkdir videos model traffic_logs
```

3. Place your video files in the `videos/` directory:
   - camera1.mp4 through camera8.mp4

4. Place your YOLO model in the `model/` directory:
   - yolov8l.pt

5. Run the Flask server:
```bash
python app.py
```

The server will start on http://localhost:5000

## API Endpoints

- `GET /api/status` - Get current system status
- `GET /api/camera/<id>` - Get processed camera feed (0-3)
- `POST /api/control` - Control system (start/stop/manual override)
- `GET /api/analytics` - Get traffic analytics data

## Directory Structure

```
backend/
├── app.py                 # Flask server
├── videos/               # Video files (camera1-8.mp4)
├── model/               # YOLO model (yolov8l.pt)  
├── traffic_logs/        # CSV log files
└── requirements.txt     # Python dependencies
```
