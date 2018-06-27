export type HTML = string

export type FEN = string
export type San = string      // e3, h4, Nf6
export type UciMove = string  // a1a2, g4g7

export interface ChessMove {  // used by Chess.js
  from: string
  to: string
  promotion?: string
}
