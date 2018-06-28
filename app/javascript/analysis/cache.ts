// local cache for stockfish engine outputs

import * as $ from 'jquery'
import Chess from 'chess.js'

import { FEN } from '../types'
import { chess } from '../chess_mechanism'

import Analysis from './models/analysis'
import { AnalysisOptions, defaultAnalysisOptions } from './options'

interface AnalysisMap {
  [key: string]: Analysis
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
