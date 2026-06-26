# +50 melhorias de REGRAS e FLUXO da partida

Esta lista é a camada de **regras do jogo e fluxo da partida** — o que faz a
simulação "obedecer às Leis do Futebol" em vez de só mover bonecos atrás da
bola. Complementa o `melhorias.md` (features grandes) e o `melhorias2.md`
(realismo fino por atributos). Nota = **importância para o realismo** (0–100).

> 🚫 **Diretriz visual (fixa):** o gramado **não exibe árbitro nem bandeirinhas
> (assistentes) visíveis** — nada de "oficiais" desenhados em campo. As regras de
> arbitragem (impedimento, faltas, cartões, etc.) seguem valendo na simulação,
> mas **sem nenhuma representação gráfica** de juiz ou auxiliar.

> ✅ **Já implementado** (rodadas recentes):
> - **#1 Saída de bola (Lei 8)** — pontapé inicial e recomeço pós-gol com os dois
>   times no seu campo, adversário fora do círculo central e DOIS jogadores do
>   time da saída sobre a bola; 1º tempo um time, 2º tempo o outro.
> - **#2 Tiro de meta (Lei 16)** — bola na área, adversário fora da grande área e
>   o goleiro distribui (chutão/saída curta), com reestruturação do time.
> - **#3 Pênalti (Lei 14)** — falta da defesa dentro da própria área vira cobrança
>   da marca: batedor (melhor finalizador), goleiro na linha e os demais fora da
>   área até o chute.
> - **#4 Cartões e expulsão (Lei 12)** — amarelo, 2º amarelo → vermelho e vermelho
>   direto (falta grave); o expulso some do campo e o time segue com um a menos.
> - **#5 Lei da vantagem (Lei 5)** — falta no ataque com posse mantida: o árbitro
>   deixa seguir em vez de marcar.
> - **#6 Mãos do goleiro só na própria área (Lei 12)** — fora da área o GK é
>   jogador de linha (controla com os pés, sem pegar com a mão).
> - **#7 Acréscimos (Lei 7)** — tempo perdido com gols, faltas e cartões é somado e
>   devolvido ao fim de cada tempo (mostrado como "+N" no relógio).
> - **#9 Tiro livre + barreira (Lei 13)** — a falta fora da área vira COBRANÇA de
>   verdade: a jogada congela para todos se posicionarem, a defesa arma a BARREIRA
>   a 9,15 m na linha bola→gol nas faltas perigosas, e o cobrador decide conforme a
>   posição — bate DIRETO ao gol (perto/ângulo), LANÇA na área (avançado/fechado)
>   ou recompõe com um passe (longe). Nem todo atordoamento é falta: o desarme
>   LIMPO só faz tropeçar (sem apito); só o bote que erra a bola e derruba é falta.
>   O CHUTE DIRETO é COLOCADO por cima da barreira (no canto oposto ao 1º pau, que
>   fica pro goleiro): a barreira tapa o poste e bloqueia rasteiro, mas não cabeceia
>   o petardo enquadrado — esse é do goleiro, que defende bem (bola parada, postado).
>   Conversão calibrada na faixa REAL via `tools/freekick-sim.ts`: ~7% para bons
>   batedores, ~5% no geral, com pico na zona de 22-26 m (cai perto demais/longe).

---

## 🏆 Top (nota ≥ 75)

| Nota | # | Melhoria | Lei / tema |
|----:|---|----------|-----------|
| 92 | 3 | Pênalti em falta na área ✅ | Lei 14 |
| 90 | 1 | Saída de bola correta ✅ | Lei 8 |
| 86 | 4 | Cartões + expulsão (10 em campo) ✅ | Lei 12 |
| 82 | 2 | Tiro de meta com área respeitada ✅ | Lei 16 |
| 80 | 8 | Impedimento APITADO (não só teto de posição) | Lei 11 |
| 78 | 7 | Acréscimos ✅ | Lei 7 |
| 76 | 9 | Barreira no tiro livre (9,15 m) ✅ | Lei 13 |
| 75 | 5 | Lei da vantagem ✅ | Lei 5 |

