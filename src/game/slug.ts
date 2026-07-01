/** Slug estável usado para casar nomes (clube, jogador) com arquivos em `public/`. */
export const slug = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
