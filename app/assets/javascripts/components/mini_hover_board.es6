// Mini hover board that shows up when hovering over
// the evaluation graph

{

  class MiniBoard extends Components.Chessboard {

    get sqPrefix() {
      return "msq"
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
