# Checklist de Funcionalidades — Versão Comercial

> Lista alto nível do **o quê** o jogo deve permitir (não o como).
> Marque `[x]` conforme for entregando. Itens marcados com 🎯 = essenciais do MVP.

## ▶ Como jogar e testar (build atual)
- **Rodar:** `npm run dev` e abrir no navegador. Cria carreira, escolhe um clube da Série D.
- **Jogar:** assista às partidas animadas (elenco e cores reais), simule rodadas, contrate/venda jogadores na janela, suba de divisão, aceite ofertas de clubes maiores e conquiste a Série A.
- **Modo acelerado (zerar em <1 min):** botão **⚡ Auto-jogar até zerar** no Início — joga a carreira inteira (D→C→B→A + título) em milissegundos.
- **Testes automatizados:** `npm test` — valida que 20/20 carreiras zeram (média 3,5 temporadas, ~7 ms cada), que o fluxo manual da UI funciona e que todas as telas renderizam.

## 🏆 Carreira & Progressão do Técnico
- [x] 🎯 Deve ser possível começar a carreira em um time pequeno (ex: Série D)
- [x] 🎯 Deve ser possível ganhar um campeonato
- [x] 🎯 Deve ser possível o time subir de divisão ao se classificar/ganhar
- [x] 🎯 Deve ser possível o time cair de divisão se for mal
- [x] 🎯 Deve ser possível ser contratado por outros times (ofertas de emprego)
- [ ] Deve ser possível ser demitido por mau desempenho
- [x] Deve ser possível acumular um histórico de títulos e conquistas
- [x] Deve ser possível o técnico ganhar reputação que atrai clubes maiores
- [ ] Deve ser possível receber objetivos/metas da diretoria a cada temporada
- [x] Deve ser possível jogar várias temporadas seguidas (carreira contínua)
- [x] Deve ser possível recusar propostas de emprego (negociar: pendente)

## 👥 Elenco & Jogadores
- [x] 🎯 Deve ser possível ver o elenco e os atributos de cada jogador
- [x] 🎯 Deve ser possível contratar jogadores
- [x] 🎯 Deve ser possível vender/dispensar jogadores
- [ ] Deve ser possível renovar e negociar contratos
- [ ] Deve ser possível emprestar jogadores (entrada e saída)
- [x] Deve ser possível os jogadores evoluírem com idade e treino
- [x] Deve ser possível os jogadores declinarem com a idade e se aposentarem
- [ ] Deve ser possível jogadores se lesionarem e ficarem fora por um período
- [ ] Deve ser possível jogadores serem suspensos por cartões
- [ ] Deve ser possível acompanhar moral/forma dos jogadores
- [ ] Deve ser possível promover jogadores da base/categorias de base

## ⚽ Partida & Tática
- [x] 🎯 Deve ser possível definir formação e escalação titular (4-3-3 automática pela força; edição manual: pendente)
- [x] 🎯 Deve ser possível assistir à partida com replay animado (elenco e cores reais)
- [ ] 🎯 Deve ser possível definir o estilo de jogo / tática do time
- [ ] 🎯 Deve ser possível fazer substituições
- [x] 🎯 Deve ser possível ver o placar e estatísticas da partida
- [x] Deve ser possível pular/acelerar a simulação da partida
- [ ] Deve ser possível dar instruções específicas (marcação, pressão, etc.)
- [ ] Deve ser possível ver a narração/lances principais do jogo

## 🏅 Competições
- [x] 🎯 Deve ser possível disputar uma liga de pontos corridos com tabela
- [x] 🎯 Deve ser possível ver classificação e calendário (artilharia: pendente)
- [x] 🎯 Deve ser possível os outros jogos da rodada serem simulados (híbrido por ratings)
- [ ] Deve ser possível disputar copas em formato mata-mata (Copa do Brasil)
- [ ] Deve ser possível disputar campeonatos estaduais
- [ ] Deve ser possível disputar competições continentais (Libertadores/Sul-Americana)
- [x] Deve ser possível ver histórico de temporadas passadas

## 💰 Finanças & Gestão do Clube
- [x] Deve ser possível administrar o orçamento do clube
- [x] Deve ser possível receber receitas (premiação e vendas; bilheteria/patrocínio: pendente)
- [x] Deve ser possível ter despesas (contratações; salários: pendente)
- [x] Deve ser possível sofrer consequências por estourar o orçamento (não pode gastar além da verba)
- [ ] Deve ser possível investir em infraestrutura (estádio, CT)
- [ ] Deve ser possível contratar comissão técnica/olheiros (staff)

## 🤝 Transferências & Mercado
- [x] 🎯 Deve ser possível existir uma janela/mercado de transferências
- [ ] Deve ser possível negociar valores e propostas com outros clubes
- [ ] Deve ser possível receber propostas por seus jogadores
- [ ] Deve ser possível observar/escontar jogadores (scouting)
- [x] Deve ser possível contratar jogadores livres (sem contrato)

## 🗂️ Mundo do Jogo & Dados
- [x] 🎯 Deve ser possível ter a pirâmide de divisões (A→B→C→D)
- [x] 🎯 Deve ser possível clubes reais com identidade (nome e cores; escudo: pendente)
- [x] Deve ser possível os outros clubes também evoluírem (gerados por nível a cada temporada)
- [x] Deve ser possível classificações que refletem mérito esportivo a cada temporada

## 💾 Save & Experiência
- [x] 🎯 Deve ser possível salvar e carregar a carreira (localStorage)
- [x] 🎯 Deve ser possível iniciar um novo jogo e escolher o time inicial
- [ ] Deve ser possível ter múltiplos saves/carreiras
- [ ] Deve ser possível um tutorial/onboarding para novos jogadores
- [x] Deve ser possível jogar em português (idioma)

## 🚀 Comercial & Futuro
- [x] Deve ser possível distribuir/publicar o jogo (build estático: `npm run build`)
- [ ] Deve ser possível monetizar (premium, cosméticos, etc.) — a definir
- [ ] Deve ser possível um modo online/multiplayer — futuro
- [ ] Deve ser possível conquistas/troféus do jogador (meta-progressão)
