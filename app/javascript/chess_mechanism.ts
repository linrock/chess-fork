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
      polarity: 1
    })
    this.listenTo(world, "change:i", () => {
      if (this.get("j") >= 0) {
        this.set({ mode: "normal" })
      }
    })
    this.listenTo(this, "change:mode", (model, mode) => {
      if (mode === "normal") {
        this.setFen(this.getPosition(world.get("i")))
        this.set({ j: -1, k: 0 })
      } else if (mode === "analysis") {
        this.set({ j: 0 })
      }
    })
    this.listenTo(this, "polarity:flip", () => {
      this.set({ polarity: -1 * this.get("polarity") })
    })
  }

  public setFen(fen): void {
    this.set({ fen })
  }

  public start(): void {
    this.setFen(this.mechanism.fen())
  }

  public move(move: ChessMove): void {
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

  public getPosition(i: number): FEN {
    return world.get("positions").get(i)
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

  public getMoves(i: number, end: number): Immutable.List<SanMove> {
    if (end > i) {
      return world.get("moves").slice(i, end)
    } else {
      return Immutable.List()
    }
  }

  public getMove(i: number): SanMove {
    return world.get("moves").get(i)
  }

  public loadPgn(pgn): boolean {
    if (!this.mechanism.load_pgn(pgn)) {
      return false
    }
    this.loadGameHistory(this.mechanism.history())
    this.setPositionIndex(1)
    return true
  }

  public firstMove(): void {
    this.setPositionIndex(0)
  }

  public prevMove(): void {
    this.setPositionIndex(world.get("i") - 1)
  }

  public nextMove(): void {
    this.setPositionIndex(world.get("i") + 1)
  }

  public lastMove(): void {
    this.setPositionIndex(this.nPositions() - 1)
  }

  public setPositionIndex(i): void {
    if (this.get("mode") === "analysis") {
      this.set({ mode: "normal" })
      return
    }
    if (i < 0 || i >= this.nPositions()) {
      return
    }
    if ((<any>window).chessboard.isAnimating()) {
      return
    }
    world.set({ i })
  }

  public prevEngineMove(): void {
    this.setEnginePositionIndex(this.get("j") - 1)
  }

  public nextEngineMove(): void {
    this.setEnginePositionIndex(this.get("j") + 1)
  }

  private loadGameHistory(moves: Array<SanMove>): void {
    const c = new Chess
    const positions = [c.fen()]
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

  private getCurrentPosition(): FEN {
    return world.get("positions").get(world.get("i"))
  }

  private getPositions(): Immutable.List<FEN> {
    return world.get("positions")
  }

  private nPositions(): number {
    return this.getPositions().size
  }

  private setEnginePositionIndex(j): void {
    let fen = this.getCurrentPosition()
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
