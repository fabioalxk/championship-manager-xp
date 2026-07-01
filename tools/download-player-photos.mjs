// Baixa fotos reais de jogadores para public/players/<teamId>/<slug>.png.
// O <slug> é o MESMO usado por src/game/slug.ts a partir do nome em WC_ROSTERS
// (src/game/worldcupPlayers.ts), então o jogo acha a foto pelo nome do jogador.
//
// Fonte: API pageimages da Wikipédia em inglês (thumbnail já redimensionado no
// servidor). Todas as imagens hospedadas no Wikimedia Commons são de licença
// livre (Commons não aceita "fair use") — grava um CREDITS.md com autor/licença
// de cada foto, como exige a licença Creative Commons (atribuição).
//
// Uso: node tools/download-player-photos.mjs
import { access, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const THUMB_PX = 300
const OUT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'players')
const REST_API = 'https://en.wikipedia.org/api/rest_v1/page/summary'
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php'
// Wikimedia exige UA descritivo com contato, senão devolve 429/400.
const UA = 'cm-hobby-game/1.0 (https://github.com/; fabioalxk@gmail.com)'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// slug IDÊNTICO ao de src/game/slug.ts — não alterar sem alterar lá.
const slug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

// [nome em WC_ROSTERS.brasil, título exato do jogador na Wikipédia em inglês]
const TEAMS = {
  brasil: [
    ['Alisson', 'Alisson Becker'],
    ['Danilo', 'Danilo (footballer, born July 1991)'],
    ['Marquinhos', 'Marquinhos'],
    ['Gabriel M.', 'Gabriel Magalhães'],
    ['Wendell', 'Wendell (footballer, born 1993)'],
    ['Casemiro', 'Casemiro'],
    ['Bruno G.', 'Bruno Guimarães'],
    ['Paquetá', 'Lucas Paquetá'],
    ['Raphinha', 'Raphinha'],
    ['Endrick', 'Endrick'],
    ['Vini Jr.', 'Vinícius Júnior'],
  ],
}

// fetch com retry/backoff em 429 e 5xx + throttle leve entre chamadas.
const fetchRetry = async (url, tries = 4) => {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } })
    if (res.ok) return res
    if (res.status === 429 || res.status >= 500) {
      await sleep(1000 * 2 ** i) // 1s, 2s, 4s, 8s
      continue
    }
    throw new Error(`HTTP ${res.status}`)
  }
  throw new Error('429/5xx após retries')
}

const getSummary = async (title) => {
  const res = await fetchRetry(`${REST_API}/${encodeURIComponent(title.replace(/ /g, '_'))}`)
  return res.json()
}

// Busca autor + licença do arquivo original no Commons (p/ o CREDITS.md).
const getCredit = async (originalUrl) => {
  const filename = decodeURIComponent(originalUrl.split('/commons/')[1]).replace(/^.\/./, '')
  const title = `File:${filename.split('/').pop()}`
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'extmetadata',
    format: 'json',
  })
  const data = await (await fetchRetry(`${COMMONS_API}?${params}`)).json()
  const page = Object.values(data.query?.pages ?? {})[0]
  const em = page?.imageinfo?.[0]?.extmetadata
  const strip = (html) => (html ?? '').replace(/<[^>]+>/g, '').trim()
  return {
    title,
    artist: strip(em?.Artist?.value) || 'desconhecido',
    license: em?.LicenseShortName?.value ?? 'desconhecida',
  }
}

const run = async () => {
  const fails = []
  const credits = []
  for (const [teamId, roster] of Object.entries(TEAMS)) {
    const outDir = join(OUT_ROOT, teamId)
    await mkdir(outDir, { recursive: true })
    for (const [name, wikiTitle] of roster) {
      const id = slug(name)
      const dest = join(outDir, `${id}.png`)
      if (await access(dest).then(() => true, () => false)) {
        console.log(`⏭️  ${name.padEnd(14)} — já existe`)
        continue // re-run só busca os faltantes (apague o .png p/ forçar)
      }
      try {
        const summary = await getSummary(wikiTitle)
        const thumb = summary.thumbnail?.source
        if (!thumb) throw new Error('sem thumbnail (página sem foto no infobox)')
        const imgRes = await fetchRetry(thumb) // usar a URL da API direto (reescrever quebra)
        const buf = Buffer.from(await imgRes.arrayBuffer())
        await writeFile(dest, buf)
        await sleep(200)
        const credit = await getCredit(summary.originalimage?.source ?? thumb)
        credits.push({ team: teamId, name, wikiTitle, ...credit })
        console.log(`✅ ${name.padEnd(14)} → ${credit.title} (${credit.artist}, ${credit.license})`)
      } catch (e) {
        fails.push(name)
        console.log(`❌ ${name.padEnd(14)} — ${e.message}`)
      }
      await sleep(250) // educado com o servidor (evita 429)
    }
  }

  if (credits.length) {
    const lines = [
      '# Créditos das fotos (public/players/)',
      '',
      'Fotos do Wikimedia Commons, todas sob licença livre (Commons não aceita',
      '"fair use"). Atribuição exigida pela licença Creative Commons de cada uma:',
      '',
      ...credits.map((c) => `- **${c.name}** (${c.team}): ${c.title} — ${c.artist}, ${c.license}, via Wikimedia Commons`),
      '',
    ]
    await writeFile(join(OUT_ROOT, 'CREDITS.md'), lines.join('\n'))
  }

  const total = Object.values(TEAMS).flat().length
  console.log(`\n${total - fails.length}/${total} ok.`)
  if (fails.length) console.log(`Falhas: ${fails.join(', ')}`)
}

run()
