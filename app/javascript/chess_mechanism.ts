// Handles the internal state of chess positions/history
// Also functions as an event dispatcher

import Backbone from 'backbone'
import Immutable from 'immutable'
import Chess from 'chess.js'

import { FEN, ChessMove, SanMove } from './types'
import { world } from './world_state'
import analysisCache from './analysis/cache'

export default class ChessMechanism extends Backbone.Model {
  public mechanism = new Chess

  constructor() {
    super()
    this.set({
      j: -1,
      mode: "normal",
    })
    this.listenTo(world, "change:i", () => {
      if (this.get("j") >= 0) {
        this.set({ mode: "normal" })
      }
    })
    this.listenTo(this, "change:mode", (model, mode) => {
      if (mode === "normal") {
        this.setFen(world.getCurrentPosition())
        this.set({ j: -1, k: 0 })
      } else if (mode === "analysis") {
        this.set({ j: 0 })
      }
    })
  }

  public setFen(fen): void {
    this.set({ fen })
  }

  public start(): void {
    this.setFen(this.mechanism.fen())
  }

  public analyzePosition(fen: FEN, k: number): void {
    k = k || 0 // multipv index
    let analysis
    if (k > 0) {
      analysis = analysisCache.get(fen, { multipv: 3 })
    } else {
      analysis = analysisCache.get(fen)
    }
    if (!analysis) {
      return
    }
    this.set({ j: 0, mode: "analysis", k })
  }

  public prevEngineMove(): void {
    this.setEnginePositionIndex(this.get("j") - 1)
  }

  public nextEngineMove(): void {
    this.setEnginePositionIndex(this.get("j") + 1)
  }

  private setEnginePositionIndex(j): void {
    let fen = world.getCurrentPosition()
    if (this.get("mode") === "normal" && j >= 0) {
      this.analyzePosition(fen, 0)
      return
    }
    let analysis = analysisCache.get(fen)
    if (!analysis || j >= analysis.variations[0].length) {
      return
    }
    if (j < 0) {
      this.set({ mode: "normal" })
      return
    }
    if ((<any>window).chessboard.isAnimating()) {
      return
    }
    this.set({ j })
  }
}

export const chess = new ChessMechanism
