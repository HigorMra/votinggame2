import test from 'node:test'
import assert from 'node:assert/strict'
import { getVoteDelta } from './vote-math.js'

test('one rose gift maps to one point, one rose, and one round vote', () => {
  assert.deepEqual(getVoteDelta(1), { points: 1, roses: 1, total: 1 })
})

test('a completed rose streak counts every rose in score, gift count and round total', () => {
  assert.deepEqual(getVoteDelta(5), { points: 5, roses: 5, total: 5 })
})

test('invalid quantities fall back to one and oversized quantities are bounded', () => {
  assert.deepEqual(getVoteDelta('invalid'), { points: 1, roses: 1, total: 1 })
  assert.deepEqual(getVoteDelta(5000), { points: 1000, roses: 1000, total: 1000 })
})
