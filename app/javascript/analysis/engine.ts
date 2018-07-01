// Interface between the analysis UI and the stockfish worker

import Backbone from 'backbone'

import { chess } from '../chess_mechanism'
import { uciToMove } from '../utils'
import { FEN } from '../types'

import { AnalysisOptions, defaultAnalysisOptions } from './options'
import Analysis from './models/analysis'
import stockfish from './stockfish_worker'
import analysisCache from './cache'
import store from '../store'

type Work = [FEN, AnalysisOptions]

class AnalysisEngine extends Backbone.Model {
  private workQueue: Array<Work> = []
  private isAnalyzing = false

  public enqueueWork(fen: FEN, options: AnalysisOptions): void {
    this.workQueue.push([fen, options])
    this.analyzeNextPosition()
  }

  private analyzeNextPosition(): void {
    if (this.isAnalyzing) {
      return
    }
    const work = this.workQueue.shift()
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
    const analysisOptions: AnalysisOptions = Object.assign({}, defaultAnalysisOptions, options)
    return stockfish.analyze(fen, analysisOptions).then(analysisData => {
      const analysis = new Analysis(analysisData)
      analysisCache.set(fen, analysisOptions, analysis)
      return analysis
    })
  }
}

const analysisEngine = new AnalysisEngine

export default analysisEngine
