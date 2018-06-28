// Handles fetching analysis for a sequence of positions

import * as Backbone from 'backbone'

import { FEN } from './types'
import { chess } from './chess_mechanism'
import { world } from './main'
import analysisCache from './analysis_cache'

export default class AnalysisSequencer extends Backbone.Model {
  private positionQueue: Array<FEN> = []
  private isAnalyzing = false

  initialize() {
    this.listenForEvents()
  }

  private listenForEvents(): void {
    this.listenTo(chess, "game:loaded", () => {
      world.get("positions").toArray().forEach(fen => {
        this.positionQueue.push(fen)
      })
      this.analyzeNextPosition()
    })
    this.listenTo(chess, "analysis:enqueue", fen => {
      this.positionQueue.push(fen)
      this.analyzeNextPosition()
    })
  }

  private analyzeNextPosition(): void {
    if (this.isAnalyzing) {
      return
    }
    const fen = this.positionQueue.shift()
    if (!fen) {
      return
    }
    this.isAnalyzing = true
    if (analysisCache.get(fen)) {
      this.analysisComplete(fen)
    } else {
      analysisCache.getAnalysis(fen).then(() => this.analysisComplete(fen))
    }
  }

  private analysisComplete(fen: FEN): void {
    console.log(`analysis complete - ${fen}`)
    chess.trigger("analysis:complete", fen)
    this.isAnalyzing = false
    this.analyzeNextPosition()
  }
}
