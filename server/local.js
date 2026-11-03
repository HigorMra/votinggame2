import express from 'express'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocket, WebSocketServer } from 'ws'
import { normalizeTikfinityEnvelope, readRoseGift, readSideChoice, rememberSideChoice } from './gifts.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distPath = path.join(root, 'dist')
const username = String(process.env.TIKTOK_USERNAME || '').trim().replace(/^@/, '')
const port = Number(process.env.PORT) || 3001
const tikfinityUrl = process.env.TIKFINITY_WS_URL || 'ws://127.0.0.1:21213/'
const tikfinityTarget = new URL(tikfinityUrl)
if (tikfinityTarget.protocol !== 'ws:'
  || !['127.0.0.1', 'localhost', '[::1]'].includes(tikfinityTarget.hostname)
  || (tikfinityTarget.port && tikfinityTarget.port !== '21213')
  || tikfinityTarget.username
  || tikfinityTarget.password) {
  throw new Error('TIKFINITY_WS_URL must point to the local TikFinity Event API on port 21213')
}
const allowedOrigins = new Set([
  `http://localhost:${port}`,
  `http://127.0.0.1:${port}`,
  ...(process.env.ALLOWED_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean),
])

const app = express()
app.disable('x-powered-by')
app.use((_request, response, next) => {
  response.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Content-Security-Policy': `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; media-src 'self'; connect-src 'self' ws://127.0.0.1:${port} ws://localhost:${port}; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'`,
  })
  next()
})
let bridgeStatus = 'connecting'
let lastEventAt = null
let lastTikFinityMessageAt = null
let lastVoteAt = null
let eventCount = 0
let voteCount = 0
let lastError = ''
const viewerSideChoices = new Map()

app.get('/health', (_request, response) => {
  response.set('Cache-Control', 'no-store')
  response.set('X-Content-Type-Options', 'nosniff')
  response.json({
    service: 'voto-live-local',
    provider: 'TikFinity Event API',
    status: bridgeStatus,
    // This is the local TikFinity socket state, not proof that a TikTok LIVE is active.
    liveConfirmed: false,
    username,
    lastEventAt,
    lastTikFinityMessageAt,
    lastVoteAt,
    eventCount,
    voteCount,
    ...(lastError ? { message: lastError } : {}),
  })
})
app.use(express.static(distPath, { index: false, fallthrough: true }))
app.get('*', (_request, response) => response.sendFile(path.join(distPath, 'index.html')))

const httpServer = createServer(app)
const wss = new WebSocketServer({
  server: httpServer,
  path: '/live',
  maxPayload: 256,
  verifyClient: ({ origin }, callback) => {
    const allowed = Boolean(origin && allowedOrigins.has(origin))
    callback(allowed, allowed ? undefined : 403, allowed ? undefined : 'Origin not allowed')
  },
})

let upstream
let retryTimer
let retryDelay = 2000
let stopping = false

function broadcast(payload) {
  const message = JSON.stringify(payload)
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(message)
  }
}

function setStatus(status, message = '') {
  bridgeStatus = status
  lastError = String(message).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 160)
  broadcast({ type: 'status', status, ...(lastError ? { message: lastError } : {}) })
  console.log(`[bridge] ${status}${lastError ? `: ${lastError}` : ''}`)
}

function handleTikFinityEvent(envelope) {
  const event = normalizeTikfinityEnvelope(envelope)
  if (!event) return
  lastEventAt = new Date().toISOString()
  eventCount += 1

  if (event.type === 'chat') {
    const choice = readSideChoice(event)
    if (!choice) return
    rememberSideChoice(choice, { viewerSideChoices })
    broadcast({ type: 'side-choice', side: choice.side, username: choice.username, timestamp: Date.now() })
    console.log(`[event] chat choice received (${choice.side})`)
    return
  }

  const rose = readRoseGift(event, { viewerSideChoices })
  if (rose) {
    voteCount += rose.quantity
    lastVoteAt = new Date().toISOString()
    broadcast({ type: 'rose', ...rose })
    console.log(`[event] Rose vote received (${rose.side}, quantity ${rose.quantity})`)
  } else {
    console.log('[event] gift received but did not qualify as a routed Rose vote')
  }
}

function connectTikFinity() {
  if (stopping || (upstream && upstream.readyState <= WebSocket.OPEN)) return

  const socket = new WebSocket(tikfinityUrl)
  upstream = socket
  socket.on('open', () => {
    retryDelay = 2000
    setStatus('connected')
    console.log(`[bridge] connected to TikFinity Event API at ${tikfinityUrl}; waiting for events from @${username}`)
  })
  socket.on('message', (raw) => {
    let envelope
    try { envelope = JSON.parse(raw.toString()) } catch { return }
    lastTikFinityMessageAt = new Date().toISOString()
    handleTikFinityEvent(envelope)
  })
  socket.on('error', (error) => {
    setStatus('disconnected', error?.message || 'TikFinity Event API indisponível')
  })
  socket.on('close', () => {
    if (upstream === socket) upstream = undefined
    if (stopping) return
    setStatus('disconnected', 'Conexão do TikFinity fechada; tentando reconectar')
    retryTimer = setTimeout(connectTikFinity, retryDelay)
    retryDelay = Math.min(retryDelay * 1.7, 15000)
  })
}

wss.on('connection', (socket) => {
  if (wss.clients.size > 20) {
    socket.close(1013, 'Local viewer limit reached')
    return
  }
  socket.send(JSON.stringify({ type: 'status', status: bridgeStatus, ...(lastError ? { message: lastError } : {}) }))
  socket.on('message', (data) => {
    try {
      if (JSON.parse(data.toString()).type === 'ping' && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
      }
    } catch { /* Ignore non-JSON client messages. */ }
  })
})

httpServer.listen(port, '127.0.0.1', () => {
  console.log(`[local] overlay: http://127.0.0.1:${port}/`)
  console.log(`[local] health:  http://127.0.0.1:${port}/health`)
  console.log(`[local] TikFinity Event API: ${tikfinityUrl}`)
  console.log(`[local] expected creator: @${username}; socket status does not confirm that a TikTok LIVE is active`)
  connectTikFinity()
})

function shutdown(signal) {
  if (stopping) return
  stopping = true
  clearTimeout(retryTimer)
  console.log(`[local] ${signal}; closing local bridge...`)
  upstream?.close()
  wss.clients.forEach((client) => client.close(1001, 'Local bridge shutting down'))
  wss.close()
  httpServer.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 2000).unref()
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
