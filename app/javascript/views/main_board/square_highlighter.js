// Handles highlighting square on the board when positions change

import Chess from 'chess.js'

import { world } from '../../world_state'
import { chess } from '../../chess_mechanism'
import store from '../../store'

export default class SquareHighlighter {

  constructor(board) {
    this.board = board
    this.colors = {
      "yellow":  ["#ffffcc", "#ffff66"],     // game moves
      "blue":    ["#eeffff", "#bbffff"]      // analysis moves
    }
    this.listenForEvents()
  }

  listenForEvents() {
    this.board.listenTo(world, "change:i", (model, i) => {
      this.highlightGameMoveIndex(i)
    })
    this.board.listenTo(chess, "change:j", (model, j) => {
      if (j === -1) {
        return
      }
      this.clearHighlights()
      const fen = store.state.currentAnalysis.variations[chess.get("k")].positions[j]
      const c = new Chess(fen)
      const move = c.move(store.state.currentAnalysis.variations[chess.get("k")].moves[j])
      this.highlightMove(move, "blue")
    })
    this.board.listenTo(chess, "change:k", (model, k) => {
      this.clearHighlights()
      const fen = store.state.currentAnalysis.variations[k].positions[0]
      const c = new Chess(fen)
      const move = c.move(store.state.currentAnalysis.variations[k].firstMove)
      this.highlightMove(move, "blue")
    })
    this.board.listenTo(chess, "change:mode", (model, mode) => {
      if (mode === "normal") {
        this.highlightGameMoveIndex(store.state.positionIndex)
      }
    })
  }

  clearHighlights() {
    this.board.$(".square[style]").removeAttr("style")
  }

  highlightMove(move, color) {
    const colorCodes = this.colors[color]
    this.board.$getSquare(move.from).css({ background: colorCodes[0] })
    this.board.$getSquare(move.to).css({ background: colorCodes[1] })
  }

  highlightGameMoveIndex(i) {
    this.clearHighlights()
    if (i <= 0) {
      return
    }
    const fen = world.getPosition(i - 1)
    const c = new Chess(fen)
    const move = c.move(chess.getMove(i - 1))
    this.highlightMove(move, "yellow")
  }
}
