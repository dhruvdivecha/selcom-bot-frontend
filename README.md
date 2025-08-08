# Selcom Bot Frontend

A lightweight web client for the Selcom assistant. It helps users get reliable answers about Selcom products and workflows and, when relevant, shares official tutorial video links in a WhatsApp‑friendly format.

## What it does
- Answers questions about Selcom products, onboarding, KYC (e.g., NIDA), merchant tools, deposits, cards, and related workflows
- Retrieves trusted information from a curated knowledge base using a Retrieval‑Augmented Generation (RAG) pipeline
- Suggests relevant tutorial videos and sends a single WhatsApp message with a rich preview (links only, no file uploads)
- Formats messages to maximize WhatsApp previews (URL placed near the top; no duplicate links)
- Avoids wrong video matches with intent‑aware ranking (e.g., distinguishes “register” vs “use” tutorials)
- Lists available video titles on request (e.g., “what videos do you have?”)
- Handles common follow‑ups and clarifications without resetting context
- Supports voice input (browser speech‑to‑text or server‑side transcription)

## WhatsApp‑optimized behavior
- Uses text messages with preview enabled (never the WhatsApp “video” type)
- Sends only one message per reply to prevent duplicate links
- Places the video title and URL at the beginning to improve preview reliability
- Applies a brief post‑send delay to let previews render more fully

## AI and retrieval
- Vector search over the knowledge base (Pinecone) + LLM reasoning
- Topic gating and channel filtering to avoid off‑topic content
- Higher confidence thresholds to reduce weak matches
- Intent‑aware video matching to prefer the correct action (e.g., “use” vs “register”)

## Example things to ask
- “How do I use Bando la Miamala?”
- “Show me tutorials for Selcom Mastercard.”
- “What videos do you have?”
- “Help me register a merchant with NIDA.”

## Disclaimer
This is an unofficial project and is not affiliated with, endorsed by, or sponsored by Selcom, Meta (Facebook/WhatsApp), or YouTube. For demo and internal testing purposes only.

## License
Unofficial project — not affiliated with Selcom or Meta. Proprietary; internal demo/testing use only.