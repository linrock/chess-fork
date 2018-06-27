// Point and click pieces to select and move them

import $ from 'jquery'
import { world } from '../../main'

export default class PointAndClick {

  constructor(board) {
    this.board = board
    this.selectedSquare = false
    this.listenForEvents()
  }

  listenForEvents() {
    this.board.$el.on("click", ".square", (event) => {
      let square = $(event.currentTarget).data("square")
      this.selectSquare(square)
    })
    this.board.listenTo(world, "change:i", () => { this.clearSelected() })
  }

  selectSquare(square) {
    if (this.selectedSquare && square != this.selectedSquare) {
      this.board.move({ from: this.selectedSquare, to: square })
      this.clearSelected()
    } else {
      this.selectedSquare = square
    }
  }

  clearSelected() {
    this.selectedSquare = false
  }
}
