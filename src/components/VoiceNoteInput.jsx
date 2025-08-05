import React, { useRef, useState } from "react";

/**
 * VoiceNoteInput component
 * Allows user to record a voice note, sends it to the backend for transcription,
 * and calls onTranscribed(text) with the result.
 *
 * Props:
 *   onTranscribed: (text: string) => void
 */
export default function VoiceNoteInput({ onTranscribed, conversationHistoryArray }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  // Start recording
  const startRecording = async () => {
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      console.log("Microphone access granted");
      streamRef.current = stream;

      // Try different MIME types for better mobile compatibility
      let options = { mimeType: 'audio/webm' };
      
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          options = { mimeType: 'audio/wav' };
        } else {
          options = {}; // Use default
        }
      }
      
      console.log("Using MediaRecorder with options:", options);

      // For iOS Safari fallback, make sure MediaRecorder is polyfilled
      const mediaRecorder = new window.MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log("Audio data chunk received:", e.data.size, "bytes");
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || options.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        console.log("Recording stopped. Final blob:", audioBlob.size, "bytes, type:", audioBlob.type);

        if (audioBlob.size === 0) {
          console.warn('Empty blob - possibly failed recording on mobile.');
          setError("No audio captured. Try again.");
          return;
        }

        sendToBackend(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("getUserMedia error:", err);
      setError(`Microphone access denied or not available. ${err.message}`);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      // Release the mic stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  // Send audio to backend for transcription
  const sendToBackend = async (audioBlob) => {
    setLoading(true);
    setError("");
    
    console.log("Audio blob size:", audioBlob.size);
    console.log("Audio blob type:", audioBlob.type);
    
    // Try different audio formats for better mobile compatibility
    let filename = "voicenote.webm";
    let mimeType = audioBlob.type;
    
    // For iOS Safari, try different formats
    if (mimeType.includes("mp4") || mimeType.includes("m4a")) {
      filename = "voicenote.m4a";
    } else if (mimeType.includes("wav")) {
      filename = "voicenote.wav";
    }
    
    const formData = new FormData();
    formData.append("file", audioBlob, filename);
    formData.append("conversation_history", JSON.stringify(conversationHistoryArray));
    
    try {
      const isDevelopment =
        typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development';
      const API_URL = isDevelopment
        ? 'http://localhost:8000/api/v1/voicenote'
        : 'https://selcom-bot-neurotech-1.onrender.com/api/v1/voicenote';
      
      console.log("Sending to:", API_URL);
      console.log("File size:", audioBlob.size, "bytes");
      
      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend error response:", errorText);
        throw new Error(`Transcription failed (${res.status}): ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Backend response:", data);
      
      if (data) {
        onTranscribed(data);
      } else {
        setError("No response returned from server.");
      }
    } catch (err) {
      console.error("Transcription error:", err);
      setError(`Failed to transcribe audio. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-2">
      <button
        type="button"
        className={`px-4 py-2 rounded-lg font-semibold text-white transition-all focus:outline-none ${
          recording
            ? "bg-red-600 animate-pulse"
            : "bg-emerald-600 hover:bg-emerald-700"
        }`}
        onClick={recording ? stopRecording : startRecording}
        disabled={loading}
      >
        {recording ? "Stop Recording" : "Record Voice Note"}
      </button>
      {loading && <span className="text-zinc-400 text-sm">Transcribing...</span>}
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
}
