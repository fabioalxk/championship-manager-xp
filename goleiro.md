# 50 pontos para melhorar o goleiro

Documento de melhorias para a movimentação, colisão, atributos e desempenho do goleiro
no simulador. Cada item aponta o arquivo/função afetado para facilitar a implementação.

Estado atual (resumo):
- **Movimentação:** `desiredTarget` em `src/sim/ai.ts:75` — fica na reta bola→gol, sai no máx. 6m, preso a ~8m × ±9m.
- **Defesa:** `tryGainLoose` em `src/sim/engine.ts:277` — UMA tentativa, `saveProb` depende só de `goalkeeping`.
- **Distribuição:** `decideAction` em `src/sim/ai.ts:115`.
- **Atributos:** `Attrs` em `src/sim/types.ts:14` só tem `goalkeeping` como específico de GK.

---

## A. Atributos do goleiro (modelagem)

1. **Separar atributos de GK dos de linha.** Hoje o goleiro reaproveita `pace`, `passing` etc. de jogador de linha. Criar um bloco específico em `Attrs` (ou um `GkAttrs` opcional) para não misturar escalas.
2. **`reflexes` (reflexos).** Atributo dedicado para defesas de reação curta (chutes próximos/desviados), separado de `goalkeeping` genérico.
3. **`handling` (segurança nas mãos).** Define a chance de a bola "grudar" (defesa segura) vs. dar rebote. Hoje toda defesa é segura.
4. **`positioning` de GK.** Já existe `positioning` genérico — usar (ou um campo próprio) para o quão bem o goleiro fica na reta bola→gol antes do chute.
5. **`aerialReach` (jogo aéreo / saída de cruzamento).** Alcance e confiança para sair em bolas altas; afeta `gkReach` em bolas aéreas.
6. **`oneOnOne` (saída de frente).** Habilidade específica em situações de 1v1 (item da seção D).
7. **`kicking` / `throwing` (distribuição).** Hoje o passe do GK usa `passSpeed`/`passSpread` de linha. Separar tiro de meta longo (kicking) do lançamento de mão curto (throwing).
8. **`communication` (organização).** Atributo "passivo" que melhora o posicionamento da linha de defesa (afeta `homePos` dos zagueiros quando perto da área).
9. **`composure` (frieza).** Reduz erros sob pressão (passe errado / domínio ruim quando há atacante perto).
10. **`agility` e `acceleration` próprios.** O GK precisa de arranque curto e mudança de direção, distinto da velocidade de corrida longa (`pace`) usada hoje em `maxSpeed`.
11. **Função de "rating geral" do GK.** Combinar os atributos acima numa nota só para comparar goleiros / mostrar na UI, isolando-a do cálculo de jogador de linha (respeitando DRY: uma função utilitária em `ratings.ts`).
12. **Decaimento por idade/forma (futuro).** Deixar os atributos de GK passíveis de modificadores (lesão, moral) sem reescrever a engine.

---

## B. Cálculo da defesa (probabilidade)

13. **`saveProb` usar mais que `goalkeeping`.** Em `engine.ts:289` a defesa depende só de `goalkeeping`. Combinar `reflexes`, `positioning` e `agility` com pesos.
14. **Penalizar ângulo do chute.** Chute no canto (longe do centro do gol em Y) deve ser mais difícil de defender que chute no meio. Hoje só a velocidade conta.
15. **Penalizar distância/tempo de reação.** Chute de perto (dentro da área) dá menos tempo de reação → menor `saveProb`. Usar a distância chute→GK no instante do chute.
16. **Bônus por estar bem posicionado.** Se o GK já estava na reta bola→gol (ângulo fechado), aumentar `saveProb`; se foi pego adiantado/de lado, reduzir.
17. **Defesa parcial / rebote.** Quando a defesa "falha" mas por pouco (item 13 perto do limiar), em vez de virar gol, gerar **rebote** (a bola muda de direção e fica viva) conforme `handling`.
18. **Soltar rebote vs. segurar.** `handling` decide se a defesa vira posse segura ou bola solta na área (cria segunda chance para o atacante). Hoje toda defesa vira posse.
19. **Defesa para escanteio.** Defesa difícil pode mandar a bola para a linha de fundo (item de bolas paradas) em vez de sempre segurar.
20. **Mais de uma tentativa em sequência.** Hoje, ao falhar, o GK fica bloqueado (`kickCooldown`) até a bola passar (`engine.ts:301`). Permitir uma 2ª tentativa em rebote próximo conforme `reflexes`.
21. **Chutes fracos/lentos não deveriam ser "defesa".** Em `engine.ts:280` bola ≤12 vira domínio automático — ok, mas registrar como defesa só quando há real intenção de gol (evita inflar `shotsOnTarget`).
22. **Fadiga afeta a defesa.** `energy` do GK deveria reduzir levemente `saveProb` no fim do jogo (consistente com `STAMINA`).
23. **Cap superior realista.** Manter um teto de `saveProb` (<1.0) mesmo para goleiro 20/20, para não tornar o gol impossível (já há clamp em 0.95 — revisar valor).
24. **Erro grosseiro raro ("frango").** Pequena chance de falha boba em chute fácil, escalada inversamente por `composure`/`handling` — dá imprevisibilidade ao jogo.

---

## C. Movimentação e posicionamento

