from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import cv2
import numpy as np
import time
import os
import csv
import json
import base64
from datetime import datetime
from ultralytics import YOLO
import threading
from io import BytesIO
import matplotlib.pyplot as plt
import pandas as pd

app = Flask(__name__)
CORS(app)

# Global variables for traffic system state
traffic_system = None

class TrafficSystem:
    def __init__(self):
        base_dir = os.path.dirname(__file__)
        video_dir = os.path.join(base_dir, "videos")

        self.video_paths = [
            os.path.join(video_dir, "camera1.mp4"),
            os.path.join(video_dir, "camera3.mp4"),
            os.path.join(video_dir, "camera4.mp4"),
            os.path.join(video_dir, "camera5.mp4"),
        ]

        self.extra_video_paths = [
            os.path.join(video_dir, "camera1.mp4"),
            os.path.join(video_dir, "camera1.mp4"),
            os.path.join(video_dir, "camera1.mp4"),
            os.path.join(video_dir, "camera1.mp4"),
        ]

        self.caps = [cv2.VideoCapture(p) for p in self.video_paths]
        self.extra_caps = [cv2.VideoCapture(p) for p in self.extra_video_paths]
        model_path = os.path.join(base_dir, "model", "yolov8l.pt")
        self.model = YOLO(model_path)

        self.direction_names = ["North", "East", "South", "West"]
        self.done = [0, 0, 0, 0]
        self.base_time = 80

        # Current system state
        self.current_states = ["RED", "RED", "RED", "RED"]
        self.vehicle_counts = [0, 0, 0, 0]
        self.extra_counts = [0, 0, 0, 0]
        self.current_direction = 0
        self.remaining_time = 0
        self.current_frames = [None, None, None, None]

        # System control
        self.running = False
        self.manual_override = False

        self.setup_logging()

    def setup_logging(self):
        self.log_dir = "traffic_logs"
        os.makedirs(self.log_dir, exist_ok=True)
        weekday = datetime.now().weekday() < 5
        self.log_file = os.path.join(self.log_dir, "weekday.csv" if weekday else "weekend.csv")
        log_fields = ["timestamp", "direction", "car", "bike", "truck"]
        if not os.path.exists(self.log_file):
            with open(self.log_file, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(log_fields)

    def read_frame(self, cap):
        ret, frame = cap.read()
        if not ret or frame is None:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = cap.read()
        frame = cv2.resize(frame, (640, 480))
        return frame

    def count_vehicles(self, frame):
        results = self.model.predict(source=frame, conf=0.3, imgsz=640, verbose=False)[0]
        count = 0
        annotated_frame = frame.copy()

        for box in results.boxes:
            cls_id = int(box.cls[0])
            cls_name = self.model.names[cls_id]
            xyxy = box.xyxy[0].cpu().numpy().astype(int)

            if cls_name == 'truck':
                width = xyxy[2] - xyxy[0]
                height = xyxy[3] - xyxy[1]
                if width < 60 and height < 60:
                    cls_name = 'car'

            if cls_name in ['car', 'truck', 'bus', 'motorcycle', 'van', 'auto', 'bicycle', 'scooter']:
                count += 1
                cv2.rectangle(annotated_frame, tuple(xyxy[:2]), tuple(xyxy[2:]), (0, 255, 0), 2)
                cv2.putText(annotated_frame, cls_name, tuple(xyxy[:2]), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 2)

        return annotated_frame, count

    def get_green_time(self, vehicle_count):
        return self.base_time + min(vehicle_count * 2, 30)

    def choose_next_signal(self):
        max_count = -1
        selected_index = -1

        for i in range(4):
            if self.done[i] == 0 and self.vehicle_counts[i] > max_count:
                max_count = self.vehicle_counts[i]
                selected_index = i

        if selected_index != -1:
            green_time = self.get_green_time(max_count)
            self.done[selected_index] = 1
        else:
            self.done[:] = [0, 0, 0, 0]
            selected_index = 0
            green_time = self.get_green_time(self.vehicle_counts[selected_index])
            self.done[selected_index] = 1

        return selected_index, green_time

    def log_counts(self):
        now = datetime.now().replace(minute=0, second=0, microsecond=0)
        with open(self.log_file, 'a', newline='') as f:
            writer = csv.writer(f)
            for i, direction in enumerate(self.direction_names):
                writer.writerow([now, direction, self.vehicle_counts[i], 0, 0])

    def update_frames_and_counts(self):
        # Main cameras
        frames = [self.read_frame(cap) for cap in self.caps]
        annotated_frames = []
        vehicle_counts = []

        for frame in frames:
            annotated, count = self.count_vehicles(frame)
            annotated_frames.append(annotated)
            vehicle_counts.append(count)

        self.current_frames = annotated_frames
        self.vehicle_counts = vehicle_counts

        # Extra cameras
        extra_frames = [self.read_frame(cap) for cap in self.extra_caps]
        extra_counts = []
        for frame in extra_frames:
            _, count = self.count_vehicles(frame)
            extra_counts.append(count)

        self.extra_counts = extra_counts
        self.log_counts()

    def run_traffic_cycle(self):
        while self.running:
            if not self.manual_override:
                self.update_frames_and_counts()
                current_dir, green_time = self.choose_next_signal()
                self.current_direction = current_dir

                # Yellow phase (3 seconds)
                for t in range(3, 0, -1):
                    if not self.running:
                        break
                    self.update_frames_and_counts()
                    self.current_states = ["YELLOW" if i == current_dir else "RED" for i in range(4)]
                    self.remaining_time = t
                    time.sleep(1)

                # Green phase
                for t in range(green_time, 0, -1):
                    if not self.running:
                        break
                    self.update_frames_and_counts()
                    self.current_states = ["GREEN" if i == current_dir else "RED" for i in range(4)]
                    self.remaining_time = t
                    time.sleep(1)

                # Yellow phase (3 seconds)
                for t in range(3, 0, -1):
                    if not self.running:
                        break
                    self.update_frames_and_counts()
                    self.current_states = ["YELLOW" if i == current_dir else "RED" for i in range(4)]
                    self.remaining_time = t
                    time.sleep(1)
            else:
                time.sleep(1)

    def start(self):
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self.run_traffic_cycle)
            self.thread.daemon = True
            self.thread.start()

    def stop(self):
        self.running = False
        if hasattr(self, 'thread'):
            self.thread.join(timeout=1)

    def cleanup(self):
        for cap in self.caps + self.extra_caps:
            cap.release()

