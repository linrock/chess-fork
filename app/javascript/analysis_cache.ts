// Handles fetching analysis from remote server + rendering it

import * as $ from 'jquery'
import Chess from 'chess.js'
import { Analysis } from './analysis'
import { FEN, AnalysisOptions } from './types'
import { chess } from './chess_mechanism'

interface AnalysisMap {
  [key: string]: Analysis
}

const defaultAnalysisOptions = {
  depth: 12,
  multipv: 1
}

const analysisKey = (fen: FEN, options: AnalysisOptions): string => {
  return `${fen}-${JSON.stringify(Object.assign({}, defaultAnalysisOptions, options))}`
}

class AnalysisCache {
  private analysisMap: AnalysisMap = {}

  public get(fen: FEN, options: AnalysisOptions = {}): Analysis {
    return this.analysisMap[analysisKey(fen, options)]
  }

  public set(fen: FEN, options: AnalysisOptions = {}, analysis: Analysis): void {
    this.analysisMap[analysisKey(fen, options)] = analysis
  }
}

const analysisCache = new AnalysisCache

export default analysisCache