25. **Velocidade de movimento do GK usar atributos próprios.** Em `advancePlayer`/`steer` o GK usa `maxSpeed(p)` (baseado em `pace`). Trocar por `agility`/`acceleration` para reações curtas dentro da área.
26. **Sair mais agressivo conforme `oneOnOne`.** O `comeOut` em `ai.ts:80` é fixo (0.16 × dist, clamp 1.3–6). Escalar pelo atributo: goleiro tipo "líbero" sai mais.
27. **Recuar para a linha em chute iminente.** Quando o atacante está em posição de finalização e perto, o GK deveria parar de avançar e segurar a linha para reagir (reduz ser "cavado").
28. **Antecipação pela velocidade da bola.** O alvo do GK poderia considerar `ball.vel` (para onde a bola vai), não só a posição atual — melhora cobertura de passe lateral.
29. **Cobrir o ângulo curto vs. longo.** Em chute de fora da área, o GK deve proteger mais o canto longo; ajustar o ponto-alvo em Y conforme a posição X/Y da bola.
30. **Limites da pequena área parametrizados.** Os clamps `xLo/xHi` e `±9` em `ai.ts:82-84` estão hardcoded. Mover para `constants.ts` (ex.: `GK.boxDepth`, `GK.lateralRange`) — facilita tuning e respeita DRY.
31. **Movimento lateral mais ágil que frontal.** Goleiro se desloca rápido na linha (lado a lado) e mais devagar saindo de frente; modelar anisotropia no `steer` do GK.
32. **"Voltar para casa" pós-defesa.** Depois de defender/distribuir, o GK deve retornar suavemente ao centro do gol, não ficar parado onde a jogada terminou.
33. **Posicionamento em bola parada do adversário.** Em falta/escanteio contra, o GK deve se posicionar (ex.: cobrir o 1º pau), hoje só segue a reta bola→gol.
34. **Não sair em situação sem perigo.** Quando a bola está no campo de ataque, o GK pode adiantar bem (sweeper-keeper conforme atributo) em vez de colar no gol.
35. **Suavização sem "tremer".** Garantir que a zona morta (`MOVE.deadzone`) do GK seja adequada para que ele não vibre na linha quando a bola oscila perto da área.
36. **Reação ao desvio/deflexão.** Se a bola muda de direção bruscamente (item rebote), o alvo do GK deve recalcular imediatamente (menor inércia para o GK).

---

## D. Colisão e física

37. **Goleiro com raio/colisão própria.** `PHYS.playerRadius` é igual para todos (`engine.ts:156` `separate`). Dar ao GK um raio/alcance de corpo um pouco maior em bolas aéreas/divididas.
38. **`gkReach` dinâmico.** Hoje `gkReach: 3.2` é constante (`constants.ts:40`). Escalar por `reflexes`/`agility` e diferenciar rasteiro vs. aéreo.
39. **"Mergulho" com alcance estendido.** Em chute para o canto, permitir que o `reachOf(GK)` em `engine.ts:184` se estenda momentaneamente na direção da bola (modela o esticão/voo).
40. **GK não ser empurrado para fora do gol.** No `separate`, o GK em disputa não deveria ser deslocado para dentro do próprio gol; tratá-lo como "fixo" como o `controllerId`.
41. **Colisão GK × atacante (carga).** Choque do atacante no GK pode ser falta a favor da defesa (regra do goleiro), gerando bola parada — usar `aggression` do atacante.
42. **Bola não atravessar o corpo do GK.** Garantir que, ao falhar a defesa, a bola realmente passe pela posição (e que uma defesa pare a bola na posição do GK), evitando "fantasma".
43. **Domínio com o corpo após defesa.** Após segurar, a bola gruda na posição do GK (como o conduto em `engine.ts:462`) — verificar `tackleCooldown` protegido para distribuir.
44. **Colisão com a trave (futuro).** Hoje só há `inMouth` para gol (`engine.ts:317`). Tratar trave (bola rebate) interage com a defesa — o GK poderia se beneficiar de rebote na trave.

---

## E. Distribuição (saída de bola)

45. **GK usar atributos próprios de passe.** Em `ai.ts:124` ele usa `passSpeed/passSpread` de linha. Trocar por `kicking` (tiro de meta longo) e `throwing` (lançamento curto e seguro).
46. **Escolher curto vs. longo conforme pressão e visão.** Sob pressão alta, lançar longe (chutão); sem pressão, sair jogando curto no zagueiro livre — escalar pela `composure`/`vision`.
47. **Erro de saída sob pressão.** `composure` baixa + atacante perto → chance de passe ruim/atrasado (interceptável), dando perigo ao jogo.
48. **Tempo de "segurar a bola" do GK.** O GK pode segurar um pouco antes de distribuir (queimar tempo / esperar opção) conforme a situação do placar — hoje distribui imediato.
49. **Tiro de meta vs. jogo com os pés.** Diferenciar bola que saiu para tiro de meta (reposição longa) de recuo dos zagueiros (jogo com os pés curto) — afeta alvo e velocidade.

---

## F. Balanceamento, telemetria e testes

50. **Telemetria + tuning iterativo.** Expor stats do GK (defesas, gols sofridos, % de defesa, rebotes, erros) e centralizar TODAS as constantes do goleiro num bloco `GK` em `constants.ts`, para calibrar até as taxas baterem com o futebol real (ex.: ~70% de aproveitamento de defesa) sem caçar números espalhados pelo código.
