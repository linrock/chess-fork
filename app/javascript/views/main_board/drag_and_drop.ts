// Drag and drop pieces to move them

declare var require: any

import $ from 'jquery'
require("jquery-ui/ui/widgets/draggable")
require("jquery-ui/ui/widgets/droppable")

import { ChessMove } from '../../types'
import MainBoard from '../main_board'

export default class DragAndDrop {
  private board: MainBoard
  private initialized = false

  constructor(board: MainBoard) {
    this.board = board
  }

  init() {
    if (this.initialized) {
      return
    }
    this.initDraggable()
    this.initDroppable()
    this.initialized = true
  }

  initDraggable() {
    (<any>this.board.$(".piece")).draggable({
      stack: ".piece",
      distance: 5,
      revert: true,
      revertDuration: 0
    })
  }

  initDroppable() {
    (<any>this.board.$(".square")).droppable({
      accept: ".piece",
      tolerance: "pointer",
      drop: (event, ui) => {
        const move: ChessMove = {
          from: $(ui.draggable).parents(".square").data("square"),
          to: $(event.target).data("square"),
        }
        this.board.move(move , true)
      }
    })
  }
}
