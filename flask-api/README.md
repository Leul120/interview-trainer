# Flask Video Emotion API

Small Flask API that accepts video bytes and returns aggregated emotion analysis and a simple eye-contact estimate. It uses OpenCV for frame handling and face detection and DeepFace for emotion recognition.

## Features
- Accepts video data as raw bytes (POST) and processes frames to estimate emotions.
- Aggregates per-frame emotion counts into percentage scores and computes an overall dominant emotion.
- Returns average confidence and a simple eye-contact score based on face position in frames.
- Lightweight optimizations: frame sampling, resizing, and preloaded face detector.

## Repository layout

- `app.py` - main Flask application and processing logic.
- `requirements.txt` - Python dependencies (install with pip).
- `dockerfile` - Dockerfile for container builds.

## Requirements

- Python 3.8+ recommended
- `pip` for installing dependencies
- A working OpenCV build and the packages listed in `requirements.txt` (see below)

Note: This project uses DeepFace which may download model weights on first run and can be heavy. GPU usage is optional but can speed up analysis if DeepFace and its backends are configured for GPU.

## Installation (local)

1. Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Run the app:

```powershell
python app.py
```

The server will start on `http://0.0.0.0:5000` by default (debug mode is enabled in `app.py`).

## Usage

Endpoints

- `GET /` — simple health/test endpoint. Returns JSON confirming the API is up.
- `POST /process-frame` — accepts raw video bytes in the request body and returns JSON with emotion analysis.

Example (send a local video file):

```powershell
# Windows PowerShell example
$bytes = [System.IO.File]::ReadAllBytes('sample_video.mp4')
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
$uri = 'http://127.0.0.1:5000/process-frame'
$req = [System.Net.WebRequest]::Create($uri)
$req.Method = 'POST'
$req.ContentType = 'application/octet-stream'
$req.ContentLength = $bytes.Length
$stream = $req.GetRequestStream()
$stream.Write($bytes, 0, $bytes.Length)
$stream.Close()
$resp = $req.GetResponse()
[System.IO.StreamReader]::new($resp.GetResponseStream()).ReadToEnd()
```

Or with curl (PowerShell, ensure curl maps to the proper curl executable):

```powershell
curl -X POST --data-binary @sample_video.mp4 -H "Content-Type: application/octet-stream" http://127.0.0.1:5000/process-frame
```

Response (example):

```json
{
  "average_emotion_scores": {"happy": 20.0, "neutral": 60.0, "sad": 20.0, ...},
  "overall_dominant_emotion": "neutral",
  "total_frames_analyzed": 10,
  "average_confidence_score": 0.72,
  "eye_contact_score": 40.0
}
```

## How it works (high level)

- `app.py` saves the incoming bytes to a temporary `.mp4` file.
- Uses OpenCV to read video frames.
- Samples frames at a configurable interval (default: every 30th frame) and downsizes frames to reduce CPU workload.
- Runs DeepFace emotion analysis on sampled frames (action: `emotion`, `enforce_detection=False`).
- Uses Haar cascade (`haarcascade_frontalface_default.xml`) to approximate eye contact by checking whether a detected face is near the center of the frame.

## Configuration and tuning

- `frame_interval` (in `app.py`) controls sampling frequency — reduce for more accuracy, increase to save CPU.
- `scale_factor` controls the resizing factor applied to frames before analysis.
- `max_workers` in the ThreadPoolExecutor controls concurrency for background processing.

## Docker

The repository contains a `dockerfile`. Basic steps to build and run (example for PowerShell):

```powershell
docker build -t flask-video-emotion .
docker run -p 5000:5000 flask-video-emotion
```

Notes: GPU support in Docker requires additional setup (nvidia runtime) and proper DeepFace backend configuration.

## Troubleshooting

- If DeepFace fails to download model weights, ensure the container or environment has outbound internet access.
- If OpenCV cannot open the temporary video file, check the format/codec of the uploaded video — OpenCV depends on underlying codecs.
- For high CPU usage, increase `frame_interval` or lower `scale_factor`.

## Security

- This API accepts arbitrary binary uploads. Before exposing to production, add authentication, input size limits, rate limiting, and sanitization.

## License

This repository has no license file. Add a `LICENSE` if you want to set one.

## Acknowledgements

- Uses DeepFace (https://github.com/serengil/deepface) for emotion recognition.
- Uses OpenCV for video and face detection.

---

If you'd like, I can also:

- add a minimal example client script that posts a video file to the API,
- update `requirements.txt` to pin versions,
- or add a tiny unit test to validate the health endpoint.
