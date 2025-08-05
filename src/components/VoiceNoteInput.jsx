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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = handleStop;
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
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

  // Handle stop: send audio to backend for transcription

    const handleStop = async () => {
        setLoading(true);
        setError("");
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "voicenote.webm");
        formData.append("conversation_history", JSON.stringify(conversationHistoryArray));
        
        try {
            const isDevelopment =
                typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development';
            const API_URL = isDevelopment
                ? 'http://localhost:8000/api/v1/voicenote'
                : 'https://selcom-bot-neurotech-1.onrender.com/api/v1/voicenote';
            
            const res = await fetch(API_URL, {
                method: "POST",
                body: formData,
            });
            
            if (!res.ok) throw new Error("Transcription failed");
            const data = await res.json();
            
            if (data) {
                onTranscribed(data);
            } else {
                setError("No response returned from server.");
            }
        } catch (err) {
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
