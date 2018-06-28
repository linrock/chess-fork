// Interface between the analysis UI and the stockfish worker

import * as Backbone from 'backbone'
import Chess from 'chess.js'

import { chess } from '../chess_mechanism'
import { world } from '../main'
import { uciToMove } from '../utils'
import { FEN } from '../types'

import { AnalysisOptions } from './options'
import Analysis from './models/analysis'
import stockfish from './stockfish_worker'
import analysisCache from './cache'

export default class AnalysisEngine extends Backbone.Model {
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
    return stockfish.analyze(fen, options).then(analysisData => {
      const analysis = new Analysis(analysisData)
      analysisCache.set(fen, options, analysis)
      return analysis
    })
  }
}
