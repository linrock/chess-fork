// Interface between the analysis UI and the stockfish worker

import { chess } from '../chess_mechanism'
import { uciToMove } from '../utils'
import { FEN } from '../types'

import { AnalysisOptions, defaultAnalysisOptions } from './options'
import Analysis from './models/analysis'
import stockfish from './stockfish_worker'
import analysisCache from './cache'
import store from '../store'

type Work = [FEN, AnalysisOptions]

class AnalysisEngine {
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
    let analysis = analysisCache.get(fen, options)
    if (analysis) {
      this.analysisComplete(fen, options, analysis)
    } else {
      this.stockfishAnalyze(fen, options).then(analysis => {
        analysisCache.set(fen, options, analysis)
        this.analysisComplete(fen, options, analysis)
      })
    }
  }

  private analysisComplete(fen: FEN, options: AnalysisOptions, analysis: Analysis): void {
    this.isAnalyzing = false
    store.dispatch(`analysisComplete`, { fen, options, analysis })
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
