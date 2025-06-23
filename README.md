# 🚦 Traffic AI Vision Control

An AI-driven full-stack system for smart traffic signal management.

## 💻 Tech Stack

- **Frontend**: React + Vite  
- **Backend**: Python (FastAPI/Flask with YOLOv8)  
- **Machine Learning**: YOLOv8 for object detection  
- **Optional**: Docker + Docker Compose for full-stack deployment

---

## 🧠 Overview

This system uses AI to analyze traffic camera feeds, detect vehicles in each lane, and intelligently adjust traffic light durations based on real-time traffic density.
Additionally, the system analyses furute expected traffic based on past data, via pictorial representation in analytics dashboard. 

### ✅ Features

- Real-time vehicle detection using YOLOv8
- Dynamic traffic light timing based on congestion
- Multi-camera video input support
- React frontend dashboard for monitoring
- Modular and scalable backend API
- Analytics function to predict future traffic
- Seperate expected traffic on weekday and weekend
---

## 📁 Folder Structure

```
root/
├── backend/
│   ├── app.py               # Python backend (API + processing)
│   ├── model/               # YOLO model weights (ignored in Git)
│   └── videos/              # Sample traffic footage (ignored in Git)
├── frontend/                # React frontend app
├── .gitignore               # Ignores node_modules, model, videos, etc.
└── README.md
```

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/ajaykrishna00-7/traffic-ai-vision-control.git
cd traffic-ai-vision-control
```

### 2. Install Dependencies

**Backend (Python)**

```bash
cd backend
pip install -r requirements.txt
```

**Frontend (React)**

```bash
cd ..
npm install
```

---

## 📦 Assets (Model & Videos)

This repo does **not** include large files like model weights and videos.  
Download and place them manually:

Then, place them in the following directories:

```
backend/model/    # model weights like yolov8l.pt
backend/videos/   # sample traffic videos
```

---

## 🧪 Running the Application

### Start the Backend

```bash
python backend/app.py
```
### Start the Frontend

```bash
npm run dev
```

Open your browser at: `http://localhost:3000`

---


## 🔭 Roadmap

- [x] YOLOv8-powered vehicle detection
- [x] Video-based dynamic traffic logic
- [X] Real-time analytics dashboard
---

_“Built with caffeine, chaos, and code.”_ ☕⚙️
