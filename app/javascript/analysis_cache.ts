// Handles fetching analysis from remote server + rendering it

import * as $ from 'jquery'
import Chess from 'chess.js'
import { ChessMove, UciMove, FEN, Variation, Analysis } from './types'
import { chess } from './chess_mechanism'
import stockfish from './workers/stockfish_engine'

interface RemoteOptions {
  multipv?: number
  depth?: number
}

class AnalysisCache {
  private calculator: Chess
  private analysisMap: { [fen: string] : Analysis }

  constructor() {
    this.calculator = new Chess()
    this.analysisMap = {}
  }

  get(fen: FEN): Analysis {
    return this.analysisMap[fen]
  }

  set(fen: FEN, analysis: Analysis) {
    this.analysisMap[fen] = analysis
  }

  // analysis from local stockfish in browser
  localGet(fen: FEN, options: RemoteOptions = {}): Promise<Analysis> {
    return new Promise((resolve, reject) => {
      stockfish.analyze(fen, options, (data) => {
        const polarity = fen.includes(` w `) ? 1 : -1
        const analysisData: Analysis = {
          fen: data.fen,
          bestmove: data.eval.best,
          engine: 'Stockfish 2018',
          variations: data.eval.pvs.map(variation => ({
            depth: data.eval.depth,
            multipv: data.eval.pvs.length,
            score: variation.mate || (variation.cp * polarity / 100),
            sequence: variation.pv.split(/\s+/)
          }))
        }
        resolve(this.formatAnalysisResponse(analysisData))
      })
    })
  }

  getAnalysis(fen: FEN, options: RemoteOptions = {}, cacheOnly = false): Promise<Analysis> {
    return new Promise((resolve, reject) => {
      const analysis = this.get(fen)
      if (analysis) {
        resolve(analysis)
      } else {
        if (cacheOnly) {
          resolve(null)
          return
        }
        this.localGet(fen, options).
          then((analysis) => {
            this.set(fen, analysis)
            return analysis
          }).
          then(this.notifyAnalysis).
          then(resolve)
      }
    })
  }

  notifyAnalysis(analysis): Analysis {
    chess.trigger("change:analysis", analysis)
    return analysis
  }

  uciToMove(uciMove: UciMove): ChessMove {
    const move: ChessMove = {
      from: uciMove.slice(0,2),
      to: uciMove.slice(2,4)
    }
    if (uciMove.length === 5) {
      move.promotion = uciMove[4]
    }
    return move
  }

  formatAnalysisResponse(data): Analysis {
    for (let i in data.variations) {
      let variation = data.variations[i]
      let formatted = this.calcMovesAndPositions(data.fen, variation.sequence)
      data.variations[i] = Object.assign({}, variation, formatted)
    }
    return data
  }

  // TODO lazy calculate this using a generator
  //
  calcMovesAndPositions(fen: FEN, sequence: Array<UciMove>) {
    this.calculator.load(fen)
    let moves = []
    let positions = [fen]
    for (let uciMove of sequence) {
      let move = this.calculator.move(this.uciToMove(uciMove))
      moves.push(move.san)
      positions.push(this.calculator.fen())
    }
    return {
      n: moves.length,
      positions,
      moves,
    }
  }
}

const analysisCache = new AnalysisCache

export default analysisCache
