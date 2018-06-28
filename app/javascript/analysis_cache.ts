// Handles fetching analysis from remote server + rendering it

import * as $ from 'jquery'
import Chess from 'chess.js'
import { FEN, Analysis, AnalysisOptions } from './types'
import { chess } from './chess_mechanism'

interface AnalysisMap {
  [fen: string]: Analysis
}

class AnalysisCache {
  private analysisMap: AnalysisMap = {}
  private multipvAnalysisMap: AnalysisMap = {}

  // has side effect of enqueueing for analysis
  public get(fen: FEN, options: AnalysisOptions = {}): Analysis {
    const isMultipv = options.multipv && options.multipv > 1
    const analysis = isMultipv ? this.multipvAnalysisMap[fen] : this.analysisMap[fen]
    return analysis
  }

  public set(fen: FEN, options: AnalysisOptions = {}, analysis: Analysis) {
    if (options.multipv > 1) {
      this.multipvAnalysisMap[fen] = analysis
    } else {
      this.analysisMap[fen] = analysis
    }
  }
}

const analysisCache = new AnalysisCache

export default analysisCache
