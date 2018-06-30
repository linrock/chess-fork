import { UciMove, FEN } from '../types'

export interface PositionVariation {
  cp: number
  mate: number|null
  pv: string
  best: UciMove
}

export interface PositionEvaluation {
  depth: number
  nps: number
  best: UciMove
  cp: number
  mate: number|null
  pvs: Array<PositionVariation>
}

export interface PositionAnalysis {
  fen: FEN
  state: {
    [evaluation: string]: PositionEvaluation
  }
}
