# +50 melhorias de realismo (camada fina, guiada por atributos 0–100)

Esta lista é a **camada fina de realismo** que o novo sistema de atributos (0–100,
ver `atributos.md`) habilita — complementa o `melhorias.md` (features grandes) e o
`goleiro.md`. Nota = **importância para o realismo** (0–100); esforço não entra.

> ✅ **Implementado nesta rodada:** colisão bola ↔ jogador de linha (bloqueios,
> desvios e interceptações físicas, com disputa amortecer × desviar usando
> `firstTouch`/`anticipation`/`jumping`/`heading`) + atribuição de lateral por
> último toque (`lastTouchId`). Era o item #11 (nota 95) do `melhorias.md` e o
> maior buraco de realismo restante.

Quando um item repassa algo do `melhorias.md`, aqui ele aparece no nível
**atributo/coordenação** (mais fino), não como feature solta.

---

## 🏆 Top (nota ≥ 75)

| Nota | # | Melhoria | Atributos-chave |
|----:|---|----------|-----------------|
| 80 | 13 | Drible/“take-on” como duelo explícito com finta | flair, agility, dribbling × marking, tackling |
| 80 | 23 | Mentalidade por placar/tempo (atrás sobe, na frente recua) | decisions, teamwork, workRate |
| 78 | 1 | Massa/inércia no ombro a ombro (quem cede no encontrão) | strength, balance |
| 78 | 15 | Bola enfiada nas costas da defesa, mirando o espaço | vision, anticipation, offTheBall |
| 74 | 25 | Marcação por atribuição (cada um no seu homem) | marking, teamwork |
| 72 | 24 | Linha de impedimento que sobe coordenada (trap) | anticipation, decisions, teamwork |

---

## A. Físico / corpo (mecânica de duelo e fôlego)

1. **Massa no encontrão** — `separate()` hoje empurra 50/50; quem tem mais `strength`/`balance` deveria ceder menos no ombro a ombro. **78**
2. **Raio de curva limitado** — não dá pra girar 180° em velocidade máxima; `agility` define o quão fechada é a curva a cada velocidade. **60**
3. **Fadiga progressiva no físico** — `energy` baixa reduz `pace`/`acceleration` (não só erro), de forma composta no fim do jogo. **70**
4. **Pernas pesadas** — `naturalFitness`/`concentration` baixos aumentam erro e lentidão tardia. **62**
5. **Sprint econômico** — só arranca quando vale a pena (`workRate`/`decisions`), poupando fôlego; hoje todos vão no talo. **66**
6. **Orientação corporal (facing)** — receber/girar de costas custa frações de segundo; passe pro lado errado sai mais lento. **64**
7. **Proteção de bola com o corpo** — `strength`+`balance` blindam a posse de costas para o marcador. **68**
8. **Dividida 50/50 no chão** — bola solta disputada por `strength`+`bravery`+`aggression`, não só pelo mais perto. **66**
9. **Lesão por excesso/carrinho** — risco conforme `bravery`/`aggression`/`strength`; tira o jogador. **55**
10. **Cãibra/queda de rendimento** após picos de esforço (gestão de `naturalFitness`). **40**

## B. Técnico (passe, drible, chute)

11. **Pé não-dominante** — pior fora do pé bom (derivar de `technique`/`flair` ou novo atributo). **58**
12. **Finalização de primeira** menos precisa que a bola dominada. **64**
13. **Take-on / drible no 1v1** como duelo explícito com fintas: `flair`/`agility`/`dribbling` × `marking`/`tackling` (hoje a posse é só probabilidade no bote). **80**
14. **Potência × colocação** — `finishing`/`composure` escolhem chute colocado (preciso, fraco) vs. forte (rápido, impreciso). **66**
15. **Bola enfiada** nas costas da linha, mirando o ESPAÇO livre, não os pés (`vision`/`anticipation`/`offTheBall`). **78**
16. **Cavadinha/lob** quando o GK está adiantado (`decisions`/`technique`/`composure`). **70**
17. **Peso do passe** (curto/forte demais) por `technique`/`composure`. **58**
18. **Curva direcionada** — `flair` MIRA a curva (contorna barreira/GK), em vez do efeito aleatório atual. **64**
19. **Tipos de cruzamento** (rasteiro/tenso/alçado) por `crossing` + escolha de alvo. **60**
20. **Domínio orientado** — `firstTouch` já direciona o primeiro toque para a próxima ação. **56**
21. **Repique / segunda bola** após dividida cai para quem tem `anticipation`/`positioning`. **60**
22. **Improviso (calcanhar/letra)** — raro e arriscado, escalado por `flair`. **35**

