/**
 * Elencos com nomes REAIS de jogadores para as seleções da Copa do Mundo (modo
 * roguelike). Cada lista tem exatamente 11 nomes, na ordem de `ROLES_433`
 * (GK, DEF×4, MID×3, FWD×3) — os atributos continuam gerados/fictícios (não há
 * como saber a força real de cada um; só o NOME é real).
 *
 * Cobre as seleções mais conhecidas, onde dá pra montar um elenco com confiança
 * razoável. As demais (menos badaladas) seguem com nomes fictícios gerados por
 * `names.ts` — é preferível a arriscar inventar um nome errado pra um país que
 * eu conheço pouco o elenco.
 */
export const WC_ROSTERS: Record<string, string[]> = {
  brasil: [
    'Alisson',
    'Danilo', 'Marquinhos', 'Gabriel M.', 'Wendell',
    'Casemiro', 'Bruno G.', 'Paquetá',
    'Raphinha', 'Endrick', 'Vini Jr.',
  ],
  argentina: [
    'Dibu Martínez',
    'Molina', 'Cuti Romero', 'Otamendi', 'Tagliafico',
    'De Paul', 'Enzo Fernández', 'Mac Allister',
    'Di María', 'J. Álvarez', 'Messi',
  ],
  franca: [
    'Mike Maignan',
    'Jules Koundé', 'William Saliba', 'Dayot Upamecano', 'Theo Hernández',
    'Tchouaméni', 'Rabiot', 'Griezmann',
    'Mbappé', 'Dembélé', 'Marcus Thuram',
  ],
  alemanha: [
    'Manuel Neuer',
    'Kimmich', 'Rüdiger', 'Jonathan Tah', 'David Raum',
    'Florian Wirtz', 'Gündogan', 'Musiala',
    'Havertz', 'Sané', 'Gnabry',
  ],
  espanha: [
    'Unai Simón',
    'Carvajal', 'Le Normand', 'Cubarsí', 'Cucurella',
    'Rodri', 'Pedri', 'Fabián Ruiz',
    'Lamine Yamal', 'Nico Williams', 'Morata',
  ],
  inglaterra: [
    'Jordan Pickford',
    'Kyle Walker', 'John Stones', 'Marc Guéhi', 'Luke Shaw',
    'Declan Rice', 'Bellingham', 'Trent Alexander-Arnold',
    'Harry Kane', 'Bukayo Saka', 'Phil Foden',
  ],
  portugal: [
    'Diogo Costa',
    'Cancelo', 'Rúben Dias', 'Gonçalo Inácio', 'Nuno Mendes',
    'Bruno Fernandes', 'Vitinha', 'Bernardo Silva',
    'Rafael Leão', 'Gonçalo Ramos', 'João Félix',
  ],
  holanda: [
    'Bart Verbruggen',
    'Dumfries', 'Van Dijk', 'Jurriën Timber', 'Nathan Aké',
    'Frenkie de Jong', 'Xavi Simons', 'Reijnders',
    'Gakpo', 'Memphis Depay', 'Bergwijn',
  ],
  italia: [
    'Donnarumma',
    'Bastoni', 'Calafiori', 'Di Lorenzo', 'Dimarco',
    'Barella', 'Tonali', 'Frattesi',
    'Moise Kean', 'Retegui', 'Chiesa',
  ],
  belgica: [
    'Koen Casteels',
    'Theate', 'Faes', 'Zeno Debast', 'Castagne',
    'Onana', 'Tielemans', 'De Bruyne',
    'Lukaku', 'Doku', 'Trossard',
  ],
  uruguai: [
    'Sergio Rochet',
    'Giménez', 'Araújo', 'Olivera', 'Viña',
    'Valverde', 'Ugarte', 'Bentancur',
    'Darwin Núñez', 'Pellistri', 'Cristian Olivera',
  ],
  croacia: [
    'Livaković',
    'Stanišić', 'Gvardiol', 'Šutalo', 'Borna Sosa',
    'Modrić', 'Kovačić', 'Baturina',
    'Perišić', 'Petković', 'Kramarić',
  ],
  colombia: [
    'Camilo Vargas',
    'Muñoz', 'Davinson Sánchez', 'Lucumí', 'Mojica',
    'Lerma', 'Kevin Castaño', 'James Rodríguez',
    'Luis Díaz', 'Jhon Córdoba', 'Borré',
  ],
  chile: [
    'Gabriel Arias',
    'Isla', 'Maripán', 'Paulo Díaz', 'Suazo',
    'Erick Pulgar', 'Marcelino Núñez', 'Vicente Pizarro',
    'Alexis Sánchez', 'Brereton Díaz', 'Eduardo Vargas',
  ],
  mexico: [
    'Luis Malagón',
    'Jesús Gallardo', 'César Montes', 'Johan Vásquez', 'Jorge Sánchez',
    'Edson Álvarez', 'Luis Chávez', 'Orbelín Pineda',
    'Santiago Giménez', 'Hirving Lozano', 'Alexis Vega',
  ],
  'estados-unidos': [
    'Matt Turner',
    'Sergiño Dest', 'Chris Richards', 'Miles Robinson', 'Antonee Robinson',
    'Weston McKennie', 'Tyler Adams', 'Yunus Musah',
    'Christian Pulisic', 'Folarin Balogun', 'Ricardo Pepi',
  ],
  canada: [
    'Maxime Crépeau',
    'Alistair Johnston', 'Kamal Miller', 'Moïse Bombito', 'Sam Adekugbe',
    'Stephen Eustáquio', 'Ismaël Koné', 'Mark-Anthony Kaye',
    'Jonathan David', 'Cyle Larin', 'Tajon Buchanan',
  ],
  japao: [
    'Zion Suzuki',
    'Hiroki Ito', 'Ko Itakura', 'Tomiyasu', 'Sugawara',
    'Wataru Endo', 'Hidemasa Morita', 'Ao Tanaka',
    'Kaoru Mitoma', 'Minamino', 'Ayase Ueda',
  ],
  'coreia-do-sul': [
    'Jo Hyeon-woo',
    'Kim Min-jae', 'Kim Young-gwon', 'Kim Tae-hwan', 'Seol Young-woo',
    'Hwang In-beom', 'Paik Seung-ho', 'Lee Kang-in',
    'Son Heung-min', 'Cho Gue-sung', 'Oh Hyeon-gyu',
  ],
  marrocos: [
    'Bounou',
    'Achraf Hakimi', 'Saïss', 'Aguerd', 'Mazraoui',
    'Amrabat', 'Ounahi', 'Amallah',
    'Ziyech', 'En-Nesyri', 'Brahim Díaz',
  ],
  senegal: [
    'Édouard Mendy',
    'Koulibaly', 'Abdou Diallo', 'Sabaly', 'Ballo-Touré',
    'Idrissa Gueye', 'Pape Matar Sarr', 'Nampalys Mendy',
    'Sadio Mané', 'Ismaïla Sarr', 'Boulaye Dia',
  ],
  nigeria: [
    'Stanley Nwabali',
    'Ola Aina', 'Troost-Ekong', 'Calvin Bassey', 'Zaidu Sanusi',
    'Frank Onyeka', 'Alex Iwobi', 'Onyedika',
    'Victor Osimhen', 'Lookman', 'Iheanacho',
  ],
  gana: [
    'Ati-Zigi',
    'Djiku', 'Salisu', 'Gideon Mensah', 'Tariq Lamptey',
    'Thomas Partey', 'Mohammed Kudus', 'Iddrisu Baba',
    'Jordan Ayew', 'Semenyo', 'Osman Bukari',
  ],
  suica: [
    'Yann Sommer',
    'Ricardo Rodríguez', 'Akanji', 'Elvedi', 'Widmer',
    'Xhaka', 'Freuler', 'Shaqiri',
    'Embolo', 'Ndoye', 'Amdouni',
  ],
  polonia: [
    'Szczęsny',
    'Bednarek', 'Kiwior', 'Bereszyński', 'Zalewski',
    'Zieliński', 'Szymański', 'Frankowski',
    'Lewandowski', 'Świderski', 'Urbański',
  ],
  australia: [
    'Mathew Ryan',
    'Degenek', 'Harry Souttar', 'Kye Rowles', 'Behich',
    'Aaron Mooy', 'Jackson Irvine', 'McGree',
    'Mitchell Duke', 'Goodwin', 'Maclaren',
  ],
  equador: [
    'Hernán Galíndez',
    'Estupiñán', 'Hincapié', 'Félix Torres', 'Preciado',
    'Caicedo', 'Jhegson Méndez', 'Alan Franco',
    'Enner Valencia', 'Kevin Rodríguez', 'Gonzalo Plata',
  ],
  paraguai: [
    'Carlos Coronel',
    'Espínola', 'Alderete', 'Gustavo Gómez', 'Balbuena',
    'Villasanti', 'Ángel Cardozo', 'Diego Gómez',
    'Almirón', 'Sanabria', 'Enciso',
  ],
  peru: [
    'Pedro Gallese',
    'Advíncula', 'Zambrano', 'Santamaría', 'Marcos López',
    'Renato Tapia', 'Christian Cueva', 'Carrillo',
    'Lapadula', 'Edison Flores', 'Alex Valera',
  ],
  turquia: [
    'Uğurcan Çakır',
    'Zeki Çelik', 'Merih Demiral', 'Bardakcı', 'Ferdi Kadıoğlu',
    'Hakan Çalhanoğlu', 'İsmail Yüksek', 'Arda Güler',
    'Kenan Yıldız', 'Cengiz Ünder', 'Barış Alper',
  ],
}
