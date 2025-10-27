"use client";

import axios from "axios";

// const API_BASE_URL = "http://localhost:8084/api/v1"; // Replace with your actual API base URL
// const WS_BASE_URL = "ws://localhost:8084"; // Replace with your actual WebSocket base URL
const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

export interface Question {
  id: string | null;
  questionText: string;
  difficulty: string;
  category: string;
  expectedAnswer: string;
  createdAt: string;
  answeredCorrectly: boolean;
}

export interface AiAnalysis {
  id: string;
  sessionId: string;
  userId: string;
  analyzer: string;
  emotionAnalysis: string;
  speechAnalysis: string;
  eyeContactScore: number;
  confidenceScore: number;
  aiFeedback: string;
  nextSteps: string;
  processedAt: string;
}

export async function generateQuestion(category: string, difficulty: string, sessionId: string, focusArea: string, description: string) {
  try {
    const response = await axios.get(
      `https://apigateway-25az.onrender.com/api/v1/question/generate-question/${category}/${difficulty}/${sessionId}?focusArea=${focusArea}&description=${description}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function startSession() {
  try {
    const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/session/start-ai-session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Session started:", response.data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function endSession(interviewType: string, sessionId: string) {
  try {
    const response = await axios.get(`https://apigateway-25az.onrender.com/api/v1/session/end-session/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

export async function getFeedback(videoBlob: Blob, question: any, answer: string, sessionId: string) {
  try {
    const formData = new FormData();
    formData.append("videoChunk", videoBlob);
    formData.append("question", JSON.stringify(question)); // Convert object to JSON string
    formData.append("answer", answer);
    formData.append("sessionId", sessionId);

    console.log("Sending FormData:", formData);

    const response = await axios.post(
      "https://apigateway-25az.onrender.com/api/v1/processing/analyze-video",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Response Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getFeedback:", error);
    throw error;
  }
}
