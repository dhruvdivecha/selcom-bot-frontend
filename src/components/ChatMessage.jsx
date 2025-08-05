// ChatMessage.jsx

import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const avatar = isUser ? "U" : "AI";
  const avatarBg = isUser ? "bg-emerald-600" : "bg-purple-500";
  const contentBg = isUser
    ? "bg-emerald-600 text-white rounded-b-md rounded-t-2xl"
    : "bg-zinc-800/60 text-zinc-100 rounded-b-md rounded-t-2xl";
  const wrapperDir = isUser ? "flex-row-reverse" : "flex-row";
  const time = message.time || new Date().toLocaleTimeString();

  // Markdown rendering for bot, plain for user
  let content = message.content;
  if (!isUser) {
    const html = marked.parse(content, { breaks: true, gfm: true });
    content = (
      <div
        className="prose prose-invert max-w-none text-zinc-100 text-[15px]"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
      />
    );
  }

  return (
    <div
      className={`flex items-start border-b border-white/5 px-5 py-4 ${
        isUser ? "bg-zinc-800 justify-end" : "bg-zinc-900 justify-start"
      }`}
    >
      <div className={`flex gap-2 max-w-[80%] ${wrapperDir}`}>
        <div
          className={`w-7 h-7 rounded-md flex items-center justify-center font-semibold text-sm ${avatarBg}`}
        >
          {avatar}
        </div>
        <div className={`flex-1 p-3 ${contentBg} relative`}>
          <div className="leading-[1.5] whitespace-pre-wrap">
            {isUser ? message.content : content}
          </div>
          {/* Video Links for bot messages */}
          {Array.isArray(message.video_links) && message.video_links.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.video_links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-emerald-400 underline hover:text-emerald-300"
                >
                  📹 {link.title || link.url}
                </a>
              ))}
            </div>
          )}
          <div className="text-xs text-zinc-400 mt-1 text-center">
            {time}
          </div>
        </div>
      </div>
    </div>
  );
}
