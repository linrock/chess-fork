import { ChessMove, UciMove } from './types'

export const uciToMove = (uciMove: UciMove): ChessMove => {
  const move: ChessMove = {
    from: uciMove.slice(0,2),
    to: uciMove.slice(2,4)
  }
  if (uciMove.length === 5) {
    move.promotion = uciMove[4]
  }
  return move
}

export const getMovePrefix = (i: number): string => {
  const moveNum = 1 + ~~(i / 2)
  return moveNum + (i % 2 == 0 ? "." : "...")
}