## C. Tática coletiva (sem e com a bola)

23. **Mentalidade dinâmica** — o time sobe quando está atrás e recua segurando o resultado no fim, conforme placar/tempo. **80**
24. **Trap de impedimento coordenado** — a linha sobe junta para deixar o atacante impedido (`anticipation`/`teamwork`/`decisions`). **72**
25. **Marcação por atribuição** — cada zagueiro pega um homem fixo, não o mais próximo (`marking`/`teamwork`). **74**
26. **Equilíbrio defensivo** — sempre sobra alguém de cobertura ao subir o time. **70**
27. **Largura/estreiteza** — pontas abrem no ataque; bloco fecha na defesa. **66**
28. **Corridas diagonais cronometradas** ao passe (`offTheBall` + timing do passador). **70**
29. **Counter-press** nos primeiros segundos após perder a bola (`workRate`). **68**
30. **Recomposição** — quem perde a bola corre de volta (`workRate`/`pace`). **66**
31. **Compactação vertical** entre defesa-meio-ataque (não só lateral). **64**
32. **Jogo de pivô** — atacante de `strength`/`firstTouch` segura de costas e tabela. **55**
33. **Falta tática** para cortar contra-ataque (`aggression`/`decisions`) com risco de cartão. **50**
34. **Bloco baixo/médio/alto** conforme a força relativa dos times. **58**
35. **Troca posicional coberta** (overlap/underlap) sem deixar buraco. **52**
36. **Sombra de cobertura** no pressing (cobrir a linha de passe enquanto pressiona). **62**

## D. Goleiro e área (refino do que já existe)

37. **Disputa aérea no cruzamento** — GK sai para socar/encaixar (`aerialReach`/`handling`/`bravery`) disputando com atacantes. **70**
38. **Regra do recuo (back-pass)** — GK não pega com a mão recuo de pé do companheiro. **38**

## E. Regras e fluxo (finos, novos)

39. **Acréscimos** somando tempo perdido (faltas/gols/comemoração). **66**
40. **Impedimento marcado de verdade** — apito + reinício, não só teto de posição. **70**
41. **Lei da vantagem** — segura a falta se o time segue em vantagem. **52**
42. **Falta indireta / barreira** posicionada conforme a distância ao gol. **55**

## F. Estado do jogador entre lances/partidas

43. **Forma/moral** modulando `consistency`/`composure` na partida. **48**
44. **Confiança (hot streak)** cresce com gols/defesas e some com erros. **38**
45. **Condição física de calendário** — quem joga seguido cansa mais (`naturalFitness`). **36**

## G. Ambiente, contexto e calibração

46. **Clima/gramado** afetando atrito da bola e gasto de fôlego. **50**
47. **Fator casa** — leve bônus de `composure`/`workRate` ao mandante. **40**
48. **Árbitro com rigor variável** — limiar de cartão/vantagem muda por partida. **42**
49. **Narração rica por contexto/atributo** (golaço, doblete, virada) — já em construção. **45**
50. **Telemetria de realismo** — xG, mapa de calor, % de passes certos — para CALIBRAR os atributos com dados. **58**

---

## Veredito: vale a pena?

- **Vale muito (≥70):** 1, 3, 13, 15, 23, 24, 25, 26, 28, 37, 40, 16 — são o que separa "bonecos
  seguindo a bola" de "time jogando". A maioria reaproveita atributos JÁ existentes,
  então é baixo custo de dados e alto ganho.
- **Vale (50–68):** refinos de duelo, técnica e bloco — entram aos poucos, calibrando.
- **Polimento (<50):** moral, clima, árbitro, improviso — charme, não realismo essencial.

**Ordem sugerida:** 1 (massa no duelo) → 13 (take-on) → 25/24/26 (marcação+linha+cobertura)
→ 15/28 (enfiada + corrida) → 23 (mentalidade) → 37 (cruzamento aéreo). Essa sequência
ataca primeiro os duelos e a organização, que é onde o olho mais percebe falta de realismo
agora que a bola já colide com os corpos.
