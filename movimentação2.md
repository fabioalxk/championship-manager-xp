# Movimentação 2 — 50 Técnicas de Implementação para Movimento Suave e Realista

> Complemento **técnico** do `movimentacao.md` (que lista os fatores conceituais).
> Aqui o foco é *como* deixar o movimento fluido na prática, ancorado no código atual:
> `src/sim/engine.ts` (`steer`, `advancePlayer`, física da bola), `src/sim/ai.ts`,
> `src/useMatchLoop.ts` (loop de passo fixo) e `src/render/renderer.ts`.

---

## 1. Loop, Timestep e Interpolação (a base de tudo)

1. **Interpolação de render (estado anterior → atual)** — hoje o `drawMatch` usa a posição "crua" do último passo físico. Guarde `prevPos`/`prevBall` e desenhe `lerp(prev, cur, alpha)` com `alpha = acc / PHYS.dt`. É o ganho de suavidade mais barato e mais visível (elimina o "stepping" a 60 fps com física a 60 Hz).
2. **Expor o `alpha` do acumulador** — em `useMatchLoop` o `acc` restante após o `while` é exatamente o fator de interpolação; passe-o ao `drawMatch`.
3. **Desacoplar taxa de física da taxa de tela** — manter `PHYS.dt` fixo (já existe) mas renderizar sempre no `requestAnimationFrame`, interpolando. Permite física estável em 60 Hz e tela suave em 120 Hz/144 Hz.
4. **Clampar o "spiral of death"** — já há `steps < 16`; ao estourar, descartar o tempo acumulado (`acc = 0`) em vez de acumular dívida, evitando travadas em abas que voltam do background.
5. **Render por estado imutável p/ interpolar** — como `Vec2` já é puro, snapshotar `{pos, vel}` por jogador antes do `step` é barato e habilita itens 1–2.
6. **Suavizar a câmera/zoom (se houver)** — qualquer pan/zoom deve seguir um alvo com *critically damped spring*, nunca pular para o valor final.
7. **Separar `clockRate` (relógio) de `speed` (velocidade de simulação)** — hoje `speed` multiplica o `dt` real e `clockRate` acelera o relógio; documentar/garantir que mudar a velocidade não altere o *comportamento* físico (mesmos `dt` discretos), só a frequência de passos.
8. **Sub-stepping da bola em chutes fortes** — bola a 25+ m/s pode "atravessar" trave/jogador num `dt`. Faça swept-collision ou 2–4 sub-passos só para a bola quando `len(ball.vel) * dt > raio`.

## 2. Suavização do Steering do Jogador (`steer`)

9. **Slew-rate na direção (limite de giro angular)** — em vez de só frear na curva (`turnFloor`), limite a *variação de ângulo* da velocidade por segundo (ex.: `maxTurnRate` rad/s) — modela raio de curva real e mata viradas instantâneas.
10. **Raio de curva proporcional à velocidade** — `maxTurnRate` deve cair quando `len(vel)` sobe; correndo, o jogador descreve um arco aberto; parado, gira no eixo.
11. **Velocidade desejada suavizada (low-pass)** — filtrar `desired` com `desired = lerp(desiredPrev, desiredNew, k*dt)` evita que mudanças de alvo da IA causem trancos.
12. **Arrive behavior com rampa quadrática** — a rampa atual é linear (`(d-dz)/2`); uma curva de desaceleração baseada em `v²=2·a·d` (distância de frenagem física) chega ao alvo sem overshoot nem freada brusca.
13. **Steering por aceleração, nunca por teleporte de velocidade** — manter o padrão atual (`dv = limit(...)`) em todos os caminhos, inclusive condução e goleiro, para que nada "pule" de velocidade.
14. **Zona morta com histerese** — usar dois limiares (entra a `dz`, só volta a corrigir além de `dz*1.6`) para o jogador não ficar ligando/desligando a correção e "tremendo" na borda.
15. **Suavizar a saída da zona morta** — ao reentrar em movimento depois de parado, reusar a rampa de aceleração (já existe via `accel`) para não dar um "tranco" inicial.
16. **Damping dependente de `dt` correto** — os `Math.pow(0.05, dt)` e `Math.pow(0.03, dt)` já são frame-rate independent; padronizar todo amortecimento nesse formato (evita comportamento diferente em `speed` alto).
17. **Ruído de movimento coerente (não por-frame)** — o `withNoise` é aplicado só na decisão; para micro-movimentos humanos use *value noise* temporal (ex.: ruído suave por jogador via seed) em vez de `Math.random()` a cada frame, que treme.
18. **Pé de apoio / micro-ajuste final** — perto do alvo, em vez de zerar, permitir passos curtos de reposicionamento (≤0.5 m) com velocidade baixíssima, simulando ajuste de corpo.
19. **Antecipação no alvo do perseguidor** — `desiredTarget` já usa `ball.pos + ball.vel*0.16`; escalar esse lead pela velocidade da bola e pela `reactions` do jogador deixa a interceptação natural (curva de corrida, não "perseguição de cachorro").
20. **Limitar jerk (derivada da aceleração)** — opcional/avançado: suavizar a *mudança* de aceleração evita os "soquinhos" quando o alvo muda de quadrante.

