// The chessboard, which reflects the current state of the
// chess mechanism

import PieceAnimator from './main_board/piece_animator'
import SquareHighlighter from './main_board/square_highlighter'
import PointAndClick from './main_board/point_and_click'
import DragAndDrop from './main_board/drag_and_drop'
import Chessboard from './chessboard'
import { FEN, ChessMove } from '../types'
import { chess } from '../chess_mechanism'
import store from '../store'

// Base chessboard class with position rendering behavior
// and more behaviors built through composition
//
export default class MainBoard extends Chessboard {
  private animator: PieceAnimator
  private highlighter: SquareHighlighter
  private pointAndClick: PointAndClick
  private dragAndDrop: DragAndDrop
  private ignoreNextAnimation: boolean
  private prevFen: FEN

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

  private listenForEvents() {
    store.subscribe((mutation, state) => {
      if (mutation.type === `flipBoard`) {
        this.flip()
      } else if (mutation.type === `setCurrentFen`) {
        this.prevFen = this.fen
        this.renderFen(state.currentFen)
      }
    })
  }

  public move(move: ChessMove, ignoreNextAnimation = false) {
    this.ignoreNextAnimation = ignoreNextAnimation
    move.promotion = move.promotion || "q"
    store.dispatch(`makeMove`, move)
  }

  private flip() {
    [].forEach.call(this.$(".square"), sq => this.$el.prepend(sq))
  }
}
