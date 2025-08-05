
import React, { useRef, useState, useEffect } from "react";

import ChatMessage from "./ChatMessage";
import VoiceNoteInput from "./VoiceNoteInput";

// Initial bot greeting
const initialMessages = [
  {
    role: "bot",
    content: "Hello! I'm your Selcom assistant. How can I help you today?",
    time: "Just now",
  },
];

export default function ChatSection() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle sending a message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setError("");
    const userMsg = {
      role: "user",
      content: input,
      time: new Date().toLocaleTimeString(),
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Import here to avoid SSR issues if needed
      const { sendChatMessage } = await import("../api/chat");
      const conversation_history = [
        ...messages.filter((m) => m.role === "user" || m.role === "bot").map((m) => ({
          role: m.role === "bot" ? "assistant" : m.role,
          content: m.content,
        })),
        { role: "user", content: input },
      ];
      const data = await sendChatMessage({ message: input, conversation_history });
      const botMsg = {
        role: "bot",
        content: data.response,
        video_links: data.video_links,
        time: new Date().toLocaleTimeString(),
      };
      setMessages((msgs) => [...msgs, botMsg]);
    } catch (err) {
      setError(`Failed to send message. Please try again. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Enter to send, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="chat-container bg-zinc-800 rounded-xl shadow-lg w-[95%] max-w-[900px] h-screen flex flex-col overflow-hidden border border-zinc-700 mx-auto">
      {/* Header */}
      <div className="chat-header bg-zinc-900 text-zinc-100 py-4 px-5 text-center text-base font-semibold border-b border-zinc-700 tracking-wide">
        <span role="img" aria-label="robot">🤖</span> Selcom Chatbot Tester
      </div>

      {/* Messages */}
      <div
        className="chat-messages flex-1 overflow-y-auto bg-zinc-900 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800"
        ref={chatRef}
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {loading && (
          <div className="flex items-start border-b border-white/5 px-5 py-4 bg-zinc-900">
            <div className="flex gap-2 max-w-[80%] flex-row">
              <div className="w-7 h-7 rounded-md flex items-center justify-center font-semibold text-sm bg-purple-500 text-white">AI</div>
              <div className="flex-1 p-3 bg-zinc-800/60 text-zinc-100 rounded-b-md rounded-t-2xl relative">
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <span className="inline-block w-4 h-4 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin"></span>
                  Thinking...
                </div>
                <div className="text-xs text-zinc-400 mt-1 text-center">Just now</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500 text-white px-4 py-3 text-sm rounded-md m-4 border border-red-400">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-container p-5 bg-zinc-800 border-t border-zinc-700">
        <form className="chat-input-form flex gap-3 items-end max-w-2xl mx-auto" onSubmit={handleSend}>
          <textarea
            className="chat-input flex-1 px-4 py-3 border border-zinc-700 rounded-xl text-base outline-none transition-all bg-zinc-700 text-zinc-100 resize-none min-h-[44px] max-h-[120px] font-sans leading-tight placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoFocus
            rows={1}
          />
          <button
            type="submit"
            className="send-button bg-emerald-600 text-white rounded-lg w-11 h-11 flex items-center justify-center text-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-700"
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            <span className="-mt-0.5">➤</span>
          </button>
        </form>
        {/* Voice Note Button */}
        <VoiceNoteInput
            conversationHistoryArray={messages.filter((m) => m.role === "user" || m.role === "bot").map((m) => ({
                role: m.role === "bot" ? "assistant" : m.role,
                content: m.content,
            }))}
            onTranscribed={async (result) => {
                // Add USER message (transcription) and BOT response at once
                setMessages(msgs => [
                    ...msgs,
                    {
                        role: "user",
                        content: result.query,
                        time: new Date().toLocaleTimeString(),
                    },
                    {
                        role: "bot",
                        content: result.response,
                        time: new Date().toLocaleTimeString(),
                    }
                ]);
            }}
        />
      </div>
    </div>
  );
}
