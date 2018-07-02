import _ from 'underscore'
import Chess from 'chess.js'

import { world } from '../../world_state'
import { FEN } from '../../types'
import store from '../../store'
import MainBoard from '../main_board'

// For handling animation of pieces on the board when relevant
//
export default class PieceAnimator {
  private board: MainBoard

  constructor(board: MainBoard) {
    this.board = board
    this.listenForEvents()
  }

  private setFen(fen: FEN) {
    store.dispatch(`setFen`, fen)
  }

  private listenForEvents() {
    store.watch(state => state.positionIndex, (positionIndex, prevI) => {
      const prevFen = store.getters.position(prevI)
      const newFen = store.getters.position(positionIndex)
      if (prevFen === newFen) {
        this.setFen(newFen)
        return
      }
      if (this.board.ignoreNextAnimation) {
        this.board.ignoreNextAnimation = false
        this.setFen(newFen)
        return
      }
      if (Math.abs(prevI - positionIndex) === 1) {
        this.animatePositions(prevFen, newFen)
      } else {
        this.setFen(newFen)
      }
    })
    store.watch(state => state.variationPositionIndex, variationPositionIndex => {
      if (variationPositionIndex === -1) {
        return
      }
      const prevFen = this.board.prevFen
      const newFen = this.currentAnalysisPosition()
      const moves = this.positionDiffs(prevFen, newFen)
      if (moves.length <= 2) {
        this.animatePositions(prevFen, newFen)
      } else {
        this.setFen(newFen)
      }
    })
    store.watch(state => state.variationIndex, variationIndex => {
      const prevFen = this.board.prevFen
      const newFen = this.currentAnalysisPosition()
      this.setFen(newFen)
    })
    store.watch(state => state.mode, mode => {
      if (mode === "normal") {
        this.setFen(store.getters.currentFen)
      } else if (mode === "analysis") {
        this.setFen(this.currentAnalysisPosition())
      }
    })
  }

  private currentAnalysisPosition(): FEN {
    const currentAnalysis = store.state.currentAnalysis
    const j = store.state.variationPositionIndex
    const k = store.state.variationIndex
    return currentAnalysis.variations[k].positions[j + 1]
  }

  // For figuring out what pieces on squares to move
  //
  private positionDiffs(fen0, fen1): Array<[string, string]> {
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

  private animatePositions(...positions): void {
    store.dispatch(`setBoardIsAnimating`, true)
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
      this.animatePiece($piece, { left, top })
      pieces.push($piece)
    }
    this.board.$(".piece:animated").promise().done(() => {
      for (let $piece of pieces) {
        $piece.removeAttr("style")
      }
      if (positions.length > 2) {
        this.setFen(fen1)
        this.animatePositions(positions.slice(1))
      } else {
        this.setFen(fen1)
      }
      store.dispatch(`setBoardIsAnimating`, false)
    })
  }

  private animatePiece($piece, { left, top }) {
    const movement = {
      left: (left > 0) ? `+=${left}px` : `-=${-left}px`,
      top: (top > 0) ? `+=${top}px` : `-=${-top}px`
    }
    $piece.animate(movement, 120)
  }

  animatePieceCss3($piece, position) {
    $piece.css({
      transform: `translate3d(${position.left}px, ${position.top}px, 0)`
    })
  }
}
