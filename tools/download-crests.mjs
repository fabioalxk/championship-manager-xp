// Baixa os escudos dos clubes do Wikipedia (pt) para public/crests/<id>.png.
// O <id> é o MESMO slug usado em src/game/clubs.ts, então o jogo acha pelo id.
//
// Fonte: API pageimages do Wikipedia (thumbnail já redimensionado no servidor —
// não precisa de lib de imagem local). Tamanho controlado por THUMB_PX.
//
// Uso: node tools/download-crests.mjs
import { access, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const THUMB_PX = 120 // pedido à API; ela devolve uma URL de thumb VÁLIDA (não reescrever!)
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'crests')
const API = 'https://pt.wikipedia.org/w/api.php'
// Wikimedia exige UA descritivo com contato, senão devolve 429/400.
const UA = 'cm-hobby-game/1.0 (https://github.com/; fabioalxk@gmail.com)'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// slug IDÊNTICO ao de src/game/clubs.ts — não alterar sem alterar lá.
const slug = (name) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

// [nome em clubs.ts, título exato no Wikipedia pt]
const CLUBS = [
  // Série A
  ['Flamengo', 'Clube de Regatas do Flamengo'],
  ['Palmeiras', 'Sociedade Esportiva Palmeiras'],
  ['Corinthians', 'Sport Club Corinthians Paulista'],
  ['São Paulo', 'São Paulo Futebol Clube'],
  ['Santos', 'Santos Futebol Clube'],
  ['Fluminense', 'Fluminense Football Club'],
  ['Botafogo', 'Botafogo de Futebol e Regatas'],
  ['Vasco', 'Club de Regatas Vasco da Gama'],
  ['Grêmio', 'Grêmio Foot-Ball Porto Alegrense'],
  ['Internacional', 'Sport Club Internacional'],
  ['Atlético-MG', 'Clube Atlético Mineiro'],
  ['Cruzeiro', 'Cruzeiro Esporte Clube'],
  ['Bahia', 'Esporte Clube Bahia'],
  ['RB Bragantino', 'Red Bull Bragantino'],
  ['Mirassol', 'Mirassol Futebol Clube'],
  ['Coritiba', 'Coritiba Foot Ball Club'],
  ['Athletico-PR', 'Club Athletico Paranaense'],
  ['Chapecoense', 'Associação Chapecoense de Futebol'],
  ['Remo', 'Clube do Remo'],
  ['Vitória', 'Esporte Clube Vitória'],
  // Série B
  ['América-MG', 'América Futebol Clube (Belo Horizonte)'],
  ['Athletic', 'Athletic Club (Minas Gerais)'],
  ['Atlético-GO', 'Atlético Clube Goianiense'],
  ['Avaí', 'Avaí Futebol Clube'],
  ['Botafogo-SP', 'Botafogo Futebol Clube (Ribeirão Preto)'],
  ['Ceará', 'Ceará Sporting Club'],
  ['CRB', 'Clube de Regatas Brasil'],
  ['Criciúma', 'Criciúma Esporte Clube'],
  ['Cuiabá', 'Cuiabá Esporte Clube'],
  ['Fortaleza', 'Fortaleza Esporte Clube'],
  ['Goiás', 'Goiás Esporte Clube'],
  ['Juventude', 'Esporte Clube Juventude'],
  ['Londrina', 'Londrina Esporte Clube'],
  ['Náutico', 'Clube Náutico Capibaribe'],
  ['Novorizontino', 'Grêmio Novorizontino'],
  ['Operário-PR', 'Operário Ferroviário Esporte Clube'],
  ['Ponte Preta', 'Associação Atlética Ponte Preta'],
  ['São Bernardo', 'São Bernardo Futebol Clube'],
  ['Sport', 'Sport Club do Recife'],
  ['Vila Nova', 'Vila Nova Futebol Clube'],
  // Série C
  ['Confiança', 'Associação Desportiva Confiança'],
  ['Ypiranga', 'Ypiranga Futebol Clube'],
  ['Maringá', 'Maringá Futebol Clube (2010)'],
  ['Ituano', 'Ituano Futebol Clube'],
  ['Botafogo-PB', 'Botafogo Futebol Clube (Paraíba)'],
  ['Figueirense', 'Figueirense Futebol Clube'],
  ['Anápolis', 'Anápolis Futebol Clube'],
  ['Itabaiana', 'Associação Olímpica de Itabaiana'],
  ['Guarani', 'Guarani Futebol Clube'],
  ['Floresta', 'Floresta Esporte Clube'],
  ['Brusque', 'Brusque Futebol Clube'],
  ['Caxias', 'Sociedade Esportiva e Recreativa Caxias do Sul'],
  ['Paysandu', 'Paysandu Sport Club'],
  ['Volta Redonda', 'Volta Redonda Futebol Clube'],
  ['Amazonas', 'Amazonas Futebol Clube'],
  ['Ferroviária', 'Associação Ferroviária de Esportes'],
  ['Inter de Limeira', 'Associação Atlética Internacional (Limeira)'],
  ['Maranhão', 'Maranhão Atlético Clube'],
  ['Santa Cruz', 'Santa Cruz Futebol Clube'],
  ['Barra-SC', 'Barra Futebol Clube'],
  // Série D
  ['ABC', 'ABC Futebol Clube'],
  ['América-RN', 'América Futebol Clube (Rio Grande do Norte)'],
  ['Treze', 'Treze Futebol Clube'],
  ['Campinense', 'Campinense Clube'],
  ['Ferroviário', 'Ferroviário Atlético Clube (Ceará)'],
  ['Tombense', 'Tombense Futebol Clube'],
  ['Aparecidense', 'Associação Atlética Aparecidense'],
  ['Pouso Alegre', 'Pouso Alegre Futebol Clube'],
  ['Brasil de Pelotas', 'Grêmio Esportivo Brasil'],
  ['São José-RS', 'Esporte Clube São José'],
  ['Real Noroeste', 'Real Noroeste Capixaba Futebol Clube'],
  ['Porto Velho', 'Porto Velho Esporte Clube'],
  ['Nova Iguaçu', 'Nova Iguaçu Futebol Clube'],
  ['Portuguesa-RJ', 'Associação Atlética Portuguesa'],
  ['Águia de Marabá', 'Águia de Marabá Futebol Clube'],
  ['Cascavel', 'Futebol Clube Cascavel'],
  ['Marcílio Dias', 'Clube Náutico Marcílio Dias'],
  ['Operário-MS', 'Operário Futebol Clube'],
  ['Costa Rica-MS', 'Costa Rica Esporte Clube'],
  ['União Rondonópolis', 'União Esporte Clube'],
]

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

