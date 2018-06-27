// The chessboard, which reflects the current state of the
// chess mechanism

import PieceAnimator from './main_board/piece_animator'
import SquareHighlighter from './main_board/square_highlighter'
import PointAndClick from './main_board/point_and_click'
import DragAndDrop from './main_board/drag_and_drop'
import Chessboard from './chessboard'
import { chess } from '../chess_mechanism'

// Base chessboard class with position rendering behavior
// and more behaviors built through composition
//
export default class MainBoard extends Chessboard {

  get el() {
    return ".main-board"
  }

  get sqPrefix() {
    return "sq"
  }

  initialize() {
    super.initialize()
    this.animator = new PieceAnimator(this)
    this.highlighter = new SquareHighlighter(this)
    this.pointAndClick = new PointAndClick(this)
    this.dragAndDrop = new DragAndDrop(this)
    this.listenForEvents()
    this.dragAndDrop.init()
  }

  listenForEvents() {
    this.listenTo(chess, "change:fen", (model, fen) => this.renderFen(fen))
    this.listenTo(chess, "polarity:flip", this.flip)
  }

  move(move, ignoreNextAnimation = false) {
    this.ignoreNextAnimation = ignoreNextAnimation
    move.promotion = move.promotion || "q"
    chess.move(move)
  }

  flip() {
    this.$(".square").each((i,sq) => this.$el.prepend(sq))
  }
}
