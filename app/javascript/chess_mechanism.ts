// Handles the internal state of chess positions/history
// Also functions as an event dispatcher

import * as Backbone from 'backbone'
import * as Immutable from 'immutable'
import Chess from 'chess.js'

import { world } from './main'
import analysisCache from './analysis_cache'

export default class ChessMechanism extends Backbone.Model {
  public mechanism: Chess

  constructor() {
    super()
    this.mechanism = new Chess
    this.set({
      j: -1,
      mode: "normal",
      polarity: 1
    })
    this.listenForEvents()
  }

  listenForEvents() {
    this.listenTo(world, "change:i", () => {
      if (this.get("j") >= 0) {
        this.set({ mode: "normal" })
      }
    })
    this.listenTo(this, "change:mode", (model, mode) => {
      if (mode === "normal") {
        this.setFen(this.getPosition(world.get("i")))
        this.set({ j: -1 })
      } else if (mode === "analysis") {
        this.set({ j: 0 })
      }
    })
    this.listenTo(this, "polarity:flip", () => {
      this.set({ polarity: -1 * this.get("polarity") })
    })
  }

  setFen(fen) {
    this.set({ fen: fen })
  }

  start() {
    this.setFen(this.mechanism.fen())
  }

  move(move) {
    let i = world.get("i")
    let c = new Chess(this.getPosition(i))
    let moveAttempt = c.move(move)
    if (!moveAttempt) {
      return
    }
    let moves = this.getMoves(0, i).push(moveAttempt.san)
    let newFen = c.fen()
    let ind = i < 1 ? 1 : i + 1
    let positions = Immutable.List(this.getPositions().slice(0, ind))
    this.mechanism = c
    world.set({
      moves: Immutable.List(moves),
      positions: positions.push(newFen),
      i: (i < 0) ? 1 : i + 1
    })
  }

  loadGameHistory(moves) {
    let c = new Chess
    let positions = [c.fen()]
    for (let move of moves) {
      c.move(move)
      positions.push(c.fen())
    }
    world.set({
      moves: Immutable.List(moves),
      positions: Immutable.List(positions)
    })
    this.trigger("game:loaded")
  }

  getPosition(i) {
    return world.get("positions").get(i)
  }

  getCurrentPosition() {
    return world.get("positions").get(world.get("i"))
  }

  getPositions() {
    return world.get("positions")
  }

  nPositions() {
    return this.getPositions().size
  }

  analyzePosition(fen) {
    let analysis = analysisCache.get(fen)
    if (!analysis) {
      return;
    }
    this.set({ j: 0, analysis: analysis, mode: "analysis" })
  }

  getMovePrefix(i) {
    let moveNum = 1 + ~~(i / 2)
    return moveNum + (i % 2 == 0 ? "." : "...")
  }

  getMoves(i, end = false) {
    if (end !== false) {
      if (end > i) {
        return world.get("moves").slice(i, end)
      } else {
        return Immutable.List()
      }
    } else {
      return world.get("moves").get(i)
    }
  }

  loadPgn(pgn) {
    if (!this.mechanism.load_pgn(pgn)) {
      return false
    }
    this.loadGameHistory(this.mechanism.history())
    this.setPositionIndex(1)
    return true
  }

  firstMove() {
    this.setPositionIndex(0)
  }

  prevMove() {
    this.setPositionIndex(world.get("i") - 1)
  }

  nextMove() {
    this.setPositionIndex(world.get("i") + 1)
  }

  lastMove() {
    this.setPositionIndex(this.nPositions() - 1)
  }

  setPositionIndex(i) {
    if (this.get("mode") === "analysis") {
      this.set({ mode: "normal" })
      return
    }
    if (i < 0 || i >= this.nPositions()) {
      return
    }
    if ((<any>window).chessboard.animating()) {
      return
    }
    world.set({ i: i })
  }

  prevEngineMove() {
    this.setEnginePositionIndex(this.get("j") - 1)
  }

  nextEngineMove() {
    this.setEnginePositionIndex(this.get("j") + 1)
  }

  setEnginePositionIndex(j) {
    let fen = this.getCurrentPosition()
    if (this.get("mode") === "normal" && j >= 0) {
      this.analyzePosition(fen)
      return
    }
    let analysis = analysisCache.get(fen)
    if (!analysis || j >= analysis.variations[0].n) {
      return
    }
    if (j < 0) {
      this.set({ mode: "normal" })
      return
    }
    if ((<any>window).chessboard.animating()) {
      return
    }
    this.set({ j: j })
  }
}

export const chess = new ChessMechanism