# Initialize traffic system
traffic_system = TrafficSystem()

@app.route('/api/status')
def get_status():
    return jsonify({
        'running': traffic_system.running,
        'manual_override': traffic_system.manual_override,
        'current_states': traffic_system.current_states,
        'vehicle_counts': traffic_system.vehicle_counts,
        'extra_counts': traffic_system.extra_counts,
        'current_direction': traffic_system.current_direction,
        'remaining_time': traffic_system.remaining_time,
        'direction_names': traffic_system.direction_names
    })

@app.route('/api/camera/<int:camera_id>')
def get_camera_feed(camera_id):
    if camera_id < 0 or camera_id >= 4 or not traffic_system.current_frames[camera_id] is not None:
        return jsonify({'error': 'Invalid camera ID'}), 400

    frame = traffic_system.current_frames[camera_id]

    # Add signal state overlay
    color_map = {"GREEN": (0,255,0), "YELLOW": (0,255,255), "RED": (0,0,255)}
    state = traffic_system.current_states[camera_id]
    color = color_map[state]

    label = f"{state}: {traffic_system.remaining_time}s" if state != "RED" else state
    cv2.putText(frame, label, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
    cv2.putText(frame, f"Count: {traffic_system.vehicle_counts[camera_id]}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)
    cv2.putText(frame, f"{traffic_system.direction_names[camera_id]}", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255,255,255), 2)

    # Convert frame to base64
    _, buffer = cv2.imencode('.jpg', frame)
    frame_base64 = base64.b64encode(buffer).decode('utf-8')

    return jsonify({'image': f'data:image/jpeg;base64,{frame_base64}'})

@app.route('/api/control', methods=['POST'])
def control_system():
    data = request.json
    action = data.get('action')

    if action == 'start':
        traffic_system.start()
        return jsonify({'message': 'System started'})
    elif action == 'stop':
        traffic_system.stop()
        return jsonify({'message': 'System stopped'})
    elif action == 'manual_override':
        traffic_system.manual_override = data.get('enabled', False)
        if traffic_system.manual_override:
            states = data.get('states', ["RED", "RED", "RED", "RED"])
            traffic_system.current_states = states
        return jsonify({'message': 'Manual override updated'})
    else:
        return jsonify({'error': 'Invalid action'}), 400

@app.route('/api/analytics')
def get_analytics():
    try:
        log_folder = "traffic_logs"
        today = datetime.now()
        is_weekend = today.weekday() >= 5
        filename = "weekend.csv" if is_weekend else "weekday.csv"
        log_path = os.path.join(log_folder, filename)

        if not os.path.exists(log_path):
            return jsonify({'error': 'No data available'}), 404

        df = pd.read_csv(log_path)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['hour'] = df['timestamp'].dt.hour

        # Group data by hour and direction
        grouped = df.groupby(['hour', 'direction'])[['car', 'bike', 'truck']].sum().reset_index()

        # Convert to format suitable for frontend charts
        analytics_data = {
            'hourly_data': grouped.to_dict('records'),
            'total_by_direction': df.groupby('direction')[['car', 'bike', 'truck']].sum().to_dict(),
            'peak_hours': df.groupby('hour')[['car', 'bike', 'truck']].sum().to_dict(),
            'current_period': 'weekend' if is_weekend else 'weekday'
        }

        return jsonify(analytics_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try:
        app.run(debug=True, host='0.0.0.0', port=5000)
    finally:
        traffic_system.cleanup()