## 3. Stamina, Inércia e Atributos no Movimento

21. **`energy` realmente afetando `maxSpeed`/`accel`** — `energy` é drenada mas pouco usada no movimento; multiplicar `effMax` e `playerAccel` por `f(energy)` faz o time "pesar" no fim do jogo de forma contínua.
22. **Aceleração assimétrica (acelerar ≠ frear)** — frenagem pode ser mais forte que arranque; modela melhor a física do corpo e dá mais peso.
23. **Momentum na recepção** — ao dominar a bola (`tryGainLoose`), herdar parte da velocidade atual em vez de manter o vetor; evita "colar" e parar de forma robótica.
24. **Massa/força no `jostling`** — no contato corpo-a-corpo, deslocamento proporcional a `strength`; hoje não há separação física entre jogadores (ver item 30).
25. **Curva de velocidade não-linear por atributo** — `maxSpeed` linear no `pace` é ok; uma curva levemente sigmoide diferencia melhor o ponta-rápido do zagueiro sem deixar todos iguais.
26. **Tempo de reação como atraso real** — inserir um pequeno *delay* (buffer) entre a mudança de alvo da IA e a resposta do steering, escalado por `reactions`, em vez de resposta instantânea.
27. **Fadiga afetando a qualidade do steering** — `turnFloor`/`maxTurnRate` piorando com `energy` baixa: cansado vira pior e freia pior.
28. **Recuperação de fôlego ao trotar** — modular o dreno de `energy` por intensidade real (`len(vel)/maxSpeed`), recuperando quando anda devagar; hoje o dreno é quase constante.

## 4. Física da Bola

29. **Rolagem vs. quique (estado da bola)** — separar bola no chão (damping de rolamento alto) de bola "no ar" (parábola com gravidade); hoje só há damping 2D linear.
30. **Atrito de rolamento realista** — `ballDamping = 0.5/s` é bem forte; calibrar para a bola correr mais e desacelerar com curva mais suave (rolling resistance), deixando passes longos viáveis.
31. **Efeito/curva (Magnus) simplificado** — adicionar uma componente lateral pequena à `ball.vel` para cruzamentos e chutes com curva; aumenta muito o realismo visual.
32. **Spin visual da bola** — desenhar rotação (um detalhe/gomos girando) proporcional à velocidade; barato no `drawBall` e vende muito a sensação de movimento.
33. **Quique nas traves com restituição** — colisão com poste devolve a bola com coeficiente de restituição, não apenas linha de fundo; hoje a trave não interage com a bola em campo.
34. **Transição suave de condução → passe** — ao liberar a bola, somar a velocidade do conduto à do passe (a bola já vinha andando), em vez de zerar e impor só a velocidade do passe.
35. **Knuckleball/imprecisão na bola, não só no alvo** — além do `withNoise` no alvo, pequena variação na *velocidade* dá vida a chutes e passes.
36. **Bola presa ao pé com mola, não rígida** — hoje `ball.pos = carrier.pos + facing*off` é rígido; uma leve defasagem elástica (a bola "persegue" o pé) tira o aspecto grudado.
37. **Reposicionamento suave em bola parada** — em `deadball`, a bola "salta" para `taker.pos`; interpolar a colocação evita o teleporte visível.

