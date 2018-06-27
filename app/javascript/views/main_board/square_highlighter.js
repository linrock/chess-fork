// Handles highlighting square on the board when positions change

import Chess from 'chess.js'

import { world } from '../../main'
import { chess } from '../../chess_mechanism'

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
      let fen = chess.get("analysis").variations[0].positions[j]
      let c = new Chess(fen)
      let move = c.move(chess.get("analysis").variations[0].moves[j])
      this.highlightMove(move, "blue")
    })
    this.board.listenTo(chess, "change:mode", (model, mode) => {
      if (mode === "normal") {
        this.highlightGameMoveIndex(world.get("i"))
      }
    })
  }

  clearHighlights() {
    this.board.$(".square[style]").removeAttr("style")
  }

  highlightMove(move, color) {
    let colorCodes = this.colors[color]
    this.board.$getSquare(move.from).css({ background: colorCodes[0] })
    this.board.$getSquare(move.to).css({ background: colorCodes[1] })
  }

  highlightGameMoveIndex(i) {
    this.clearHighlights()
    if (i <= 0) {
      return
    }
    let fen = chess.getPosition(i - 1)
    let c = new Chess(fen)
    let move = c.move(chess.getMoves(i - 1))
    this.highlightMove(move, "yellow")
  }
}
