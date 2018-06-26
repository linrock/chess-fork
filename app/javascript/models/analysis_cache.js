// Handles fetching analysis from remote server + rendering it

import $ from 'jquery'
import _ from 'underscore'
import Chess from 'chess.js'

import { chess } from '../chess_mechanism'

export default class AnalysisCache {

  constructor() {
    this.calculator = new Chess()
    this.analysis = {}
  }

  get(fen) {
    return this.analysis[fen]
  }

  set(fen, analysis) {
    this.analysis[fen] = analysis
  }

  remoteGet(fen, options = {}) {
    options.fen = fen
    chess.trigger("analysis:pending")
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "/analysis",
        type: "POST",
        data: options,
        dataType: "json",
        context: this,
        success: (data, status, xhr) => {
          resolve(this.formatAnalysisResponse(data, fen))
        },
        error: (xhr, status, error) => {
          reject(fen)
        }
      })
    })
  }

  getAnalysis(fen) {
    return new Promise((resolve, reject) => {
      let analysis = analysisCache.get(fen)
      if (analysis) {
        resolve(analysis)
      } else {
        this.remoteGet(fen).
          then((analysis) => {
            analysisCache.set(fen, analysis)
            return analysis
          }).
          then(this.notifyAnalysis).
          then(resolve)
      }
    })
  }

  notifyAnalysis(analysis) {
    chess.trigger("change:analysis", analysis)
    return analysis
  }

  uciToMove(uciMove) {
    let move = {
      from: uciMove.slice(0,2),
      to: uciMove.slice(2,4)
    }
    if (uciMove.length === 5) {
      move.promotion = uciMove[4]
    }
    return move
  }

  formatAnalysisResponse(data, fen) {
    data.fen = fen
    for (let i in data.variations) {
      let variation = data.variations[i]
      let formatted = this.calcMovesAndPositions(fen, variation.sequence)
      data.variations[i] = _.extend(variation, formatted)
    }
    return data
  }

  // TODO lazy calculate this using a generator
  //
  calcMovesAndPositions(fen, sequence) {
    this.calculator.load(fen)
    let moves = []
    let positions = [fen]
    for (let uciMove of sequence) {
      let move = this.calculator.move(this.uciToMove(uciMove))
      moves.push(move.san)
      positions.push(this.calculator.fen())
    }
    return {
      moves: moves,
      positions: positions,
      n: moves.length
    }
  }
}
