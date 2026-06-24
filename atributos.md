# Atributos do Jogador — Escala 0 a 100

Cada jogador tem ~40 atributos, todos na escala **0–100**, e **todos são usados** na
simulação. Abaixo, cada atributo e **onde** ele entra no motor (`ratings.ts` centraliza
as fórmulas; `engine.ts`/`ai.ts` as consomem).

> Normalização única: `nrm(v) = v / 100` → 0..1, usada por todas as fórmulas.

## Físico (9)
1. **pace** — velocidade máxima de corrida (`maxSpeed`).
2. **acceleration** — arranque: rapidez para atingir a velocidade máxima (`outfieldAccel`/`gkMaxSpeed`).
3. **agility** — mudança de direção: vira sem frear tanto (`turnFloor`) + velocidade do GK.
4. **balance** — equilíbrio: resiste a cair/tropeçar no duelo (`knockResist`) + proteção de bola.
5. **jumping** — impulsão: disputa de bola alta/dividida (`aerialPower`).
6. **strength** — força: duelos, potência do chute, dividida no chão.
7. **stamina** — fôlego: ritmo de gasto de energia ao correr.
8. **naturalFitness** — recuperação: ritmo de recuperação de energia (`recoverMul`).
9. **workRate** — intensidade sem bola: pressão/marcação (`engagement` na defesa).

## Técnico (10)
10. **dribbling** — condução/drible: mantém a bola no duelo (`carryPower`) + controle próximo.
11. **firstTouch** — domínio: raio de controle da bola solta (`controlReach`) + erro de domínio (`miscontrol`).
12. **technique** — técnica: reduz o erro (spread) de passes e chutes.
13. **passing** — passe: velocidade e precisão (`passSpeed`/`passSpread`).
14. **crossing** — cruzamento: precisão da bola das pontas (`crossSpeed`/`crossSpread`).
15. **finishing** — finalização: precisão/alcance do chute de perto.
16. **longShots** — chute de longe: alcance e precisão fora da área.
17. **heading** — cabeceio: disputa aérea (`aerialPower`).
18. **tackling** — desarme: ganha a bola no bote (`tacklePower`).
19. **marking** — marcação: cola no adversário sem bola (`markPull`, posição defensiva).

## Mental (12)
20. **vision** — visão: enxerga/escolhe a melhor opção de passe.
21. **anticipation** — antecipação: lê a jogada e intercepta antes (`chaseLead`).
22. **positioning** — posicionamento defensivo: antecipa a bola (`engagement`) + base do GK.
23. **offTheBall** — movimentação sem bola: qualidade das corridas no ataque (`offBallAdvance`).
24. **decisions** — decisão: quando conduzir, passar ou chutar (`holdMax`).
25. **composure** — frieza: erra menos sob pressão (domínio/finalização/distribuição do GK).
26. **concentration** — concentração: menos lapsos quando cansado (`miscontrol`).
27. **consistency** — regularidade: reduz a variância aleatória das ações (spread).
28. **aggression** — agressividade: faz mais faltas/cartões.
29. **bravery** — bravura: entra em botes mais arriscados (`tackleRange`).
30. **teamwork** — entrosamento: mantém o bloco compacto/dá apoio (`shapeMul`).
31. **flair** — imprevisibilidade: efeito/criatividade no chute (`flairSpin`).

## Goleiro (8)
32. **goalkeeping** — defesa-base (shot stopping) (`gkSaveBase`).
33. **reflexes** — reflexo: defesa de reação curta + alcance + rebote.
34. **handling** — mãos: segura vs. espalma; evita frango (`gkHoldChance`).
35. **aerialReach** — saída aérea: alcança bolas altas/cruzamentos (`gainReach`).
36. **oneOnOne** — saída de frente: sweeper / 1v1 (come-out + bônus de defesa de perto).
37. **kicking** — tiro de meta/chutão: distância e precisão (`gkKickSpeed`).
38. **throwing** — reposição curta: lançamento de mão (`gkThrowSpeed`).
39. **communication** — comando de área: organiza/compacta a linha de defesa (`commandShift`).
