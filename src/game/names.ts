/**
 * Nomes fictícios "estilo brasileiro": combinação de primeiro nome + sobrenome
 * a partir de listas comuns. NÃO representam atletas reais — evita direito de
 * imagem e dispensa manutenção de elencos reais.
 */

const FIRST = [
  'Lucas', 'Gabriel', 'Matheus', 'Rafael', 'Bruno', 'Felipe', 'Pedro', 'João',
  'Gustavo', 'Vinícius', 'Thiago', 'Diego', 'Rodrigo', 'Carlos', 'Eduardo',
  'Ricardo', 'Fernando', 'André', 'Marcelo', 'Leonardo', 'Daniel', 'Caio',
  'Igor', 'Wesley', 'Douglas', 'Renato', 'Alan', 'Vitor', 'Henrique', 'Júnior',
  'Wellington', 'Anderson', 'Robson', 'Everton', 'Jonas', 'Murilo', 'Kaique',
  'Yuri', 'Otávio', 'Maicon', 'Cléber', 'Émerson', 'Fábio', 'Sandro', 'Téo',
]

const LAST = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Lima', 'Ferreira',
  'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Carvalho', 'Araújo', 'Ribeiro',
  'Gomes', 'Martins', 'Rocha', 'Barbosa', 'Alves', 'Cardoso', 'Teixeira',
  'Moreira', 'Correia', 'Mendes', 'Nunes', 'Cavalcanti', 'Dias', 'Castro',
  'Campos', 'Freitas', 'Pinto', 'Moraes', 'Vieira', 'Monteiro', 'Cunha',
]

/** Gera um nome a partir de dois índices (determinístico). */
export const makeName = (i: number, j: number): string =>
  `${FIRST[i % FIRST.length]} ${LAST[j % LAST.length]}`

export const FIRST_COUNT = FIRST.length
export const LAST_COUNT = LAST.length
