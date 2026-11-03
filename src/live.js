/**
 * Browser-side adapter. The unofficial TikTok connector runs only on the Node server;
 * this socket receives normalized Rose events and never exposes TikTok credentials.
 */
export function connectLive(onRose, onStatus) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const isLocalOverlay = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  const url = isLocalOverlay
    ? `${protocol}//${window.location.hostname}:3001/live`
    : import.meta.env.VITE_LIVE_WS_URL || `${protocol}//${window.location.hostname}:3001/live`
  let socket
  let manuallyClosed = false
  let retryTimer
  let heartbeatTimer
  let retryDelay = 1500

  const open = () => {
    if (manuallyClosed) return
    socket = new WebSocket(url)
    socket.addEventListener('open', () => {
      retryDelay = 1500
      onStatus('connected')
      // Keep free WebSocket hosts from treating an otherwise quiet overlay as idle.
      heartbeatTimer = window.setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'ping' }))
      }, 60000)
    })
    socket.addEventListener('message', (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'status') onStatus(payload.status)
        if (payload.type === 'rose' && (payload.side === 'left' || payload.side === 'right')) onRose(payload)
      } catch { /* Ignore malformed or unrelated socket messages. */ }
    })
    socket.addEventListener('error', () => { onStatus('disconnected') })
    socket.addEventListener('close', () => {
      window.clearInterval(heartbeatTimer)
      onStatus('disconnected')
      if (!manuallyClosed) {
        retryTimer = window.setTimeout(open, retryDelay)
        retryDelay = Math.min(retryDelay * 1.8, 12000)
      }
    })
  }

  open()
  return () => { manuallyClosed = true; window.clearTimeout(retryTimer); window.clearInterval(heartbeatTimer); socket?.close() }
}
