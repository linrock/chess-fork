import _ from 'underscore'
import Chess from 'chess.js'

import { world } from '../../main'
import { chess } from '../../chess_mechanism'

// For handling animation of pieces on the board when relevant
//
export default class PieceAnimator {

  constructor(board) {
    this.board = board
    this.listenForEvents()
  }

  listenForEvents() {
    this.board.listenTo(world, "change:i", (model, i) => {
      let iPrev = model.previous("i")
      let prevFen = chess.getPosition(iPrev)
      let newFen = chess.getPosition(i)
      if (prevFen === newFen) {
        chess.setFen(newFen)
        return
      }
      if (this.board.ignoreNextAnimation) {
        this.board.ignoreNextAnimation = false
        chess.setFen(newFen)
        return
      }
      if (Math.abs(iPrev - i) === 1) {
        this.animatePositions(prevFen, newFen)
      } else {
        chess.setFen(newFen)
      }
    })
    this.board.listenTo(chess, "change:j", (model, j) => {
      if (j === -1) {
        return
      }
      let prevFen = window.chessboard.fen
      let newFen = chess.get("analysis").variations[0].positions[j + 1]
      let moves = this.positionDiffs(prevFen, newFen)
      if (moves.length <= 2) {
        this.animatePositions(prevFen, newFen)
      } else {
        chess.setFen(newFen)
      }
    })
  }

  // For figuring out what pieces on squares to move
  //
  positionDiffs(fen0, fen1) {
    let c0 = new Chess(fen0)
    let c1 = new Chess(fen1)
    let from = {}
    let to = {}
    _.each(c0.SQUARES, (sq) => {
      let [p0, p1] = [c0.get(sq), c1.get(sq)]
      if (_.isEqual(p0, p1)) {
        return
      }
      if (!p0 && p1) {
        to[p1.color + p1.type] = sq    // square was empty and piece moved to it
      } else if (!p1 && p0) {
        from[p0.color + p0.type] = sq  // square moved from
      } else if (p0 && p1) {           // one piece captured another
        to[p1.color + p1.type] = sq
      }
    })
    let moves = []
    for (let i in from) {
      if (to[i]) {
        moves.push([from[i], to[i]])
      }
    }
    return moves
  }

  animatePositions(...positions) {
    let fen0 = positions[0]
    let fen1 = positions[1]
    let moves = this.positionDiffs(fen0, fen1)
    let pieces = []

    for (let move of moves) {
      let [from, to] = move
      let o0 = this.board.$getSquare(from).offset()
      let o1 = this.board.$getSquare(to).offset()
      let top = o1.top - o0.top
      let left = o1.left - o0.left
      let $piece = this.board.$getSquare(from).find(".piece")
      this.animatePiece($piece, { left: left, top: top })
      pieces.push($piece)
    }
    this.board.$(".piece:animated").promise().done(() => {
      for (let $piece of pieces) {
        $piece.removeAttr("style")
      }
      if (positions.length > 2) {
        chess.setFen(fen1)
        this.animatePositions(positions.slice(1))
      } else {
        chess.setFen(fen1)
      }
    })
  }

  animatePiece($piece, position) {
    let movement = {
      left: (position.left > 0) ? `+=${position.left}px` : `-=${-position.left}px`,
      top: (position.top > 0) ? `+=${position.top}px` : `-=${-position.top}px`
    }
    $piece.animate(movement, 120)
  }

  animatePieceCss3($piece, position) {
    $piece.css({
      transform: `translate3d(${position.left}px, ${position.top}px, 0)`
    })
  }
}
