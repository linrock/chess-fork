// Mini hover board that shows up when hovering over
// the evaluation graph

{

  // TODO DRY with the MainBoard version
  // Handles highlighting square on the board when positions change
  //
  class SquareHighlighter {

    constructor(board) {
      this.board = board
      this.colors = {
        "yellow":  ["#ffffcc", "#ffff66"]
      }
      this.listenForEvents()
    }

    listenForEvents() {
      this.board.listenTo(chess, "preview:i", (i) => {
        this.highlightGameMoveIndex(i)
      })
    }

    clearHighlights() {
      this.board.$(".square[style]").removeAttr("style")
    }

    highlightMove(move, color) {
      let colorCodes = this.colors[color]
      this.board.$getSquare(move.from).css({ background: colorCodes[0] })
      this.board.$getSquare(move.to).css({ background: colorCodes[1] })
    }

    highlightGameMoveIndex(i) {
      this.clearHighlights()
      if (i === 0) {
        return
      }
      let fen = chess.getPosition(i - 1)
      let c = new Chess(fen)
      let move = c.move(chess.getMoves(i - 1))
      this.highlightMove(move, "yellow")
    }

  }


  class MiniBoard extends Components.Chessboard {

    get sqPrefix() {
      return "msq"
    }

    initialize() {
      super.initialize()
      this.highlighter = new SquareHighlighter(this)
    }

  }


  class MiniHoverBoard extends Backbone.View {

    get el() {
      return ".mini-hover-board"
    }

    initialize() {
      this.$hoverboard = this.$(".hover-board")
      this.board = new MiniBoard({ el: this.$(".chessboard") })
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
        this.board.render(chess.getPosition(i))
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
