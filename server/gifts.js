function normalizeUsername(value) {
  return String(value || '').replace(/^@/, '').trim().toLocaleLowerCase()
}

export const SIDE_CHOICE_TTL_MS = 5 * 60 * 1000

export function rememberSideChoice(choice, { viewerSideChoices }, now = Date.now()) {
  if (!choice?.sender || !['left', 'right'].includes(choice.side)) return false

  for (const [sender, selection] of viewerSideChoices) {
    if (selection && typeof selection === 'object' && selection.expiresAt <= now) {
      viewerSideChoices.delete(sender)
    }
  }

  viewerSideChoices.delete(choice.sender)
  viewerSideChoices.set(choice.sender, { side: choice.side, expiresAt: now + SIDE_CHOICE_TTL_MS })
  if (viewerSideChoices.size > 5000) viewerSideChoices.delete(viewerSideChoices.keys().next().value)
  return true
}

export function normalizeTikfinityEnvelope(envelope) {
  if (!envelope || typeof envelope !== 'object' || !envelope.data || typeof envelope.data !== 'object') return null
  const type = String(envelope.event || '').trim().toLocaleLowerCase()
  if (!['chat', 'gift'].includes(type)) return null

  const data = envelope.data
  return {
    ...data,
    type,
    user: data.user || {
      uniqueId: data.uniqueId || data.username || data.userName,
      nickname: data.nickname || data.displayName || data.uniqueId || data.username,
    },
    ...(type === 'gift' ? {
      giftName: data.giftName || data.giftDetails?.giftName || data.extendedGiftInfo?.name || '',
      giftId: data.giftId ?? data.giftDetails?.giftId,
    } : {
      comment: data.comment ?? data.message ?? '',
    }),
  }
}

export function readSideChoice(event) {
  const sender = normalizeUsername(event.user?.uniqueId)
  const rawCommand = String(event.comment || '').trim()
  if (rawCommand.length > 32) return null
  const command = rawCommand.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase()
  if (!sender || !['esquerda', 'direita'].includes(command)) return null

  return {
    sender,
    side: command === 'esquerda' ? 'left' : 'right',
    username: String(event.user?.nickname || sender).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 50),
  }
}

export function readRoseGift(event, { viewerSideChoices, now = Date.now() }) {
  const giftName = event.giftDetails?.giftName || event.extendedGiftInfo?.name || event.giftName || ''
  const normalizedGiftName = String(giftName).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase()
  if (!['rose', 'rosa'].includes(normalizedGiftName)) return null

  // Streakable gifts report intermediate repeats; only the final event carries
  // the complete repeatCount and should update the scoreboard.
  if (event.streaking === true) return null
  if (event.giftDetails?.giftType === 1 && !event.repeatEnd) return null

  const sender = String(event.user?.uniqueId || '').replace(/^@/, '').slice(0, 50)
  const senderKey = normalizeUsername(sender)
  let selection = viewerSideChoices.get(senderKey)
  if (selection && typeof selection === 'object' && selection.expiresAt <= now) {
    viewerSideChoices.delete(senderKey)
    selection = undefined
  }
  const selectedSide = selection && typeof selection === 'object' ? selection.side : selection
  const side = selectedSide === 'left' || selectedSide === 'right' ? selectedSide : null

  // Never silently assign a paid gift to the left side when the viewer hasn't
  // explicitly selected a side in chat.
  if (side !== 'left' && side !== 'right') return null

  return {
    side,
    quantity: Math.min(1000, Math.max(1, Math.floor(Number(event.repeatCount) || 1))),
    username: String(event.user?.nickname || sender || 'Alguém').replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 50),
    giftName: 'Rose',
    giftId: event.giftId,
    timestamp: Date.now(),
  }
}
