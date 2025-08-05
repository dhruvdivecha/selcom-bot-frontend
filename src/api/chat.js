export async function sendChatMessage({ message, conversation_history = [] }) {
  const res = await fetch('http://localhost:8000/api/v1/local', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversation_history })
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}