// local cache for stockfish engine outputs

import $ from 'jquery'
import Chess from 'chess.js'

import { FEN } from '../types'
import { chess } from '../chess_mechanism'

import Analysis from './models/analysis'
import { AnalysisOptions, defaultAnalysisOptions } from './options'

type Score = number

interface AnalysisMap {
  [key: string]: Analysis
}

interface ScoreMap {
  [fen: string]: {
    [depth: number]: Score
  }
}

const analysisKey = (fen: FEN, options: AnalysisOptions): string => {
  return `${fen}-${JSON.stringify(Object.assign({}, defaultAnalysisOptions, options))}`
}

class AnalysisCache {
  private analysisMap: AnalysisMap = {}
  private scoreMap: ScoreMap = {}

  public get(fen: FEN, options: AnalysisOptions = {}): Analysis {
    return this.analysisMap[analysisKey(fen, options)]
  }

  // used by evaluation graph
  public getScore(fen: FEN): Score {
    if (this.scoreMap[fen]) {
      return Object.entries(this.scoreMap[fen]).sort().reverse()[0][1]
    }
  }

  public set(fen: FEN, options: AnalysisOptions = {}, analysis: Analysis): void {
    this.analysisMap[analysisKey(fen, options)] = analysis
    if (!this.scoreMap[fen]) {
      this.scoreMap[fen] = { [options.depth]: analysis.variations[0].score }
    } else {
      this.scoreMap[fen][options.depth] = analysis.variations[0].score
    }
  }
}

const analysisCache = new AnalysisCache

export default analysisCache
