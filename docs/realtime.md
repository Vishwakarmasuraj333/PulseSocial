# PulseSocial — Real-Time Streaming Architecture (SSE)

## 1. Overview
PulseSocial implements real-time activity delivery using **Server-Sent Events (SSE)** via `GET /api/realtime/stream`.
SSE provides low-latency, lightweight HTTP/2 push updates natively supported across modern browsers without requiring WebSocket connection overhead or persistent stateful gateway servers.

## 2. Authentication & Multi-Tenant Channel Isolation
1. **Connection Authentication**:
   - Clients must present an active `pulsesocial_auth_session` cookie.
   - The server verifies the JWT session and extracts the authenticated `activeOrgId`.
   - Connections without an active workspace session are immediately terminated with `401 Unauthorized`.
2. **Channel Scoping**:
   - Every event dispatched over the SSE connection is scoped strictly to `session.activeOrgId`.
   - Cross-workspace events are never delivered to unauthorized listeners.

## 3. Streaming Protocol & Event Types
- **Handshake Event**:
  ```
  event: connected
  data: {"status":"CONNECTED","workspaceId":"org_123","timestamp":"2026-10-10T07:00:00Z"}
  ```
- **Audit & Activity Event**:
  ```
  id: evt_456
  event: audit_event
  data: {"id":"evt_456","action":"POST_PUBLISHED","resourceType":"SocialPost","timestamp":"2026-10-10T07:01:00Z"}
  ```
- **Heartbeat (every 15 seconds)**:
  ```
  : heartbeat 1760080000000
  ```

## 4. Reconnection & Last-Event-ID
- Clients that disconnect can reconnect passing the `Last-Event-ID` header.
- The server replays any unconsumed workspace events created since that event ID.

## 5. Graceful Fallback
- For restricted corporate proxies or clients that cannot maintain an open streaming socket, PulseSocial provides `GET /api/notifications` with cursor pagination as an automated polling fallback.
