// Mini hover board that shows up when hovering over
// the evaluation graph

{

  // TODO DRY
  // For handling the DOM elements of the pieces on the board
  //
  class Pieces {

    constructor(board) {
      this.board = board
      this.$buffer = $("<div>").addClass("piece-buffer")
    }

    reset() {
      this.board.$(".piece").appendTo(this.$buffer)
    }
    
    $getPiece(piece) {
      let className = piece.color + piece.type
      let $piece = this.$buffer.find("." + className).first()
      if ($piece.length) {
        return $piece
      }
      return $("<img>").
        attr("src", `/assets/pieces/${className}.png`).
        addClass(`piece ${className}`)
    }

  }


  // TODO DRY - create a Chessboard base class
  //
  class Chessboard extends Backbone.View {

    initialize() {
      this.pieces = new Pieces(this)
    }

    render(fen) {
      if (fen.split(" ").length === 4) {
        fen += " 0 1"
      }
      this.renderFen(fen)
    }

    renderFen(fen) {
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
    }

    $getSquare(id) {
      return $("#msq-" + id)
    }

  }


  class MiniHoverBoard extends Backbone.View {

    get el() {
      return ".mini-hover-board"
    }

    initialize() {
      this.$hoverboard = this.$(".hover-board")
      this.board = new Chessboard({ el: this.$(".chessboard") })
      window.wtf = this.board
      this.listenToEvents()
    }

    listenToEvents() {
      this.listenTo(chess, "preview:hide", () => {
        this.hide()
      })
      this.listenTo(chess, "preview:show", () => {
        this.show()
      })
      this.listenTo(chess, "preview:i", (i) => {
        this.board.render(chess.get("positions")[i])
      })
    }

    show() {
      this.$hoverboard.removeClass("invisible")
    }

    hide() {
      this.$hoverboard.addClass("invisible")
    }

  }


  Components.MiniHoverBoard = MiniHoverBoard

}
