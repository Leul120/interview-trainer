import os
import cv2
import tempfile
import logging
from flask import Flask, request, jsonify
from deepface import DeepFace
from concurrent.futures import ThreadPoolExecutor

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


emotion_model = DeepFace.build_model('Emotion')
# Note: Although we preloaded the model, this version of DeepFace doesn't accept a preloaded model via the analyze() call.
# Other optimizations in the code still apply.

# Preload the face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# Create a ThreadPoolExecutor to offload heavy video processing tasks
executor = ThreadPoolExecutor(max_workers=4)

def process_video_data(video_bytes):
    try:
        # Save the video to a temporary file
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
            temp_file.write(video_bytes)
            temp_file.flush()
            temp_file_name = temp_file.name

        # Open the video using OpenCV
        cap = cv2.VideoCapture(temp_file_name)
        if not cap.isOpened():
            os.remove(temp_file_name)
            return {"error": "Failed to open video"}, 400

        # Initialize counters for emotion analysis and eye contact estimation
        emotion_counts = {
            'happy': 0, 'sad': 0, 'angry': 0, 'fear': 0,
            'disgust': 0, 'surprise': 0, 'neutral': 0
        }
        total_frames_analyzed = 0
        total_confidence_score = 0.0
        eye_contact_frames = 0

        frame_interval = 30  # Process every 30th frame to reduce processing load
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1
            if frame_count % frame_interval == 0:
                try:
                    # Resize frame to reduce computational load (downscale to 50% of original dimensions)
                    scale_factor = 0.5
                    resized_frame = cv2.resize(frame, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_AREA)
                    
                    # Analyze the resized frame using DeepFace without passing the 'models' parameter
                    analysis = DeepFace.analyze(
                        resized_frame,
                        actions=['emotion'],
                        enforce_detection=False
                    )
                    dominant_emotion = analysis[0]['dominant_emotion']
                    confidence = analysis[0].get('emotion', {}).get(dominant_emotion, 0.0)

                    # Update counters
                    if dominant_emotion in emotion_counts:
                        emotion_counts[dominant_emotion] += 1
                    total_confidence_score += confidence
                    total_frames_analyzed += 1

                    # Estimate eye contact by detecting faces near the center of the frame on the resized image
                    gray_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2GRAY)
                    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5)
                    frame_center_x, frame_center_y = resized_frame.shape[1] // 2, resized_frame.shape[0] // 2

                    for (x, y, w, h) in faces:
                        face_center_x, face_center_y = x + w // 2, y + h // 2
                        if (abs(face_center_x - frame_center_x) < resized_frame.shape[1] * 0.2 and
                            abs(face_center_y - frame_center_y) < resized_frame.shape[0] * 0.2):
                            eye_contact_frames += 1
                            break

                except Exception as e:
                    logging.warning(f"Error processing frame {frame_count}: {e}")

        cap.release()
        os.remove(temp_file_name)  # Clean up the temporary file

        if total_frames_analyzed == 0:
            return {"error": "No frames successfully analyzed"}, 400

        # Compute average scores and dominant emotion
        average_emotion_scores = {
            emotion: (count / total_frames_analyzed) * 100
            for emotion, count in emotion_counts.items()
        }
        overall_dominant_emotion = max(average_emotion_scores, key=average_emotion_scores.get)
        average_confidence_score = total_confidence_score / total_frames_analyzed
        eye_contact_score = (eye_contact_frames / total_frames_analyzed) * 100

        result = {
            "average_emotion_scores": average_emotion_scores,
            "overall_dominant_emotion": overall_dominant_emotion,
            "total_frames_analyzed": total_frames_analyzed,
            "average_confidence_score": average_confidence_score,
            "eye_contact_score": eye_contact_score
        }
        logging.info(f"Emotion analysis result: {result}")
        return result, 200

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return {"error": str(e)}, 500

@app.route('/process-frame', methods=['POST'])
def process_video():
    video_bytes = request.get_data()
    if not video_bytes:
        logging.info({"error": "No video data received"})
        return jsonify({"error": "No video data received"}), 400

    # Offload video processing to a background thread
    future = executor.submit(process_video_data, video_bytes)
    result, status_code = future.result()  # Wait for processing to complete
    return jsonify(result), status_code

# Testing endpoint added at '/'
@app.route('/', methods=['GET'])
def test_endpoint():
    return jsonify({"message": "Test endpoint: API is up and running."}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

