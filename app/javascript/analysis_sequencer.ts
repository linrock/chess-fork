// Handles fetching analysis for a sequence of positions

import * as Backbone from 'backbone'

import { chess } from './chess_mechanism'
import { world } from './main'
import analysisCache from './analysis_cache'

export default class AnalysisSequencer extends Backbone.Model {

  initialize() {
    this.listenForEvents()
  }

  listenForEvents() {
    this.listenTo(chess, "game:loaded", () => {
      const positions = world.get("positions").toArray()
      this.analyzePositionsSequentially(positions)
    })
  }

  analyzePositionsSequentially(positions: Array<string>) {
    const fen = positions.shift()
    if (!fen) {
      return
    }
    const analysis = analysisCache.get(fen)
    if (analysis) {
      this.analyzePositionsSequentially(positions)
    } else {
      analysisCache.getAnalysis(fen).then(() => {
        this.analyzePositionsSequentially(positions)
      })
    }
  }
}
