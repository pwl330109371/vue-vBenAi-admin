---
name: ai-chat-module
description: Implement AI chat UI with streaming, session list, and error states in vue-vben-admin web-antd app.
---

## Layout

- `views/ai/chat/index.vue` — session + message list
- `views/ai/chat/api.ts` — stream + history endpoints
- `views/ai/chat/components/` — MessageItem, Composer, SessionList

## Streaming

Use fetch with ReadableStream or EventSource; store abort controller in component scope.
On unmount, abort pending request.

## UI

- Composer: textarea + send/stop
- Message: user/assistant/system roles
- Loading partial token animation optional

## Security

- Sanitize rendered markdown
- Never log API keys
