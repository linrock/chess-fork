// Handles highlighting square on the board when positions change

import Chess from 'chess.js'

import { ChessMove } from '../../types'
import MainBoard from '../main_board'
import store from '../../store'

export default class SquareHighlighter {
  private board: MainBoard
  private colors = {
    "yellow":  ["#ffffcc", "#ffff66"], // game moves
    "blue":    ["#eeffff", "#bbffff"]  // analysis moves
  }

  constructor(board: MainBoard) {
    this.board = board
    this.listenForEvents()
  }

  private listenForEvents() {
    store.watch(state => state.positionIndex, positionIndex => {
      this.highlightGameMoveIndex(positionIndex)
    })
    store.watch(state => state.variationPositionIndex, variationPositionIndex => {
      if (variationPositionIndex === -1) {
        return
      }
      this.highlightVariationMove(
        store.getters.currentAnalysisVariation,
        store.state.variationPositionIndex
      )
    })
    store.watch(state => state.variationIndex, k => {
      this.highlightVariationMove(store.state.currentAnalysis.variations[k], 0)
    })
    store.watch(state => state.mode, mode => {
      if (mode === "normal") {
        this.highlightGameMoveIndex(store.state.positionIndex)
      } else if (mode === "analysis") {
        this.highlightVariationMove(store.getters.currentAnalysisVariation, 0)
      }
    })
  }

  private highlightVariationMove(analysisVariation, variationPositionIndex: number) {
    this.clearHighlights()
    const fen = analysisVariation.positions[variationPositionIndex]
    const cjs = new Chess(fen)
    let move: ChessMove
    if (variationPositionIndex === 0) {
      move = cjs.move(analysisVariation.firstMove)
    } else {
      move = cjs.move(analysisVariation.moves[variationPositionIndex])
    }
    this.highlightMove(move, "blue")
  }

  private clearHighlights() {
    this.board.$(".square[style]").removeAttr("style")
  }

  private highlightMove(move: ChessMove, color: string) {
    const colorCodes = this.colors[color]
    this.board.$getSquare(move.from).css({ background: colorCodes[0] })
    this.board.$getSquare(move.to).css({ background: colorCodes[1] })
  }

  private highlightGameMoveIndex(i: number) {
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
