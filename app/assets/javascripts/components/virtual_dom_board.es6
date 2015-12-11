{

  class VirtualDomBoard extends Backbone.View {

    el() {
      return ".mini-hover-board"
    }

    initialize() {
      this.ROWS = [8, 7, 6, 5, 4, 3, 2, 1]
      this.COLS = ['a','b','c','d','e','f','g','h']
      this.$board = this.$(".hover-board")
      this.board = this.$board[0]
      this.moveColors = ["#ffffcc", "#ffff66"]
      this.position = new Chess
      this.listenForEvents()
    }

    listenForEvents() {
      this.listenTo(chess, "preview:i", (i) => {
        let fen = chess.get("positions")[i]
        if (!fen) {
          return
        }
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
      if (i === 0) {
        return
      }
      this.position.load(chess.get("positions")[i - 1])
      return this.position.move(chess.getMoves(i - 1))
    }

    getPiece(piece) {
      let className = piece.color + piece.type
      return m(`img.piece.${className}`, {
        src: `/assets/pieces/${className}.png`
      })
    }

    vSquaresFromFen(fen, highlights) {
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
            style.style = { background: highlights[id] }
          }
          squares.push(m(`div.square.${polarities[i % 2]}`, style, pieces))
          i += 1
        }
        i += 1
      }
      return squares
    }

    render(fen, lastMove) {
      let highlights = {}
      if (lastMove) {
        highlights[lastMove.from] = this.moveColors[0]
        highlights[lastMove.to] = this.moveColors[1]
      }
      m.render(this.board, m(".chessboard", this.vSquaresFromFen(fen, highlights)))
    }

  }


  Components.VirtualDomBoard = VirtualDomBoard

}
