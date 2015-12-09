// The chessboard, which reflects the current state of the
// chess mechanism

{

  // For handling animation of pieces on the board
  //
  class PieceAnimator {

    constructor(board) {
      this.board = board
      this.listenForEvents()
    }

    listenForEvents() {
      this.board.listenTo(chess, "change:i", (model, i) => {
        let positions = model.get("positions")
        let iPrev = model.previous("i")
        let prevFen = positions[iPrev]
        let newFen = positions[i]
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
        let jPrev = chess.previous("j")
        let prevFen = chess.mechanism.fen()
        let newFen = chess.get("analysis").variations[0].positions[j + 1]
        if (j === 0) {
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
          this.animatePositions(positions.slice(1,positions.length))
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


  // Handles highlighting square on the board when positions change
  //
  class SquareHighlighter {

    constructor(board) {
      this.board = board
      this.colors = {
        "yellow":  ["#ffffcc", "#ffff66"],     // game moves
        "blue":    ["#eeffff", "#bbffff"]      // analysis moves
      }
      this.listenForEvents()
    }

    listenForEvents() {
      this.board.listenTo(chess, "change:i", (model, i) => {
        this.highlightGameMoveIndex(i)
      })
      this.board.listenTo(chess, "change:j", (model, j) => {
        if (j === -1) {
          return
        }
        this.clearHighlights()
        let fen = chess.get("analysis").variations[0].positions[j]
        let c = new Chess(fen)
        let move = c.move(chess.get("analysis").variations[0].moves[j])
        this.highlightMove(move, "blue")
      })
      this.board.listenTo(chess, "change:mode", (model, mode) => {
        if (mode === "normal") {
          this.highlightGameMoveIndex(chess.get("i"))
        }
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
      let fen = chess.get("positions")[i - 1]
      let c = new Chess(fen)
      let move = c.move(chess.get("moves")[i - 1])
      this.highlightMove(move, "yellow")
    }

  }


  // Point and click pieces to select and move them
  //
  class PointAndClick {

    constructor(board) {
      this.board = board
      this.selectedSquare = false
      this.listenForEvents()
    }

    listenForEvents() {
      this.board.$el.on("click", ".square", (event) => {
        let square = $(event.currentTarget)[0].id
        this.selectSquare(square)
      })
      this.board.listenTo(chess, "change:i", () => { this.clearSelected() })
    }

    selectSquare(square) {
      if (this.selectedSquare && square != this.selectedSquare) {
        this.board.move({ from: this.selectedSquare, to: square  })
        this.clearSelected()
      } else {
        this.selectedSquare = square
      }
    }

    clearSelected() {
      this.selectedSquare = false
    }

  }


  // Drag and drop pieces to move them
  //
  class DragAndDrop {

    constructor(board) {
      this.board = board
      this.initialized = false
    }

    init() {
      if (this.initialized) {
        return
      }
      this.initDraggable()
      this.initDroppable()
      this.initialized = true
    }

    initDraggable() {
      this.board.$(".piece").draggable({
        stack: ".piece",
        distance: 5,
        revert: true,
        revertDuration: 0
      })
    }

    initDroppable() {
      this.board.$(".square").droppable({
        accept: ".piece",
        tolerance: "pointer",
        drop: (event, ui) => {
          this.board.move({
            from: $(ui.draggable).parents(".square").data("square"),
            to: $(event.target).data("square"),
          })
        }
      })
    }

  }


  // Base chessboard class with position rendering behavior
  // and more behaviors built through composition
  //
  class MainBoard extends Components.Chessboard {

    get el() {
      return ".main-board"
    }

    get sqPrefix() {
      return "sq"
    }

    initialize() {
      super.initialize()
      this.animator = new PieceAnimator(this)
      this.highlighter = new SquareHighlighter(this)
      this.pointAndClick = new PointAndClick(this)
      this.dragAndDrop = new DragAndDrop(this)
      this.listenForEvents()
    }

    afterRender() {
      this.dragAndDrop.init()
    }

    listenForEvents() {
      this.listenTo(chess, "change:fen", (model, fen) => {
        this.render(fen)
      })
      this.listenTo(chess, "board:flip", this.flip)
    }

    move(move) {
      move.promotion = move.promotion || "q"
      chess.move(move)
    }

    flip() {
      // let topLeft = this.$(".square")[0].id
      this.$el.find(".square").each((i,sq) => { this.$el.prepend(sq) })
    }

  }


  Components.MainBoard = MainBoard

}