const get = async (params) => {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`
  return (await fetchRetry(url)).json()
}

const resolveThumb = async (title) => {
  // 1) título exato (com redirects)
  let data = await get({ action: 'query', titles: title, prop: 'pageimages', pithumbsize: String(THUMB_PX), redirects: '1' })
  let page = Object.values(data.query?.pages ?? {})[0]
  if (page?.thumbnail?.source) return { title: page.title, src: page.thumbnail.source }
  // 2) busca textual como fallback
  data = await get({ action: 'query', generator: 'search', gsrsearch: `${title} futebol`, gsrlimit: '1', prop: 'pageimages', pithumbsize: String(THUMB_PX) })
  page = Object.values(data.query?.pages ?? {})[0]
  if (page?.thumbnail?.source) return { title: `${page.title} (busca)`, src: page.thumbnail.source }
  return null
}

const run = async () => {
  await mkdir(OUT_DIR, { recursive: true })
  const fails = []
  for (const [name, title] of CLUBS) {
    const id = slug(name)
    const dest = join(OUT_DIR, `${id}.png`)
    if (await access(dest).then(() => true, () => false)) {
      console.log(`⏭️  ${name.padEnd(22)} — já existe`)
      continue // re-run só busca os faltantes (apague o .png p/ forçar)
    }
    try {
      const hit = await resolveThumb(title)
      if (!hit) {
        fails.push(name)
        console.log(`❌ ${name.padEnd(22)} — sem escudo`)
        continue
      }
      const imgRes = await fetchRetry(hit.src) // usar a URL da API direto (reescrever quebra)
      const buf = Buffer.from(await imgRes.arrayBuffer())
      await writeFile(join(OUT_DIR, `${id}.png`), buf)
      console.log(`✅ ${name.padEnd(22)} → ${hit.title}  (${(buf.length / 1024).toFixed(1)} KB)`)
    } catch (e) {
      fails.push(name)
      console.log(`❌ ${name.padEnd(22)} — ${e.message}`)
    }
    await sleep(250) // educado com o servidor (evita 429)
  }
  console.log(`\n${CLUBS.length - fails.length}/${CLUBS.length} ok.`)
  if (fails.length) console.log(`Falhas: ${fails.join(', ')}`)
}

run()
