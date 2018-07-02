// Handles highlighting square on the board when positions change

import Chess from 'chess.js'

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
    store.watch(state => state.positionIndex, positionIndex => {
      this.highlightGameMoveIndex(positionIndex)
    })
    this.board.listenTo(chess, "change:j", (model, j) => {
      if (j === -1) {
        return
      }
      this.highlightVariationMove(
        store.getters.currentAnalysisVariation,
        store.state.variationPositionIndex
      )
    })
    this.board.listenTo(chess, "change:k", (model, k) => {
      this.highlightVariationMove(store.state.currentAnalysis.variations[k], 0)
    })
    this.board.listenTo(chess, "change:mode", (model, mode) => {
      if (mode === "normal") {
        this.highlightGameMoveIndex(store.state.positionIndex)
      } else if (mode === "analysis") {
        this.highlightVariationMove(store.getters.currentAnalysisVariation ,0)
      }
    })
  }

  highlightVariationMove(analysisVariation, variationPositionIndex) {
    this.clearHighlights()
    const fen = analysisVariation.positions[variationPositionIndex]
    const cjs = new Chess(fen)
    let move
    if (variationPositionIndex === 0) {
      move = cjs.move(analysisVariation.firstMove)
    } else {
      move = cjs.move(analysisVariation.moves[variationPositionIndex])
    }
    this.highlightMove(move, "blue")
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
    const fen = store.getters.position(i - 1)
    const c = new Chess(fen)
    const move = c.move(store.state.moves[i - 1])
    this.highlightMove(move, "yellow")
  }
}
