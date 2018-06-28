import Chess from 'chess.js'

import { ChessMove, SanMove, UciMove, FEN } from './types'
import { uciToMove } from './utils'

interface MovesAndPositions {
  moves: Array<SanMove>
  positions: Array<FEN>
}

export class Variation {
  public fen: FEN
  public depth: number
  public multipv: number
  public score: number
  public sequence: Array<UciMove>

  constructor(fen, data) {
    this.fen = fen
    this.depth = data.depth
    this.multipv = data.multipv
    this.score = data.score
    this.sequence = data.sequence
  }

  public get moves(): Array<SanMove> {
    return this.movesAndPositions.moves
  }

  public get positions(): Array<FEN> {
    return this.movesAndPositions.positions
  }

  public get length(): number {
    return this.sequence.length
  }

  private get movesAndPositions(): MovesAndPositions {
    const cjs = new Chess(this.fen)
    const moves = []
    const positions = [this.fen]
    for (let uciMove of this.sequence) {
      let move = cjs.move(uciToMove(uciMove))
      moves.push(move.san)
      positions.push(cjs.fen())
    }
    return { moves, positions }
  }
}

export class Analysis {
  public fen: FEN
  public bestmove: UciMove
  public engine: string
  public variations: Array<Variation>

  constructor(analysisData) {
    const polarity = analysisData.fen.includes(` w `) ? 1 : -1
    this.fen = analysisData.fen
    this.bestmove = analysisData.state.evaluation.best
    this.engine = `Stockfish 2018-05-05`
    this.variations = analysisData.state.evaluation.pvs.map(variation => {
      return new Variation(this.fen, {
        depth: analysisData.state.evaluation.depth,
        multipv: analysisData.state.evaluation.pvs.length,
        score: variation.mate || (variation.cp * polarity / 100),
        sequence: variation.pv.split(/\s+/)
      })
    })
  }
}
