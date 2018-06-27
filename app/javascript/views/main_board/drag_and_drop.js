// Drag and drop pieces to move them

import $ from 'jquery'
require("jquery-ui/ui/widgets/draggable")
require("jquery-ui/ui/widgets/droppable")

export default class DragAndDrop {

  constructor(board) {
    this.board = board
    this.initialized = false
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
    this.board.$(".piece").draggable({
      stack: ".piece",
      distance: 5,
      revert: true,
      revertDuration: 0
    })
  }

  initDroppable() {
    this.board.$(".square").droppable({
      accept: ".piece",
      tolerance: "pointer",
      drop: (event, ui) => {
        this.board.move({
          from: $(ui.draggable).parents(".square").data("square"),
          to: $(event.target).data("square"),
        }, true)
      }
    })
  }
}
