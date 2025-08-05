export async function sendChatMessage({ message, conversation_history = [] }) {
  const isDevelopment =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development';
  const API_URL = isDevelopment
    ? 'http://localhost:8000/api/v1/local'
    : 'https://selcom-bot-neurotech-1.onrender.com/api/v1/local';
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversation_history })
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}