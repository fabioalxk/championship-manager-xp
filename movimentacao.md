# Movimentação — 50 Considerações para uma Simulação de Futebol Perfeita

Levantamento de fatores de movimentação que devem ser modelados para que o jogo fique realista e fluido.

---

## 1. Movimentação Individual e Física do Corpo

1. **Movimentação individual** — cada jogador tem sua própria posição, direção e velocidade calculadas a cada frame, nunca movendo-se em bloco "colado".
2. **Stamina (energia)** — jogadores se cansam; recuperam quando andam/ficam parados e gastam quando correm. O cansaço afeta velocidade, precisão e tomada de decisão.
3. **Velocidade máxima individual** — cada jogador tem um teto de velocidade baseado no atributo (ex.: ponta veloz vs. zagueiro lento).
4. **Aceleração e desaceleração** — não se atinge a velocidade máxima instantaneamente; há rampa de aceleração e frenagem.
5. **Inércia e momentum** — corpo em movimento resiste a mudanças bruscas; quanto mais rápido, mais difícil parar ou virar.
6. **Raio de curva (turning radius)** — em alta velocidade o jogador faz curvas mais abertas; parado ou lento, gira no próprio eixo.
7. **Reação/tempo de resposta** — há um pequeno delay entre o estímulo (bola muda de direção) e o início do movimento, modulado pelo atributo de reação.
8. **Agilidade e mudança de direção** — capacidade de fintar e trocar de direção rapidamente, separada da velocidade linear.
9. **Passada e ritmo de corrida** — animação dos passos sincronizada com a velocidade real (evitar "foot sliding").
10. **Equilíbrio e quedas** — ao ser empurrado, mudar de direção bruscamente ou sofrer falta, o jogador pode perder equilíbrio.

## 2. Stamina, Fadiga e Condicionamento

11. **Sprint vs. trote vs. caminhada** — três (ou mais) níveis de esforço, cada um com custo de stamina diferente.
12. **Recuperação de fôlego** — a stamina volta gradualmente quando o jogador reduz a intensidade; nunca instantânea.
13. **Fadiga acumulada no jogo** — ao longo dos 90 min o teto de stamina cai, reduzindo o desempenho geral no fim da partida.
14. **Condicionamento físico (fitness)** — atributo que define quão rápido gasta e quão rápido recupera energia.
15. **Cãibras e lesões por esforço** — risco aumenta com stamina baixa e muitos sprints.
16. **Impacto do cansaço na decisão** — jogadores cansados erram mais passes, chegam atrasados e marcam pior.
17. **Gestão de esforço pela IA** — a IA decide quando vale a pena sprintar e quando economizar energia.

## 3. Movimentação Sem a Bola (Off-the-ball)

18. **Desmarques e criação de espaço** — atacantes correm para receber, abrindo linhas de passe.
19. **Movimentos diagonais e nas costas da defesa** — corridas em profundidade buscando a linha do último defensor.
20. **Apoio ao portador da bola** — companheiros se oferecem em ângulos de passe próximos.
21. **Cobertura defensiva** — quando um marcador é batido, outro cobre o espaço.
22. **Linha de impedimento** — defensores sobem em conjunto para deixar o atacante impedido.
23. **Compactação das linhas** — defesa, meio e ataque mantêm distâncias coerentes entre si (bloco compacto).
24. **Basculação (shifting)** — todo o time desliza lateralmente conforme o lado em que a bola está.
25. **Marcação individual vs. por zona** — diferentes sistemas alteram totalmente os padrões de movimento.
26. **Pressing e gatilhos de pressão** — disparo coletivo da pressão quando há um gatilho (passe errado, recuo, etc.).
27. **Movimentos de tabela e sobreposição (overlap/underlap)** — laterais e meias se cruzam para criar superioridade.
28. **Ocupação de zonas no ataque** — espaçamento para cobrir corredores e faixas do campo.

## 4. Movimentação Com a Bola (On-the-ball)

29. **Condução de bola (dribble)** — a bola fica ligeiramente à frente do pé; conduzir reduz um pouco a velocidade máxima.
30. **Proteção de bola** — usar o corpo entre o adversário e a bola, movendo-se mais devagar.
31. **Toque/primeira recepção** — qualidade do domínio define se a bola fica perto ou escapa.
32. **Fintas e dribles** — movimentos específicos (corte, elástico, caneta) com risco/recompensa.
33. **Velocidade com bola vs. sem bola** — conduzir é mais lento que correr livre.

## 5. Posicionamento Tático e Formação

34. **Manutenção da formação** — cada jogador tem uma posição-base e tende a voltar a ela.
35. **Elasticidade da formação** — o time estica no ataque e encolhe na defesa.
36. **Funções e papéis (roles)** — volante, meia box-to-box, ala, etc., com padrões de movimento distintos.
37. **Largura e profundidade do time** — definidas pela tática (jogar aberto/fechado, linha alta/baixa).
38. **Transições ataque↔defesa** — reorganização rápida ao perder ou recuperar a bola.
39. **Densidade ao redor da bola** — mais jogadores convergem para a região onde a bola está.

## 6. Colisões, Interações e Espaço

40. **Detecção de colisão entre jogadores** — corpos não se sobrepõem; há contato físico e disputa.
41. **Disputa de ombro e força (jostling)** — atributo de força define quem ganha o espaço no contato.
42. **Evitar aglomeração (steering/separation)** — algoritmos para os jogadores não se amontoarem no mesmo ponto.
43. **Pathfinding e desvio de obstáculos** — calcular rota até o alvo desviando de outros jogadores.
44. **Antecipação e interceptação** — defensores calculam ponto de encontro com a bola, não a posição atual.

## 7. Bola, Goleiro e Situações Especiais

45. **Sincronia jogador-bola** — corrida ajustada para chegar à bola no momento e ângulo certos (timing de passada).
46. **Movimentação do goleiro** — sai do gol, ajusta ângulo, recua na bola pelo alto, joga com os pés.
47. **Reposicionamento em bola parada** — barreira, marcação em escanteio, posicionamento em faltas e laterais.
48. **Reação a bola solta/rebote** — todos recalculam destino quando a bola fica livre.

## 8. Variabilidade, Realismo e Polimento

49. **Influência dos atributos e da personalidade** — ritmo, posicionamento, antecipação e "trabalho" individual modulam cada movimento; estilos diferentes geram movimentos diferentes.
50. **Variação humana e imperfeição** — pequenos erros de posicionamento, ruído aleatório e timing imperfeito para evitar movimento robótico e idêntico entre jogadores.

---

### Notas de implementação (resumo)
- Modele movimento como **velocidade desejada → forças (steering) → restrições físicas (aceleração, inércia, raio de curva) → posição final**.
- Separe **decisão** (o que fazer / para onde ir — IA tática) de **execução** (como o corpo se move — física).
- Use **stamina** como modulador global que reduz velocidade máxima, aceleração e qualidade das ações ao longo do jogo.
