import type { Attrs } from '../sim/types'
import { WC_SPECS } from '../sim/teams'

/**
 * Elencos com nomes REAIS de jogadores para as seleções da Copa do Mundo (modo
 * roguelike). Cada lista tem exatamente 11 entradas, na ordem de `ROLES_433`
 * (GK, DEF×4, MID×3, FWD×3), no formato `[nome, delta]`:
 *
 *  • nome  — o único dado 100% real do jogador;
 *  • delta — qualidade RELATIVA ao próprio time, em pontos de overall. Na
 *    geração os deltas são CENTRALIZADOS (subtrai-se a média do time), então
 *    só a diferença entre companheiros importa — a média do elenco continua
 *    exatamente no nível da fase. É isso que garante a hierarquia congruente
 *    (Vini melhor que Wendell, Messi melhor que Otamendi) sem inflar o time.
 *
 * Cobre as seleções mais conhecidas, onde dá pra montar um elenco com confiança
 * razoável. As demais (menos badaladas) seguem com nomes fictícios gerados por
 * `names.ts` — é preferível a arriscar inventar um nome errado pra um país que
 * eu conheço pouco o elenco.
 */
export const WC_ROSTERS: Record<string, [name: string, delta: number][]> = {
  brasil: [
    ['Alisson', 5],
    ['Danilo', -6], ['Marquinhos', 4], ['Gabriel M.', 1], ['Wendell', -6],
    ['Casemiro', -2], ['Bruno G.', 3], ['Paquetá', 1],
    ['Raphinha', 7], ['Endrick', -1], ['Vini Jr.', 14],
  ],
  argentina: [
    ['Dibu Martínez', 6],
    ['Molina', -3], ['Cuti Romero', 5], ['Otamendi', -4], ['Tagliafico', -3],
    ['De Paul', 3], ['Enzo Fernández', 5], ['Mac Allister', 5],
    ['Di María', 4], ['J. Álvarez', 7], ['Messi', 14],
  ],
  franca: [
    ['Mike Maignan', 6],
    ['Jules Koundé', 2], ['William Saliba', 6], ['Dayot Upamecano', 2], ['Theo Hernández', 4],
    ['Tchouaméni', 3], ['Rabiot', 0], ['Griezmann', 5],
    ['Mbappé', 14], ['Dembélé', 8], ['Marcus Thuram', 4],
  ],
  alemanha: [
    ['Manuel Neuer', 4],
    ['Kimmich', 7], ['Rüdiger', 6], ['Jonathan Tah', 2], ['David Raum', 0],
    ['Florian Wirtz', 10], ['Gündogan', 3], ['Musiala', 10],
    ['Havertz', 4], ['Sané', 3], ['Gnabry', 1],
  ],
  espanha: [
    ['Unai Simón', 2],
    ['Carvajal', 3], ['Le Normand', 1], ['Cubarsí', 4], ['Cucurella', 2],
    ['Rodri', 10], ['Pedri', 7], ['Fabián Ruiz', 2],
    ['Lamine Yamal', 13], ['Nico Williams', 6], ['Morata', 0],
  ],
  inglaterra: [
    ['Jordan Pickford', 2],
    ['Kyle Walker', -2], ['John Stones', 3], ['Marc Guéhi', 1], ['Luke Shaw', 0],
    ['Declan Rice', 6], ['Bellingham', 11], ['Trent Alexander-Arnold', 5],
    ['Harry Kane', 10], ['Bukayo Saka', 8], ['Phil Foden', 6],
  ],
  portugal: [
    ['Diogo Costa', 4],
    ['Cancelo', 3], ['Rúben Dias', 7], ['Gonçalo Inácio', 1], ['Nuno Mendes', 5],
    ['Bruno Fernandes', 7], ['Vitinha', 6], ['Bernardo Silva', 7],
    ['Rafael Leão', 8], ['Gonçalo Ramos', 2], ['João Félix', 0],
  ],
  holanda: [
    ['Bart Verbruggen', 1],
    ['Dumfries', 4], ['Van Dijk', 10], ['Jurriën Timber', 3], ['Nathan Aké', 2],
    ['Frenkie de Jong', 6], ['Xavi Simons', 4], ['Reijnders', 5],
    ['Gakpo', 6], ['Memphis Depay', 3], ['Bergwijn', -2],
  ],
  italia: [
    ['Donnarumma', 8],
    ['Bastoni', 6], ['Calafiori', 4], ['Di Lorenzo', 1], ['Dimarco', 4],
    ['Barella', 7], ['Tonali', 6], ['Frattesi', 2],
    ['Moise Kean', 3], ['Retegui', 3], ['Chiesa', 2],
  ],
  belgica: [
    ['Koen Casteels', 1],
    ['Theate', 0], ['Faes', -2], ['Zeno Debast', -1], ['Castagne', 0],
    ['Onana', 4], ['Tielemans', 3], ['De Bruyne', 11],
    ['Lukaku', 6], ['Doku', 6], ['Trossard', 3],
  ],
  uruguai: [
    ['Sergio Rochet', 1],
    ['Giménez', 3], ['Araújo', 7], ['Olivera', 1], ['Viña', -1],
    ['Valverde', 11], ['Ugarte', 4], ['Bentancur', 3],
    ['Darwin Núñez', 6], ['Pellistri', 0], ['Cristian Olivera', -1],
  ],
  croacia: [
    ['Livaković', 3],
    ['Stanišić', 1], ['Gvardiol', 8], ['Šutalo', 1], ['Borna Sosa', 0],
    ['Modrić', 9], ['Kovačić', 4], ['Baturina', 1],
    ['Perišić', 2], ['Petković', 0], ['Kramarić', 3],
  ],
  colombia: [
    ['Camilo Vargas', 1],
    ['Muñoz', 4], ['Davinson Sánchez', 2], ['Lucumí', 2], ['Mojica', -1],
    ['Lerma', 2], ['Kevin Castaño', 0], ['James Rodríguez', 7],
    ['Luis Díaz', 10], ['Jhon Córdoba', 2], ['Borré', 0],
  ],
  chile: [
    ['Gabriel Arias', 1],
    ['Isla', -3], ['Maripán', 2], ['Paulo Díaz', 2], ['Suazo', 2],
    ['Erick Pulgar', 1], ['Marcelino Núñez', 2], ['Vicente Pizarro', 0],
    ['Alexis Sánchez', 5], ['Brereton Díaz', 1], ['Eduardo Vargas', -2],
  ],
  mexico: [
    ['Luis Malagón', 2],
    ['Jesús Gallardo', 0], ['César Montes', 2], ['Johan Vásquez', 2], ['Jorge Sánchez', -2],
    ['Edson Álvarez', 6], ['Luis Chávez', 1], ['Orbelín Pineda', 0],
    ['Santiago Giménez', 5], ['Hirving Lozano', 4], ['Alexis Vega', 0],
  ],
  'estados-unidos': [
    ['Matt Turner', 0],
    ['Sergiño Dest', 2], ['Chris Richards', 1], ['Miles Robinson', 1], ['Antonee Robinson', 3],
    ['Weston McKennie', 3], ['Tyler Adams', 3], ['Yunus Musah', 1],
    ['Christian Pulisic', 9], ['Folarin Balogun', 2], ['Ricardo Pepi', 2],
  ],
  canada: [
    ['Maxime Crépeau', 0],
    ['Alistair Johnston', 2], ['Kamal Miller', 0], ['Moïse Bombito', 1], ['Sam Adekugbe', -1],
    ['Stephen Eustáquio', 2], ['Ismaël Koné', 2], ['Mark-Anthony Kaye', -1],
    ['Jonathan David', 9], ['Cyle Larin', 2], ['Tajon Buchanan', 3],
  ],
  japao: [
    ['Zion Suzuki', 1],
    ['Hiroki Ito', 2], ['Ko Itakura', 2], ['Tomiyasu', 4], ['Sugawara', 1],
    ['Wataru Endo', 3], ['Hidemasa Morita', 2], ['Ao Tanaka', 1],
    ['Kaoru Mitoma', 8], ['Minamino', 3], ['Ayase Ueda', 2],
  ],
  'coreia-do-sul': [
    ['Jo Hyeon-woo', 0],
    ['Kim Min-jae', 8], ['Kim Young-gwon', 0], ['Kim Tae-hwan', -2], ['Seol Young-woo', 0],
    ['Hwang In-beom', 3], ['Paik Seung-ho', 0], ['Lee Kang-in', 6],
    ['Son Heung-min', 11], ['Cho Gue-sung', 1], ['Oh Hyeon-gyu', 0],
  ],
  marrocos: [
    ['Bounou', 5],
    ['Achraf Hakimi', 10], ['Saïss', 0], ['Aguerd', 3], ['Mazraoui', 4],
    ['Amrabat', 3], ['Ounahi', 2], ['Amallah', 0],
    ['Ziyech', 4], ['En-Nesyri', 2], ['Brahim Díaz', 5],
  ],
  senegal: [
    ['Édouard Mendy', 4],
    ['Koulibaly', 6], ['Abdou Diallo', 1], ['Sabaly', 0], ['Ballo-Touré', -2],
    ['Idrissa Gueye', 3], ['Pape Matar Sarr', 4], ['Nampalys Mendy', 0],
    ['Sadio Mané', 10], ['Ismaïla Sarr', 4], ['Boulaye Dia', 2],
  ],
  nigeria: [
    ['Stanley Nwabali', 1],
    ['Ola Aina', 2], ['Troost-Ekong', 2], ['Calvin Bassey', 2], ['Zaidu Sanusi', -1],
    ['Frank Onyeka', 0], ['Alex Iwobi', 3], ['Onyedika', 1],
    ['Victor Osimhen', 10], ['Lookman', 8], ['Iheanacho', 1],
  ],
  gana: [
    ['Ati-Zigi', 0],
    ['Djiku', 1], ['Salisu', 1], ['Gideon Mensah', -1], ['Tariq Lamptey', 2],
    ['Thomas Partey', 6], ['Mohammed Kudus', 9], ['Iddrisu Baba', -1],
    ['Jordan Ayew', 1], ['Semenyo', 5], ['Osman Bukari', 0],
  ],
  suica: [
    ['Yann Sommer', 6],
    ['Ricardo Rodríguez', 0], ['Akanji', 7], ['Elvedi', 2], ['Widmer', 0],
    ['Xhaka', 8], ['Freuler', 3], ['Shaqiri', 3],
    ['Embolo', 3], ['Ndoye', 3], ['Amdouni', 1],
  ],
  polonia: [
    ['Szczęsny', 6],
    ['Bednarek', 1], ['Kiwior', 2], ['Bereszyński', -2], ['Zalewski', 1],
    ['Zieliński', 5], ['Szymański', 2], ['Frankowski', 0],
    ['Lewandowski', 12], ['Świderski', 0], ['Urbański', -1],
  ],
  australia: [
    ['Mathew Ryan', 2],
    ['Degenek', 0], ['Harry Souttar', 3], ['Kye Rowles', 0], ['Behich', 0],
    ['Aaron Mooy', 3], ['Jackson Irvine', 3], ['McGree', 2],
    ['Mitchell Duke', 0], ['Goodwin', 0], ['Maclaren', 1],
  ],
  equador: [
    ['Hernán Galíndez', 0],
    ['Estupiñán', 4], ['Hincapié', 6], ['Félix Torres', 1], ['Preciado', 0],
    ['Caicedo', 10], ['Jhegson Méndez', 0], ['Alan Franco', 1],
    ['Enner Valencia', 4], ['Kevin Rodríguez', 0], ['Gonzalo Plata', 3],
  ],
  paraguai: [
    ['Carlos Coronel', 2],
    ['Espínola', 0], ['Alderete', 2], ['Gustavo Gómez', 4], ['Balbuena', 1],
    ['Villasanti', 3], ['Ángel Cardozo', 0], ['Diego Gómez', 4],
    ['Almirón', 5], ['Sanabria', 2], ['Enciso', 4],
  ],
  peru: [
    ['Pedro Gallese', 4],
    ['Advíncula', 3], ['Zambrano', 0], ['Santamaría', -1], ['Marcos López', 1],
    ['Renato Tapia', 3], ['Christian Cueva', 1], ['Carrillo', 2],
    ['Lapadula', 3], ['Edison Flores', 1], ['Alex Valera', 0],
  ],
  turquia: [
    ['Uğurcan Çakır', 3],
    ['Zeki Çelik', 1], ['Merih Demiral', 3], ['Bardakcı', 2], ['Ferdi Kadıoğlu', 4],
    ['Hakan Çalhanoğlu', 9], ['İsmail Yüksek', 1], ['Arda Güler', 8],
    ['Kenan Yıldız', 6], ['Cengiz Ünder', 2], ['Barış Alper', 3],
  ],
}

/** Jogador de elenco real pronto para a geração: nome + delta (+ arquétipo, se houver). */
export interface WcPlayer {
  name: string
  delta: number
  /** assinatura de atributos do arquétipo em `teams.ts` (só Brasil/Argentina por ora) */
  attrs?: Partial<Attrs>
  /** número REAL da camisa, quando o arquétipo o define */
  number?: number
}

/**
 * Elenco real de uma seleção, com os arquétipos de `teams.ts` (assinatura de
 * atributos + camisa real) mesclados por posição quando existem. `undefined`
 * para seleções sem elenco real (seguem com nomes fictícios).
 */
export const wcRoster = (clubId: string): WcPlayer[] | undefined =>
  WC_ROSTERS[clubId]?.map(([name, delta], i) => ({
    name,
    delta,
    attrs: WC_SPECS[clubId]?.[i].attrs,
    number: WC_SPECS[clubId]?.[i].number,
  }))