---

## A. Bola parada e reinícios (Leis 8, 13–17)

1. **Saída de bola correta** — dois jogadores no círculo, times no seu campo. **90** ✅
2. **Tiro de meta com área** — bola na área, adversário fora. **82** ✅
8. **Impedimento apitado** — apito + tiro livre indireto quando o atacante recebe
   à frente do penúltimo defensor; hoje só há um teto suave de posição. **80**
9. **Barreira no tiro livre** — 2–3 defensores a 9,15 m, na linha bola→gol, nas
   faltas perigosas. **76** ✅
10. **Distância de 9,15 m no escanteio e na falta** — adversário recua o
    regulamentar antes da cobrança (hoje recua à formação). **58**
11. **Arremesso lateral com as duas mãos / pés no chão** — reposição só com a mão;
    chute longo de lateral conforme `throwing`/`strength`. **48**
12. **Dois toques proibido** — o cobrador (pênalti, lateral, falta) não pode tocar
    de novo antes de outro jogador. **50**
13. **Bola tem de sair da área no tiro de meta** antes de outro tocar. **40**
14. **Cobrança rápida de falta** — quem está com pressa cobra antes de a barreira
    se formar (decisão por `decisions`/`composure`). **55**
15. **Falta indireta vs direta** — gol direto só vale na direta; a indireta exige
    desvio. **45**

## B. Faltas, cartões e disciplina (Leis 5, 12)

3. **Pênalti em falta na área** — cobrança da marca. **92** ✅
4. **Cartões e expulsão** — amarelo/2º amarelo/vermelho; joga com um a menos. **86** ✅
5. **Lei da vantagem** — segue se há vantagem. **75** ✅
16. **Reorganização com um a menos** — quem fica com 10 recua a linha e fecha o
    bloco (não dá pra marcar todo mundo). **72**
17. **Pênalti perdido → segue o jogo** (rebote na trave/defesa já é bola viva). **60**
18. **Falta tática (impedir o contra-ataque)** — defensor decide cometer a falta
    para parar a transição, sabendo do risco de cartão. **58**
19. **Acúmulo de faltas e "marcação" do árbitro** — quem já tem amarelo entra mais
    leve nos botes (`decisions`). **52**
20. **Simulação / cera** — perto do fim, o time na frente segura mais a bola e
    "ganha tempo" (cai a intensidade). **48**

## C. Impedimento (Lei 11)

8. **Impedimento apitado de verdade** (acima). **80**
21. **Linha de impedimento coordenada (trap)** — a defesa sobe junta para deixar o
    atacante impedido. **72**
22. **Sem impedimento em lateral, escanteio e tiro de meta** — exceções da regra. **55**
23. **Impedimento no momento do passe, não da recepção** — congelar a posição
    relativa no instante do toque do passador. **64**
24. **Posição passiva vs ativa** — só pune quem interfere na jogada. **50**

## D. Tempo e fluxo (Leis 7, 10)

7. **Acréscimos** — devolve o tempo perdido. **78** ✅
25. **Apito final só com a bola "morta"** — não encerra no meio de um ataque claro;
    espera a bola sair ou a jogada acabar. **58**
26. **Prorrogação e disputa de pênaltis** — para mata-mata (fora do amistoso atual). **45**
27. **Intervalo com troca de bola/parada visível** entre os tempos. **30**
28. **Relógio que conta o tempo extra ("45+2")** no placar. **40** (parcial ✅: mostra "+N")
29. **Gol no último lance dos acréscimos** — a jogada em andamento termina antes do
    apito. **50**

## E. Goleiro e área (Leis 12, 16)

