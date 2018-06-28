// Handles fetching analysis for a sequence of positions

import * as Backbone from 'backbone'
import Chess from 'chess.js'

import { UciMove, FEN, Analysis, AnalysisOptions } from './types'
import { chess } from './chess_mechanism'
import { world } from './main'
import { uciToMove } from './utils'
import analysisCache from './analysis_cache'
import stockfish from './workers/stockfish_engine'

export default class AnalysisSequencer extends Backbone.Model {
  private calculator: Chess = new Chess
  private positionQueue: Array<[FEN, AnalysisOptions]> = []
  private isAnalyzing = false

  initialize() {
    this.listenForEvents()
  }

  private listenForEvents(): void {
    this.listenTo(chess, "game:loaded", () => {
      world.get("positions").toArray().forEach(fen => {
        this.positionQueue.push([fen, {}])
      })
      this.analyzeNextPosition()
    })
    this.listenTo(chess, "analysis:enqueue", (fen, options) => {
      console.log(`analysis enqueued: ${fen} ${JSON.stringify(options)}`)
      this.positionQueue.push([fen, options])
      this.analyzeNextPosition()
    })
  }

  private analyzeNextPosition(): void {
    if (this.isAnalyzing) {
      return
    }
    const work = this.positionQueue.shift()
    if (!work) {
      return
    }
    const [fen, options] = work
    this.isAnalyzing = true
    if (analysisCache.get(fen, options)) {
      this.analysisComplete(fen, options)
    } else {
      this.stockfishAnalyze(fen, options).then(analysis => {
        analysisCache.set(fen, options, analysis)
        chess.trigger("change:analysis", analysis)
        this.analysisComplete(fen, options)
      })
    }
  }

  private analysisComplete(fen: FEN, options: AnalysisOptions): void {
    chess.trigger("analysis:complete", fen, options)
    this.isAnalyzing = false
    this.analyzeNextPosition()
  }

  // analysis from local stockfish in browser
  private stockfishAnalyze(fen: FEN, options: AnalysisOptions = {}): Promise<Analysis> {
    return stockfish.analyze(fen, options).then(data => {
      const polarity = fen.includes(` w `) ? 1 : -1
      const analysisData: Analysis = {
        fen: data.fen,
        bestmove: data.state.evaluation.best,
        engine: 'Stockfish 2018',
        variations: data.state.evaluation.pvs.map(variation => ({
          depth: data.state.evaluation.depth,
          multipv: data.state.evaluation.pvs.length,
          score: variation.mate || (variation.cp * polarity / 100),
          sequence: variation.pv.split(/\s+/)
        }))
      }
      const formattedAnalysis = this.formatAnalysisResponse(analysisData)
      analysisCache.set(fen, options, formattedAnalysis)
      return formattedAnalysis
    })
  }

  private formatAnalysisResponse(data): Analysis {
    for (let i in data.variations) {
      let variation = data.variations[i]
      let formatted = this.calcMovesAndPositions(data.fen, variation.sequence)
      data.variations[i] = Object.assign({}, variation, formatted)
    }
    return data
  }

  // TODO lazy calculate this when move list is rendered
  //
  private calcMovesAndPositions(fen: FEN, sequence: Array<UciMove>) {
    this.calculator.load(fen)
    let moves = []
    let positions = [fen]
    for (let uciMove of sequence) {
      let move = this.calculator.move(uciToMove(uciMove))
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
