declare module 'stopword' {
  export const eng: string[];
  export const spa: string[];
  export const por: string[];
  export const porBr: string[];
  export function removeStopwords(tokens: string[], stopwords?: string[]): string[];
}