## 5. Colisão, Separação e Pathfinding

38. **Separação (boids) entre jogadores** — não há repulsão; somar uma força de *separation* (afasta de vizinhos < ~1.5 m) ao steering evita sobreposição e amontoamento sem detecção rígida.
39. **Resolução de colisão por impulso suave** — ao invés de bloquear, empurrar os dois corpos proporcional à penetração e à `strength`, distribuído em alguns frames (sem "pop").
40. **Desvio de obstáculo (steering)** — adicionar um termo de *obstacle avoidance* à direção desejada faz o jogador contornar adversários em curva, em vez de tentar atravessá-los.
41. **Anti-jitter em alvos disputados** — quando dois colegas miram o mesmo ponto (ex.: bola solta), atribuir o alvo a um só (já há `nearestOfTeam`) e dar offsets de apoio aos demais, evitando tremor coletivo.
42. **Campos de evasão para a linha de impedimento/marcação** — usar gradientes de posição (potential fields) para subir a linha de defesa de forma coesa e suave.

## 6. Polimento Visual (`renderer.ts`)

43. **Orientação/heading do jogador** — desenhar uma indicação de para onde olha (a partir de `norm(vel)`), girando suavemente; hoje o "botão" é um círculo sem direção.
44. **Rastro/trilha sutil de velocidade** — leve motion trail proporcional a `len(vel)` reforça a percepção de movimento e mascara o stepping.
45. **Sombra dos jogadores e da bola** — uma sombra elíptica simples dá profundidade e ancora o movimento ao gramado.
46. **Animação de passada (bob)** — oscilar o raio/posição do marcador em fase com a velocidade evita o "foot sliding" da animação (mesmo sem sprites).
47. **Transição suave do estado "caído"** — interpolar entre círculo e elipse (`down`) ao longo de ~0.2 s em vez de trocar de forma instantaneamente.
48. **Realce do `controller` com fade** — o anel amarelo aparece/some de repente ao trocar de posse; um fade de alpha curto suaviza a leitura.

## 7. Estabilidade Numérica e Determinismo

49. **Determinismo via RNG semeado** — trocar `Math.random()` (em `withNoise`, duelos, faltas) por um PRNG com seed permite repetir partidas, depurar movimento e fazer replays — e habilita interpolação consistente.
50. **Clamps e dt fixo como contrato** — manter *todo* o avanço de estado em passos de `PHYS.dt` fixos (nunca usar `dtReal` na física), com clamps de posição/velocidade centralizados, é o que garante que a suavização (itens 1–20) seja estável em qualquer velocidade de jogo.

---

### Prioridade sugerida (maior impacto / menor esforço)
1. **#1–2 Interpolação de render** — transforma a fluidez imediatamente, ~30 linhas.
2. **#9–10 Slew-rate de giro** — acaba com viradas instantâneas no `steer`.
3. **#21 + #27 Stamina no movimento** — dá peso e progressão à partida.
4. **#30–31 Calibrar bola + Magnus** — passes e chutes ganham vida.
5. **#38 Separação entre jogadores** — elimina sobreposição com poucas linhas.

### Princípio-guia
> **Decisão (IA: para onde) → Velocidade desejada → Restrições (aceleração, giro, inércia) → Integração de passo fixo → Interpolação no render.**
> Nenhum valor visível ao jogador deve mudar em degrau: posição, velocidade, direção e alpha sempre transitam ao longo do tempo.