6. **Mãos só na própria área** — fora dela é jogador de linha. **70** ✅
30. **Regra do recuo (back-pass)** — o GK não pega com a mão um passe de pé do
    companheiro → tiro livre indireto na área. **62**
31. **Regra dos 6 segundos** — o GK não segura a bola na mão além do limite. **42**
32. **Disputa aérea do GK no cruzamento** — sai para socar/encaixar disputando com
    atacantes (`aerialReach`/`bravery`). **70**
33. **Carga legal vs falta no goleiro** — refinar quando a carga é falta. **40**

## F. Bola dentro/fora e gol (Leis 9, 10)

34. **Bola só fora quando cruza inteira a linha** (raio da bola), não o centro. **56**
35. **Gol só quando a bola cruza inteira a linha do gol** — idem (goal-line). **58**
36. **Quique/efeito ao sair pela lateral** — bola com curva pode voltar (não sai). **38**
37. **Desvio em jogador altera quem repõe** — já tratado por `lastTouchId`; estender
    a deflexões na trave/corpo perto da linha. **44**

## G. Substituições, elenco e estado (Leis 3)

38. **Substituições** — troca por cansaço/cartão/lesão (exige banco de reservas). **66**
39. **Lesões que param o jogo** — atendimento, bola para fora, jogador sai. **52**
40. **Limite de 5 trocas em 3 janelas** — regra moderna. **35**
41. **Capitão / cobradores designados** — quem bate falta, pênalti, escanteio. **48**
42. **Numeração e titularidade fixas** por partida (já há nº; faltam reservas). **30**

## H. Arbitragem e contexto (Lei 5, 6)

43. **Árbitro com rigor variável** — limiar de cartão/vantagem muda por partida. **50**
44. **VAR / revisão de lance** — checagem de gol/pênalti/impedimento/expulsão. **40**
45. **Assistentes (bandeirinhas)** marcando impedimento e bola fora. **38**
46. **Tempo de bola em jogo / efetivo** como telemetria. **36**

## I. Estrutura de competição (fora do amistoso atual)

47. **Pontos corridos / tabela** (vitória 3, empate 1). **40**
48. **Critérios de desempate** (saldo, confronto direto). **30**
49. **Cartões suspendem para a próxima partida** (acúmulo entre jogos). **34**
50. **Mando de campo / fator casa** — leve bônus ao mandante. **38**

---

## Veredito: vale a pena?

- **Implementado nesta leva (≥70 e auto-contido):** pênalti (#3), cartões/expulsão
  (#4), vantagem (#5), mãos do GK só na área (#6) e acréscimos (#7). Somados à saída
  de bola (#1) e ao tiro de meta (#2) já feitos, cobrem as Leis que o olho mais
  percebe: como o jogo começa, recomeça, pune e termina.
- **Próximos de maior valor (não feitos):** **impedimento apitado (#8, 80)** e
  **barreira no tiro livre (#9, 76)** — são os maiores buracos de regra restantes,
  mas exigem cuidado: o impedimento precisa ser medido no instante do passe (risco
  de marcação errada e jogo "travado"), e a barreira mexe no posicionamento de
  vários jogadores na bola parada. Ficam como a próxima leva natural.
- **Bom (50–68):** back-pass (#30), aérea do GK no cruzamento (#32), trap de
  impedimento (#21), reorganização com um a menos (#16), falta tática (#18),
  apito final com bola morta (#25), bola/gol pela linha inteira (#34/#35).
- **Estrutural / depende de elenco e competição (<50 ou exige banco/torneio):**
  substituições (#38), lesões (#39), VAR (#44), tabela e suspensões (#47–49).
  Charme e profundidade de "modo carreira", não realismo essencial do lance.

**Ordem sugerida para a próxima leva:** #8 (impedimento apitado) → #9 (barreira) →
#30 (back-pass) → #32 (aérea do GK) → #16 (reorganização com 10). Essas cinco
fecham o núcleo de regras do que acontece DENTRO de uma partida.
