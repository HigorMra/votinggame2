export function getVoteDelta(quantity = 1) {
  const value = Number(quantity)
  const normalized = Number.isFinite(value) ? Math.min(1000, Math.max(1, Math.floor(value))) : 1
  return { points: normalized, roses: normalized, total: normalized }
}
