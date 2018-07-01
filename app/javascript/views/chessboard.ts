// Basic chessboard that just renders positions

import $ from 'jquery'
import Backbone from 'backbone'
import Chess from 'chess.js'

import { FEN } from '../types'

// For handling the DOM elements of the pieces on the board
//
class Pieces {
  private readonly $buffer = $("<div>").addClass("piece-buffer")
  private board: Chessboard

  constructor(board) {
    this.board = board
  }

  public reset(): void {
    this.board.$(".piece").appendTo(this.$buffer)
  }
  
  public $getPiece(piece): JQuery {
    const className = piece.color + piece.type
    const $piece = this.$buffer.find("." + className).first()
    if ($piece.length) {
      return $piece
    }
    return $("<img>").
      attr("src", `/assets/pieces/${className}.png`).
      addClass(`invisible piece ${className}`)
  }
}


export default class Chessboard extends Backbone.View<Backbone.Model> {
  protected readonly sqPrefix: string
  private pieces: Pieces
  private fen: FEN

  initialize() {
    this.pieces = new Pieces(this)
    this.renderFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    this.showPieces()
  }

  protected renderFen(fen): void {
    if (fen.split(" ").length === 4) {
      fen += " 0 1"
    }
    let columns = ['a','b','c','d','e','f','g','h']
    let position = new Chess(fen)
    this.pieces.reset()
    for (let row = 8; row > 0; row--) {
      for (let j = 0; j < 8; j++) {
        let id = columns[j] + row
        let piece = position.get(id)
        if (piece) {
          this.pieces.$getPiece(piece).appendTo(this.$getSquare(id))
        }
      }
    }
    this.fen = fen
  }

  private showPieces(): void {
    setTimeout(() => this.$(".piece").removeClass("invisible"), 100)
  }

  public isAnimating(): boolean {
    return !!this.$el.find(".piece:animated").length
  }

  public $getSquare(id): JQuery {
    return $(`#${this.sqPrefix}-${id}`)
  }
}
