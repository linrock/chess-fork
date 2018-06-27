import m from 'mithril'
import * as Backbone from 'backbone'
import Chess from 'chess.js'

import { ChessMove } from '../types'
import { chess } from '../chess_mechanism'

export default class VirtualDomBoard extends Backbone.View<Backbone.Model> {
  private ROWS = [8, 7, 6, 5, 4, 3, 2, 1]
  private COLS = ['a','b','c','d','e','f','g','h']
  private position = new Chess()
  private moveColors = ["#ffffcc", "#ffff66"]
  private boardEl: HTMLElement

  get el() {
    return document.querySelector(".mini-hover-board")
  }

  initialize() {
    this.boardEl = this.el.querySelector(`.hover-board`)
    this.listenForEvents()
  }

  listenForEvents() {
    this.listenTo(chess, "preview:i", (i) => {
      let fen = chess.getPosition(i)
      if (!fen) {
        return
      }
      let lastMove = this.getLastMove(i)
      this.renderFen(fen, lastMove)
    })
    this.listenTo(chess, "preview:hide", () => {
      this.boardEl.classList.add("invisible")
    })
    this.listenTo(chess, "preview:show", () => {
      this.boardEl.classList.remove("invisible")
    })
  }

  getLastMove(i): ChessMove {
    if (i === 0) {
      return
    }
    this.position.load(chess.getPosition(i - 1))
    return this.position.move(chess.getMoves(i - 1))
  }

  getPiece(piece): m.Component {
    const className = piece.color + piece.type
    return m(`img.piece.${className}`, {
      src: `/assets/pieces/${className}.png`
    })
  }

  vSquaresFromFen(fen, highlights): m.Component {
    this.position.load(fen)
    let i = 0
    let squares = []
    let polarities = ['light', 'dark']
    for (let row of this.ROWS) {
      for (let col of this.COLS) {
        let id = col + row
        let pieces = []
        let piece = this.position.get(id)
        if (piece) {
          pieces.push(this.getPiece(piece))
        }
        let style = {}
        if (highlights[id]) {
          Object.assign(style, { background: highlights[id] })
        }
        squares.push(m(`div.square.${polarities[i % 2]}`, style, pieces))
        i += 1
      }
      i += 1
    }
    return squares
  }

  renderFen(fen, lastMove) {
    let highlights = {}
    if (lastMove) {
      highlights[lastMove.from] = this.moveColors[0]
      highlights[lastMove.to] = this.moveColors[1]
    }
    requestAnimationFrame(() => {
      m.render(this.boardEl, m(".chessboard", this.vSquaresFromFen(fen, highlights)))
    })
  }
}
