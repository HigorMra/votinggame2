import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Activity, ArrowDownRight, ArrowRight, Clock3, Gift, Heart, Sparkles, Users } from 'lucide-react'
import { connectLive } from './live.js'
import { getVoteDelta } from './vote-math.js'

const SIDE_META = {
  left: { label: 'ESQUERDA', color: 'blue', initial: 'E' },
  right: { label: 'DIREITA', color: 'red', initial: 'D' },
}

const CANDIDATES = {
  left: [
    { id: 'erika-hilton', name: 'Erika Hilton', photo: '/candidates/erika-hilton.jpg', party: 'PSOL', office: 'Deputada federal / SP', votes: 1596472 },
    { id: 'samia-bomfim', name: 'Sâmia Bomfim', photo: '/candidates/samia-bomfim.jpg', party: 'PSOL', office: 'Deputada federal / SP', votes: 583107 },
    { id: 'ana-elisa', name: 'Ana Elisa', photo: '/candidates/ana-elisa.jpg', party: 'PT', office: 'Deputada federal / MG', votes: 524219 },
    { id: 'tabata-amaral', name: 'Tabata Amaral', photo: '/candidates/tabata-amaral.jpg', party: 'PSB', office: 'Deputada federal / SP', votes: 476383 },
    { id: 'fernanda-melchionna', name: 'Fernanda Melchionna', photo: '/candidates/fernanda-melchionna.jpg', party: 'PSOL', office: 'Deputada federal / RS', votes: 280262 },
    { id: 'guilherme-cortez', name: 'Guilherme Cortez', photo: '/candidates/guilherme-cortez.jpg', party: 'PSOL', office: 'Deputado federal / SP', votes: 275450 },
    { id: 'eduardo-suplicy', name: 'Eduardo Suplicy', photo: '/candidates/eduardo-suplicy.jpg', party: 'PT', office: 'Deputado estadual / SP', votes: 654627 },
    { id: 'sofia-favero', name: 'Sofia Favero', photo: '/candidates/sofia-favero.jpg', party: 'PSOL', office: 'Deputada estadual / SP', votes: 407773 },
    { id: 'carlos-giannazi', name: 'Carlos Giannazi', photo: '/candidates/carlos-giannazi.jpg', party: 'PSOL', office: 'Deputado estadual / SP', votes: 367861 },
    { id: 'paula-bancada-feminista', name: 'Paula da Bancada Feminista', photo: '/candidates/paula-bancada-feminista.jpg', party: 'PSOL', office: 'Deputada estadual / SP', votes: 326190 },
    { id: 'ediane-maria', name: 'Ediane Maria', photo: '/candidates/ediane-maria.jpg', party: 'PSOL', office: 'Deputada estadual / SP', votes: 170844 },
    { id: 'luiza-erundina', name: 'Luiza Erundina', photo: '/candidates/luiza-erundina.jpg', party: 'PSOL', office: 'Deputada estadual / SP', votes: 169567 },
    { id: 'duda-hidalgo', name: 'Duda Hidalgo', photo: '/candidates/duda-hidalgo.jpg', party: 'PT', office: 'Deputada estadual / SP', votes: 154953 },
    { id: 'professora-bebel', name: 'Professora Bebel', photo: '/candidates/professora-bebel.jpg', party: 'PT', office: 'Deputada estadual / SP', votes: 142001 },
    { id: 'mariana-conti', name: 'Mariana Conti', photo: '/candidates/mariana-conti.jpg', party: 'PSOL', office: 'Deputada estadual / SP', votes: 126344 },
    { id: 'leonardo-grandini', name: 'Leonardo Grandini', photo: '/candidates/leonardo-grandini.jpg', party: 'PT', office: 'Deputado estadual / SP', votes: 122158 },
    { id: 'emidio', name: 'Emídio', photo: '/candidates/emidio.jpg', party: 'PT', office: 'Deputado estadual / SP', votes: 108275 },
    { id: 'rodrigo-mar', name: 'Rodrigo Mar', photo: '/candidates/rodrigo-mar.jpg', party: 'PT', office: 'Deputado estadual / SP', votes: 104820 },
    { id: 'enio-tatto', name: 'Enio Tatto', photo: '/candidates/enio-tatto.jpg', party: 'PT', office: 'Deputado estadual / SP', votes: 102892 },
    { id: 'paulo-fiorilo', name: 'Paulo Fiorilo', photo: '/candidates/paulo-fiorilo.jpg', party: 'PT', office: 'Deputado estadual / SP', votes: 96370 },
    { id: 'luiz-fernando', name: 'Luiz Fernando', photo: '/candidates/luiz-fernando.jpg', party: 'PT', office: 'Deputado estadual / SP', votes: 94901 },
    { id: 'debora-camilo', name: 'Débora Camilo', photo: '/candidates/debora-camilo.jpg', party: 'PSOL', office: 'Deputada estadual / SP', votes: 94895 },
    { id: 'donato', name: 'Donato', photo: '/candidates/donato.jpg', party: 'PT', office: 'Deputado estadual / SP', votes: 94779 },
    { id: 'ana-perugini', name: 'Ana Perugini', photo: '/candidates/ana-perugini.jpg', party: 'PT', office: 'Deputada estadual / SP', votes: 70737 },
  ],
  right: [
    { id: 'nikolas-ferreira', name: 'Nikolas Ferreira', photo: '/candidates/nikolas-ferreira.jpg', party: 'PL', office: 'Deputado federal / MG', votes: 3119318 },
    { id: 'lucas-pavanato', name: 'Lucas Pavanato', photo: '/candidates/lucas-pavanato.jpg', party: 'PL', office: 'Deputado federal / SP', votes: 3038438 },
    { id: 'andre-fernandes', name: 'André Fernandes', photo: '/candidates/andre-fernandes.jpg', party: 'PL', office: 'Deputado federal / CE', votes: 684372 },
    { id: 'julia-zanatta', name: 'Julia Zanatta', photo: '/candidates/julia-zanatta.jpg', party: 'PL', office: 'Deputada federal / SC', votes: 560223 },
    { id: 'jeffrey-chiquini', name: 'Jeffrey Chiquini', photo: '/candidates/jeffrey-chiquini.jpg', party: 'Novo', office: 'Deputado federal / PR', votes: 425399 },
    { id: 'lucas-polese', name: 'Lucas Polese', photo: '/candidates/lucas-polese.jpg', party: 'PL', office: 'Deputado federal / ES', votes: 419735 },
    { id: 'delegado-caveira', name: 'Delegado Caveira', photo: '/candidates/delegado-caveira.jpg', party: 'PL', office: 'Deputado federal / PA', votes: 414927 },
    { id: 'mauricio-marcon', name: 'Maurício Marcon', photo: '/candidates/mauricio-marcon.jpg', party: 'PL', office: 'Deputado federal / RS', votes: 379834 },
    { id: 'renato-bolsonaro', name: 'Renato Bolsonaro', photo: '/candidates/renato-bolsonaro.jpg', party: 'PL', office: 'Deputado federal / SP', votes: 379312 },
    { id: 'cabo-gilberto-silva', name: 'Cabo Gilberto Silva', photo: '/candidates/cabo-gilberto-silva.jpg', party: 'PL', office: 'Deputado federal / PB', votes: 267142 },
    { id: 'eduarda-campopiano', name: 'Eduarda Campopiano', photo: '/candidates/eduarda-campopiano.jpg', party: 'PL', office: 'Deputada estadual / SP', votes: 1956238 },
    { id: 'giovanni-sanches', name: 'Giovanni Sanches', photo: '/candidates/giovanni-sanches.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 235363 },
    { id: 'tenente-coimbra', name: 'Tenente Coimbra', photo: '/candidates/tenente-coimbra.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 198342 },
    { id: 'thomaz-henrique', name: 'Thomaz Henrique', photo: '/candidates/thomaz-henrique.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 178164 },
    { id: 'rodrigo-ashiuchi', name: 'Rodrigo Ashiuchi', photo: '/candidates/rodrigo-ashiuchi.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 162562 },
    { id: 'marcos-damasio', name: 'Marcos Damásio', photo: '/candidates/marcos-damasio.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 156691 },
    { id: 'dani-alonso', name: 'Dani Alonso', photo: '/candidates/dani-alonso.jpg', party: 'PL', office: 'Deputada estadual / SP', votes: 155574 },
    { id: 'conte-lopes', name: 'Conte Lopes', photo: '/candidates/conte-lopes.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 139225 },
    { id: 'felipe-sertanejo', name: 'Felipe Sertanejo', photo: '/candidates/felipe-sertanejo.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 138277 },
    { id: 'delegada-graciela', name: 'Delegada Graciela', photo: '/candidates/delegada-graciela.jpg', party: 'PL', office: 'Deputada estadual / SP', votes: 125624 },
    { id: 'alex-madureira', name: 'Alex Madureira', photo: '/candidates/alex-madureira.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 122704 },
    { id: 'paulo-mansur', name: 'Paulo Mansur', photo: '/candidates/paulo-mansur.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 107073 },
    { id: 'danilo-balas', name: 'Danilo Balas', photo: '/candidates/danilo-balas.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 96188 },
    { id: 'leticia-aguiar', name: 'Letícia Aguiar', photo: '/candidates/leticia-aguiar.jpg', party: 'PL', office: 'Deputada estadual / SP', votes: 94832 },
    { id: 'ricardo-madalena', name: 'Ricardo Madalena', photo: '/candidates/ricardo-madalena.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 94319 },
    { id: 'lucas-bove', name: 'Lucas Bove', photo: '/candidates/lucas-bove.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 71263 },
    { id: 'capitao-mosart', name: 'Capitão Mosart', photo: '/candidates/capitao-mosart.jpg', party: 'PL', office: 'Deputado estadual / SP', votes: 70997 },
    { id: 'fabiana-bolsonaro', name: 'Fabiana Bolsonaro', photo: '/candidates/fabiana-bolsonaro.jpg', party: 'PL', office: 'Deputada estadual / SP', votes: 61183 },
  ],
}

const initialScores = { left: 0, right: 0 }
const initialGifts = { left: 0, right: 0 }
const MATCH_DURATION = 5 * 60
const localOverlay = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const autoConnectOnLoad = import.meta.env.VITE_AUTO_CONNECT === 'true'
  || (localOverlay && import.meta.env.VITE_AUTO_CONNECT !== 'false')
const autoPlayMusic = new URLSearchParams(window.location.search).get('audio') === '1'

function randomMatchup(previous) {
  let next
  do {
    next = {
      left: CANDIDATES.left[Math.floor(Math.random() * CANDIDATES.left.length)].id,
      right: CANDIDATES.right[Math.floor(Math.random() * CANDIDATES.right.length)].id,
    }
  } while (previous && next.left === previous.left && next.right === previous.right)
  return next
}

function formatTime(total) {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function scoreFormat(score) {
  return new Intl.NumberFormat('pt-BR').format(score)
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR')
}

function ScoreNumber({ value }) {
  return <AnimatePresence mode="popLayout" initial={false}><motion.span key={value} initial={{ y: 11, opacity: 0, scale: 0.94 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -8, opacity: 0, scale: 1.02 }} transition={{ duration: 0.23, ease: 'easeOut' }}>{scoreFormat(value)}</motion.span></AnimatePresence>
}

function Panel({ children, className = '' }) {
  return <div className={`panel ${className}`}>{children}</div>
}

function VotingMachine({ side, candidate, pressed }) {
  const meta = SIDE_META[side]
  const color = meta.color
  const [lastPress, setLastPress] = useState(0)

  useEffect(() => { if (pressed) setLastPress(Date.now()) }, [pressed])

  return <div className="machine-visual" aria-hidden="true"><div className={`machine machine-${color} ${pressed ? 'machine-pressed' : ''}`}>
    <div className="machine-top"><span className="machine-brand">VOTO LIVE · X1</span><span className="machine-indicator"><i /> LIGADA</span></div>
    <div className="machine-screen-wrap">
      <div className="machine-screen">
        <div className="screen-head"><span>SEU VOTO PARA</span><strong>MELHOR MANDATO</strong></div>
        <div className="screen-candidate"><div className="candidate-avatar">{initials(candidate.name)}</div><div><span>PARTIDO</span><strong>{candidate.party}</strong></div></div>
        <div className="screen-person"><strong>{candidate.name}</strong><span>{candidate.office}</span></div>
        <div className="screen-footer"><span>CONFIRME</span><span>◀ ANULAR</span></div>
      </div>
    </div>
    <div className="machine-controls">
      <div className="keypad" aria-hidden="true">{['1', '2', '3', '4', '5', '6', '7', '8', '9', 'BR', '0', 'COR'].map((key, index) => <span className={`key ${index > 8 ? 'key-light' : ''}`} key={key}>{key}</span>)}</div>
      <div className="confirm-keys"><span className="key-cancel">ANULAR</span><span className="key-correct">CORRIGE</span><motion.span animate={pressed ? { scale: [1, 0.9, 1], boxShadow: ['0 3px 0 #17803d', '0 1px 0 #17803d', '0 3px 0 #17803d'] } : { scale: 1 }} className="key-confirm">CONFIRMA<ArrowRight size={9}/></motion.span></div>
    </div>
    <motion.div key={lastPress} className="machine-finger" initial={{ x: 0, y: 0, opacity: 0 }} animate={pressed ? { x: -35, y: -25, opacity: [0, 1, 1, 0] } : { opacity: 0 }} transition={{ duration: .52, times: [0, .2, .65, 1] }}>👆🏻</motion.div>
    <div className="machine-base" />
  </div></div>
}

function RoseFly({ side, username }) {
  const color = SIDE_META[side].color
  return <motion.div className={`rose-fly rose-${color}`} initial={{ opacity: 0, x: 0, y: 16, scale: .25, rotate: -25 }} animate={{ opacity: [0, 1, 1, 0], x: [0, 22, 82, 130], y: [16, -35, -42, -18], scale: [.3, 1.18, 1, .65], rotate: [-25, 5, 18, 32] }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: 'easeOut' }}><span>🌹</span><small>{username || 'Rosa'}</small><Sparkles size={13}/></motion.div>
}

function SideCard({ side, candidate, score, percent, gifts, pressed, roseEvents }) {
  const meta = SIDE_META[side]
  const color = meta.color

  return <Panel className={`candidate-card card-${color}`}>
    <div className="card-glow" />
    <div className="candidate-head">
      <div className={`side-share share-${color}`}><span className="share-label">{meta.label}</span><strong>{percent}<small>%</small></strong></div>
    </div>
    <div className="card-divider" />
    <div className="score-row"><div><span className="micro-label">VOTOS</span><div className={`score score-${color}`}><ScoreNumber value={score}/></div></div><div className="rose-total"><Gift size={18}/><b>{gifts}</b><span>🌹</span></div></div>
    <div className="vote-progress"><div className={`progress-fill fill-${color}`} style={{ width: `${percent}%` }} /><span className={`progress-marker marker-dot-${color}`} style={{ left: `calc(${percent}% - 5px)` }} /></div>
    <div className="machine-holder"><div className="machine-caption"><span>URNA {meta.label}</span><span className="machine-status"><i/> AO VIVO</span></div><div className="machine-stage"><div className="candidate-profile"><img src={candidate.photo} alt={`Foto oficial de ${candidate.name}, ${candidate.party}`} loading="eager"/><div className="candidate-description"><strong>{candidate.name}</strong><span className="candidate-party"><span />{candidate.party}</span><span className="candidate-office">{candidate.office}</span></div></div><VotingMachine side={side} candidate={candidate} pressed={pressed}/></div><AnimatePresence>{roseEvents.map((event) => <RoseFly key={event.id} side={side} username={event.username}/>)}</AnimatePresence></div>
    <div className="card-footer"><span><Gift size={16}/>{gifts} ROSAS</span><span>1 ROSA = 1 VOTO</span></div>
  </Panel>
}

function App() {
  const [scores, setScores] = useState(initialScores)
  const [gifts, setGifts] = useState(initialGifts)
  const [matchup, setMatchup] = useState(() => randomMatchup())
  const [round, setRound] = useState(1)
  const [elapsed, setElapsed] = useState(MATCH_DURATION)
  const [voteTotal, setVoteTotal] = useState(0)
  const [pressedSide, setPressedSide] = useState(null)
  const [roseEvents, setRoseEvents] = useState({ left: [], right: [] })
  const [liveStatus, setLiveStatus] = useState(autoConnectOnLoad ? 'connecting' : 'disconnected')
  const [events, setEvents] = useState([])
  const [matchResult, setMatchResult] = useState(null)
  const seq = useRef(0)
  const resetTimer = useRef()
  const sourceCleanups = useRef([])
  const audioRef = useRef(null)
  const roundSnapshotRef = useRef(null)

  const candidatesBySide = useMemo(() => ({
    left: CANDIDATES.left.find((candidate) => candidate.id === matchup.left),
    right: CANDIDATES.right.find((candidate) => candidate.id === matchup.right),
  }), [matchup])
  const percentages = useMemo(() => {
    const sum = scores.left + scores.right
    if (!sum) return { left: 50, right: 50 }
    return { left: Math.round((scores.left / sum) * 100), right: Math.round((scores.right / sum) * 100) }
  }, [scores])
  const difference = scores.left - scores.right
  const leader = difference > 0 ? 'left' : difference < 0 ? 'right' : null
  roundSnapshotRef.current = { scores, round, candidatesBySide }

  const addVote = useCallback((side, quantity = 1, username = 'TikTok') => {
    if (!SIDE_META[side]) return
    const delta = getVoteDelta(quantity)
    setScores((current) => ({ ...current, [side]: current[side] + delta.points }))
    setGifts((current) => ({ ...current, [side]: current[side] + delta.roses }))
    setVoteTotal((current) => current + delta.total)
    setPressedSide(side)
    window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setPressedSide((current) => current === side ? null : current), 720)
    const id = ++seq.current
    setRoseEvents((current) => ({ ...current, [side]: [...current[side], { id, username }].slice(-5) }))
    setTimeout(() => setRoseEvents((current) => ({ ...current, [side]: current[side].filter((item) => item.id !== id) })), 1400)
    setEvents((current) => [{ id, side, username, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }, ...current].slice(0, 5))
  }, [])

  const resetScoreboard = () => {
    setScores(initialScores); setGifts(initialGifts); setVoteTotal(0); setEvents([]); setRoseEvents({ left: [], right: [] }); setPressedSide(null)
  }

  const startNextRound = useCallback(() => {
    const { scores: finalScores, round: finalRound, candidatesBySide: finalCandidates } = roundSnapshotRef.current
    const winnerSide = finalScores.left === finalScores.right ? null : finalScores.left > finalScores.right ? 'left' : 'right'
    setMatchResult({ round: finalRound, winnerSide, winner: winnerSide ? finalCandidates[winnerSide] : null, scores: { ...finalScores } })
    setMatchup((current) => randomMatchup(current))
    resetScoreboard(); setElapsed(MATCH_DURATION); setRound((current) => current + 1)
  }, [])

  useEffect(() => {
    if (elapsed <= 0) {
      startNextRound()
      return undefined
    }
    const timer = window.setTimeout(() => setElapsed((time) => Math.max(0, time - 1)), 1000)
    return () => window.clearTimeout(timer)
  }, [elapsed, startNextRound])

  useEffect(() => {
    if (!matchResult) return undefined
    const timer = window.setTimeout(() => setMatchResult(null), 8000)
    return () => window.clearTimeout(timer)
  }, [matchResult])

  useEffect(() => () => { window.clearTimeout(resetTimer.current); sourceCleanups.current.forEach((cleanup) => cleanup()) }, [])

  useEffect(() => {
    if (!autoConnectOnLoad) return undefined
    const timer = window.setTimeout(() => {
      const cleanup = connectLive((event) => addVote(event.side, event.quantity, event.username), setLiveStatus)
      sourceCleanups.current.push(cleanup)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [addVote])

  useEffect(() => {
    if (!autoPlayMusic || !audioRef.current) return
    audioRef.current.volume = 0.25
    audioRef.current.play().catch(() => {})
  }, [])

  return <main className="app-shell">
    <div className="ambient-glow glow-one"/><div className="ambient-glow glow-two"/>
    <section className="match-info"><h1>A DECISÃO É SUA:<br/><span>QUEM FARÁ O MELHOR MANDATO?</span></h1><p>COMENTE <b className="instruction-left">ESQUERDA</b> OU <b className="instruction-right">DIREITA</b><br/>ENVIE 🌹 <b>1 ROSA = 1 VOTO</b></p></section>

    <section className="scoreboard" aria-label="Placar do x1 de candidatos">
      <Panel className="status-panel"><div className="timer-block"><span className="timer-label"><Clock3 size={12}/>PRÓXIMO X1</span><strong className={elapsed <= 30 ? 'timer-urgent' : ''}>{formatTime(elapsed)}</strong><span className="timer-hint">RODADA {round}</span></div><div className="status-divider"/><div className="status-metric"><span><Users size={13}/>VOTOS</span><strong><ScoreNumber value={voteTotal}/></strong><small>nesta rodada</small></div><div className="status-divider"/><div className="difference-metric"><span>{leader ? <ArrowDownRight size={14}/> : <Activity size={14}/>}DIFERENÇA</span><strong className={leader ? `diff-${SIDE_META[leader].color}` : ''}>{difference === 0 ? '—' : `${difference > 0 ? '+' : ''}${scoreFormat(difference)}`}</strong><small>{leader ? <>VANTAGEM <b>{SIDE_META[leader].label}</b></> : 'TUDO IGUAL'}</small></div><div className="status-live"><i/> RODADA {round}</div></Panel>
      <div className="candidate-grid"><SideCard side="left" candidate={candidatesBySide.left} score={scores.left} percent={percentages.left} gifts={gifts.left} pressed={pressedSide === 'left'} roseEvents={roseEvents.left}/><div className="versus"><span>VS</span><div/><small>AO VIVO</small></div><SideCard side="right" candidate={candidatesBySide.right} score={scores.right} percent={percentages.right} gifts={gifts.right} pressed={pressedSide === 'right'} roseEvents={roseEvents.right}/></div>
    </section>

    <section className="activity-strip"><div className="activity-title"><span className="activity-icon"><Activity size={14}/></span><div><strong>ROSAS RECEBIDAS</strong><small>AO VIVO</small></div></div><div className="activity-items"><AnimatePresence initial={false}>{events.length ? events.slice(0, 3).map((event) => <motion.div key={event.id} className="activity-item" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }}><span className={`event-avatar avatar-${SIDE_META[event.side].color}`}>{SIDE_META[event.side].initial}</span><span className="activity-user"><b>{event.username}</b><small>ENVIOU 🌹</small></span><span className={`event-vote vote-label-${SIDE_META[event.side].color}`}>+1 {SIDE_META[event.side].label}</span><span className="activity-time">{event.time}</span></motion.div>) : <span className="empty-activity">AGUARDANDO ROSAS</span>}</AnimatePresence></div><div className="activity-rules"><span><span className="rose-mini">🌹</span><b>CHAT + ROSA</b></span><small>1 ROSA = 1 VOTO</small></div></section>

    <footer className="site-footer"><span>© 2026 VOTO LIVE <span className="footer-dot">·</span> FOTOS DE CANDIDATURAS · TSE 2026</span><span className="footer-powered"><span/><span>FEITO PARA A COMUNIDADE</span><Heart size={11}/></span></footer>

      <audio ref={audioRef} src="/audio/funk-da-urna-2026.mp3" loop preload="auto" />

      <AnimatePresence>{matchResult && <motion.div className="match-result-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className={`match-result-card ${matchResult.winnerSide ? `result-${SIDE_META[matchResult.winnerSide].color}` : 'result-tie'}`} initial={{ opacity: 0, y: 24, scale: .82 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .94 }} transition={{ type: 'spring', damping: 18, stiffness: 220 }} role="status" aria-live="polite"><Sparkles size={23}/><span className="result-kicker">FIM DA RODADA {matchResult.round}</span><strong>{matchResult.winner ? `${matchResult.winner.name} venceu!` : 'Empate!'}</strong><span className="result-score">{scoreFormat(matchResult.scores.left)} × {scoreFormat(matchResult.scores.right)}</span><small>{matchResult.winner ? `VITÓRIA ${SIDE_META[matchResult.winnerSide].label}` : 'A PRÓXIMA DISPUTA COMEÇA AGORA'}</small></motion.div></motion.div>}</AnimatePresence>

  </main>
}

export default App
