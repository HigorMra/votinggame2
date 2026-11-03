import express from 'express'
import { createServer } from 'node:http'
import { WebSocketServer, WebSocket } from 'ws'
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector'
import { readRoseGift, readSideChoice, rememberSideChoice } from './gifts.js'

const PORT = Number(process.env.PORT) || 3001
const username = process.env.TIKTOK_USERNAME?.trim().replace(/^@/, '')
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || [
    'https://prismatic-chaja-b3562e.netlify.app',
    'https://voto-live-overlay.onrender.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
)
const viewerSideChoices = new Map()

const app = express()
app.disable('x-powered-by')
const httpServer = createServer(app)
const wss = new WebSocketServer({
  server: httpServer,
  path: '/live',
  maxPayload: 1024,
  verifyClient: ({ origin }, callback) => {
    const allowed = Boolean(origin && allowedOrigins.has(origin))
    callback(allowed, allowed ? undefined : 403, allowed ? undefined : 'Origin not allowed')
  },
})
let connection
let liveStatus = username ? 'connecting' : 'disconnected'
let shuttingDown = false
let connectInFlight = false
let retryTimer
let retryDelayMs = 20_000

function broadcast(payload) {
  const message = JSON.stringify(payload)
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(message)
  }
}

function setLiveStatus(status, message) {
  liveStatus = status
  broadcast({ type: 'status', status, ...(message ? { message } : {}) })
  console.log(`[tiktok] ${status}${message ? `: ${message}` : ''}`)
}

function scheduleReconnect(message) {
  setLiveStatus('disconnected', message)
  if (shuttingDown || retryTimer) return

  const delay = retryDelayMs
  retryDelayMs = Math.min(retryDelayMs * 2, 120_000)
  console.log(`[tiktok] retrying in ${Math.round(delay / 1000)} seconds`)
  retryTimer = setTimeout(() => {
    retryTimer = undefined
    void connectTikTok()
  }, delay)
}

async function connectTikTok() {
  if (!connection || shuttingDown || connectInFlight || connection.isConnected) return
  connectInFlight = true
  setLiveStatus('connecting')

  try {
    await connection.connect()
    clearTimeout(retryTimer)
    retryTimer = undefined
    retryDelayMs = 20_000
    setLiveStatus('connected')
  } catch (error) {
    console.error('[tiktok] unable to connect:', error?.message || 'Could not connect to LIVE room')
    scheduleReconnect(error?.message || 'Could not connect to LIVE room')
  } finally {
    connectInFlight = false
  }
}

// A small health endpoint makes it easy to tell whether the HTTP/WebSocket adapter
// is running and whether it has connected to the configured TikTok LIVE room.
app.get('/health', (_request, response) => {
  response.set('Cache-Control', 'no-store')
  response.set('X-Content-Type-Options', 'nosniff')
  response.json({ service: 'voto-live-adapter', status: liveStatus })
})

wss.on('connection', (socket) => {
  if (wss.clients.size > 100) {
    socket.close(1013, 'Connection limit reached')
    return
  }
  socket.send(JSON.stringify({ type: 'status', status: liveStatus }))
  socket.on('message', (data) => {
    try {
      if (JSON.parse(data.toString()).type === 'ping' && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
      }
    } catch { /* Ignore non-JSON messages from clients. */ }
  })
  socket.on('error', (error) => console.warn('[websocket] client error:', error.message))
})

wss.on('error', (error) => console.error('[websocket] server error:', error.message))

if (!username) {
  console.log('[tiktok] TIKTOK_USERNAME is not set; adapter is ready in demo mode.')
} else {
  // Gift details are requested so the Rose filter uses the human-readable gift
  // name. The connector itself runs only on the server; no TikTok cookies or
  // credentials are sent to the browser.
  connection = new TikTokLiveConnection(username, { enableExtendedGiftInfo: true })

  connection.on(WebcastEvent.CHAT, (event) => {
    const choice = readSideChoice(event)
    if (!choice) return

    rememberSideChoice(choice, { viewerSideChoices })
    broadcast({ type: 'side-choice', side: choice.side, username: choice.username, timestamp: Date.now() })
  })

  connection.on(WebcastEvent.GIFT, (event) => {
    const rose = readRoseGift(event, { viewerSideChoices })
    if (rose) broadcast({ type: 'rose', ...rose })
  })

  connection.on('connected', () => {
    clearTimeout(retryTimer)
    retryTimer = undefined
    retryDelayMs = 20_000
    setLiveStatus('connected')
  })
  connection.on('disconnected', (event) => {
    scheduleReconnect(event?.reason || 'TikTok LIVE disconnected')
  })
  connection.on('error', (error) => {
    console.error('[tiktok] connection error:', error?.message || 'TikTok connection error')
  })

  void connectTikTok()
}

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] HTTP health check: http://localhost:${PORT}/health`)
  console.log(`[server] WebSocket events: ws://localhost:${PORT}/live`)
})

async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  clearTimeout(retryTimer)
  console.log(`[server] ${signal}; closing connections...`)

  try {
    await connection?.disconnect()
  } catch (error) {
    console.warn('[tiktok] disconnect error:', error.message)
  }

  wss.clients.forEach((client) => client.close(1001, 'Server shutting down'))
  wss.close()
  httpServer.close(() => process.exit(0))
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
