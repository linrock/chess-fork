import { UciMove, FEN } from '../../types'
import { PositionAnalysis } from '../types'
import Variation from './variation'

export default class Analysis {
  public fen: FEN
  public bestmove: UciMove
  public engine: string
  public variations: Array<Variation>

  constructor(analysisData: PositionAnalysis) {
    const evaluation = analysisData.state.evaluation
    const polarity = analysisData.fen.includes(` w `) ? 1 : -1
    this.fen = analysisData.fen
    this.bestmove = evaluation.best
    this.engine = `Stockfish 2018-05-05`
    this.variations = evaluation.pvs.map(variation => {
      return new Variation(this.fen, {
        depth: evaluation.depth,
        multipv: evaluation.pvs.length,
        score: variation.mate || (variation.cp * polarity / 100),
        sequence: variation.pv.split(/\s+/)
      })
    })
  }
}
