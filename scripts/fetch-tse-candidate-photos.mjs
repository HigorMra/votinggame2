import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const appPath = resolve('src/App.jsx')
const appSource = await readFile(appPath, 'utf8')
const candidatePattern = /\{ id: '([^']+)', name: '([^']+)', party: '([^']+)', office: '([^']+)', votes: (\d+) \}/g
const candidates = [...appSource.matchAll(candidatePattern)].map(([, id, name, party, office, votes]) => ({ id, name, party, office, votes }))
const photoDirectory = resolve('public/candidates')
const electionId = '20322002026'
const apiRoot = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1'
const normalizeName = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '')

if (candidates.length !== 52) throw new Error(`Esperava 52 candidatos no App.jsx; encontrei ${candidates.length}.`)
await mkdir(photoDirectory, { recursive: true })

const groups = new Map()
for (const candidate of candidates) {
  const [role, uf] = candidate.office.split(' / ')
  const cargo = role.toLowerCase().includes('federal') ? 6 : 7
  const groupId = `${uf}/${cargo}`
  if (!groups.has(groupId)) groups.set(groupId, { uf, cargo })
}

const candidateLists = new Map()
for (const [groupId, { uf, cargo }] of groups) {
  const url = `${apiRoot}/candidatura/listar/2026/${uf}/${electionId}/${cargo}/candidatos`
  const response = await fetch(url, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`TSE list request failed (${response.status}) for ${groupId}`)
  const data = await response.json()
  candidateLists.set(groupId, data.candidatos || [])
}

const updatedLines = appSource.split(/\r?\n/)
for (const candidate of candidates) {
  const [role, uf] = candidate.office.split(' / ')
  const cargo = role.toLowerCase().includes('federal') ? 6 : 7
  const rows = candidateLists.get(`${uf}/${cargo}`) || []
  const searchName = normalizeName(candidate.name)
  const result = rows.find((row) => normalizeName(row.nomeUrna || '') === searchName)
    || rows.find((row) => normalizeName(row.nomeCompleto || '') === searchName)

  if (!result) throw new Error(`Candidato não encontrado na eleição do TSE 2026: ${candidate.name} (${uf})`)

  const detailUrl = `${apiRoot}/candidatura/buscar/2026/${uf}/${electionId}/candidato/${result.id}`
  const detailResponse = await fetch(detailUrl, { headers: { accept: 'application/json' } })
  if (!detailResponse.ok) throw new Error(`TSE detail request failed (${detailResponse.status}) for ${candidate.name}`)
  const detail = await detailResponse.json()
  if (!detail.fotoUrl || !detail.fotoUrlPublicavel) throw new Error(`Foto pública não encontrada no TSE para ${candidate.name}`)

  const imageResponse = await fetch(detail.fotoUrl)
  const contentType = imageResponse.headers.get('content-type') || ''
  if (!imageResponse.ok || !contentType.startsWith('image/')) throw new Error(`Foto inválida do TSE para ${candidate.name}: ${imageResponse.status} ${contentType}`)
  const image = Buffer.from(await imageResponse.arrayBuffer())
  if (image.length < 2000) throw new Error(`Arquivo de foto inesperadamente pequeno para ${candidate.name}`)
  await writeFile(resolve(photoDirectory, `${candidate.id}.jpg`), image)

  const lineIndex = updatedLines.findIndex((line) => line.includes(`id: '${candidate.id}',`))
  if (lineIndex < 0) throw new Error(`Registro não encontrado no App.jsx: ${candidate.id}`)
  updatedLines[lineIndex] = updatedLines[lineIndex].replace("party: '", `photo: '/candidates/${candidate.id}.jpg', party: '`)
  console.log(`Foto TSE salva: ${candidate.name} (${Math.round(image.length / 1024)} KB)`)
}

await writeFile(appPath, updatedLines.join('\n'), 'utf8')
console.log(`Atualizados ${candidates.length} retratos oficiais de candidaturas 2026.`)
