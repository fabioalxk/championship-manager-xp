# Plano — Modo Carreira (estilo Elifoot + simulação animada)

> Documento de planejamento. Nenhuma decisão aqui é definitiva, mas todas as
> marcadas como "decidido" foram acordadas. Evoluir conforme necessário.

## Visão

Jogo de **técnico single-player**, estilo Elifoot, com um diferencial que nenhum
Elifoot teve: **a partida do jogador é assistida com replay animado** usando o
motor de simulação que já existe neste projeto.

O jogador começa num time pequeno (Série D), evolui o elenco, sobe de divisão,
ganha títulos, e clubes maiores passam a oferecer emprego conforme o sucesso.

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Tipo de jogo | Single-player, modo carreira (não multiplayer no MVP) |
| Plataforma | 100% no browser, site estático, **sem backend** |
| Save | IndexedDB (navegador); 1 save de carreira no MVP |
| Visualização | Replay animado do jogo do jogador (reaproveita o canvas atual) |
| Simulação das outras partidas | **Híbrido por ratings** — placar rápido por força do time; só o jogo do usuário roda o engine completo |
| Estrutura de ligas | Pirâmide nacional A→B→C→D, **20 times por divisão** no MVP (~80 clubes) |
| Nomes de clubes | Reais |
| Jogadores | Fictícios, gerados por seed |
| Multiplayer / online | Fase futura, não descartado — nada é jogado fora |

## Pendências (decidir com calma)

1. Nível inicial dos elencos: todos iguais (justo) vs leve variação. Recomendação: leve variação por força do clube/divisão.
2. Estaduais e Copa do Brasil: fora do MVP, candidatos à Fase 2.
3. Expandir Série D pra 96 times: depois do MVP.
4. Múltiplos saves: depois do MVP.

## Arquitetura

```
100% no browser — site estático, sem servidor
├── Dados de ligas/clubes  → JSON gerado uma vez
├── Estado do jogo (save)  → IndexedDB
├── Simulação do SEU jogo  → engine.ts atual + replay (JÁ EXISTE)
├── Simulação das outras   → modelo rápido por ratings (NOVO, pequeno)
└── Telas de carreira       → React (NOVO)
```

### Reaproveitamento (quase tudo)
- `engine.ts`, `ai.ts`, `ratings.ts`, `constants.ts`, `rng.ts` → simulação
- `renderer.ts`, `useMatchLoop.ts`, `App.tsx` → tela de replay
- `PlayerStats.tsx`, `formation.ts` → elenco/tática

### Novo
- Gerador de elencos por seed (reaproveita `baseAttrs`)
- Modelo de simulação rápida por ratings (placar instantâneo coerente)
- Telas: meu time, tática/escalação, tabela, calendário, transferências, ofertas
- Sistema de save (IndexedDB)
- Dataset de clubes reais por divisão (JSON)

## O loop de carreira

```
Assume um time (Série D)
  → TEMPORADA: escala, define tática, joga rodada
      • SEU jogo: engine completo + replay animado
      • outros jogos: placar rápido por ratings
      • tabela atualiza
  → fim de temporada: subiu? caiu? título?
  → janela de transferências (compra/vende)
  → ofertas de clubes maiores conforme desempenho
  → próxima temporada
```

## Fases de implementação

### Fase 0 — Motor headless + gerador de elenco (destrava tudo)
- `simulateMatch(seed, casa, fora, tatica) → { placar, eventos, stats }` rodando
  o loop sem renderizar (headless), reaproveitando o `step()` atual.
- Garantir que o engine não dependa de browser/React (separar render).
- `generateSquad(seed, forca) → Player[]` reaproveitando `baseAttrs`.
- Modelo rápido `quickResult(forcaCasa, forcaFora, seed) → placar`.

### Fase 1 — Mundo do jogo (dados + estado)
- JSON com clubes reais por divisão (20 por divisão no MVP).
- Geração de tabela/calendário de uma temporada (turno e returno).
- Estado de carreira + save/load em IndexedDB.

### Fase 2 — Telas de carreira
- Meu time (elenco + atributos — já tem `PlayerStats.tsx`).
- Tática/escalação (já tem `formation.ts`).
- Tabela da liga + calendário.
- Botão "Assistir partida" → replay animado (já tem `useMatchLoop`).
- Avançar rodada → simula a rodada (híbrido) e atualiza tabela.

### --- 🚀 MVP jogável: 1 carreira, 1 pirâmide, replay ---

### Fase 3 — Profundidade
- Transferências (mercado, valores, propostas).
- Ofertas de emprego de clubes maiores.
- Promoção/rebaixamento entre divisões.
- Treino e evolução de atributos.
- Finanças do clube.

### Fase 4+ — Expansões
- Estaduais e Copa do Brasil.
- Série D com 96 times.
- Múltiplos saves.
- Modo online / multiplayer (opcional).

## Risco técnico principal

Tirar o `engine.ts` do browser e rodá-lo headless em Node (Fase 0). Se isso
funcionar, todo o resto é "encanamento" bem documentado. Por isso é o primeiro
passo quando começarmos a codar.
