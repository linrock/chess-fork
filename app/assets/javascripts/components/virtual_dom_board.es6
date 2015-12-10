{

  class VirtualDomBoard extends Backbone.View {

    el() {
      return ".mini-hover-board"
    }

    initialize() {
      this.$board = this.$(".hover-board")
      this.position = new Chess
      this.moveColors = ["#ffffcc", "#ffff66"]
      this.listenForEvents()
    }

    listenForEvents() {
      this.listenTo(chess, "preview:i", (i) => {
        let fen = chess.get("positions")[i]
        let lastMove = this.getLastMove(i)
        this.render(fen, lastMove)
      })
      this.listenTo(chess, "preview:hide", () => {
        this.$board.addClass("invisible")
      })
      this.listenTo(chess, "preview:show", () => {
        this.$board.removeClass("invisible")
      })
    }

    getLastMove(i) {
      if (i === 0 ) {
        return
      }
      let fen = chess.get("positions")[i - 1]
      this.position.load(fen)
      let move = this.position.move(chess.get("moves")[i - 1])
      return move
    }

    getPiece(piece) {
      let className = piece.color + piece.type
      return m(`img.piece.${className}`, {
        src: `/assets/pieces/${className}.png`
      })
    }

    squaresFromFen(fen, lastMove) {
      this.position.load(fen)
      let i = 0
      let squares = []
      let polarities = ['light', 'dark']
      for (let row of [8, 7, 6, 5, 4, 3, 2, 1]) {
        for (let col of ['a','b','c','d','e','f','g','h']) {
          let id = col + row
          let pieces = []
          let piece = this.position.get(id)
          if (piece) {
            pieces.push(this.getPiece(piece))
          }
          let style = {}
          if (lastMove) {
            if (lastMove.from === id) {
              style = { style: { background: this.moveColors[0] } }
            } else if (lastMove.to === id) {
              style = { style: { background: this.moveColors[1] } }
            }
          }
          squares.push(m(`div.square.${polarities[i % 2]}`, style, pieces))
          i += 1
        }
        i += 1
      }
      return squares
    }

    render(fen, lastMove) {
      m.render(this.$board[0], m(".chessboard", this.squaresFromFen(fen, lastMove)))
    }

  }


  Components.VirtualDomBoard = VirtualDomBoard

}
