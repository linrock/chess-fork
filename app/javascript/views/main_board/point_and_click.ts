// Point and click pieces to select and move them

import { ChessMove } from '../../types'
import MainBoard from '../main_board'
import store from '../../store'

export default class PointAndClick {
  private board: MainBoard
  private selectedSquare: boolean|string = false

  constructor(board: MainBoard) {
    this.board = board
    this.selectedSquare = false
    this.listenForEvents()
  }

  listenForEvents() {
    this.board.$el.on("click", ".square", event => {
      const squareId = event.currentTarget.dataset.square
      this.selectSquare(squareId)
    })
    store.subscribe(mutation => {
      mutation.type === `setPositionIndex` && this.clearSelected()
    })
  }

  selectSquare(square: string) {
    if (this.selectedSquare && square !== this.selectedSquare) {
      const move: ChessMove = {
        from: <string>this.selectedSquare,
        to: square
      }
      this.board.move(move)
      this.clearSelected()
    } else {
      this.selectedSquare = square
    }
  }

  clearSelected() {
    this.selectedSquare = false
  }
}
