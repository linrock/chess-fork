// Handles the internal state of chess positions/history
// Also functions as an event dispatcher

{

  class ChessMechanism extends Backbone.Model {

    initialize() {
      this.mechanism = new Chess
      this.set({
        i: -1,
        j: -1,
        mode: "normal",
        moves: [],
        positions: [this.mechanism.fen()]
      })
      this.listenToEvents()
    }

    listenToEvents() {
      this.listenTo(this, "change:i", () => {
        if (this.get("j") >= 0) {
          this.set({ mode: "normal" })
        }
      })
      this.listenTo(this, "change:mode", (model, mode) => {
        if (mode === "normal") {
          this.setFen(this.get("positions")[this.get("i")])
          this.set({ j: -1 })
        } else if (mode === "analysis") {
          this.set({ j: 0 })
        }
      })
    }

    setFen(fen) {
      this.set({ fen: fen })
    }

    start() {
      this.setFen(this.mechanism.fen())
    }

    move(move) {
      let moves = this.get("moves").slice(0, this.get("i"))
      let c = new Chess
      for (let m of moves) {
        c.move(m)
      }
      if (!c.move(move)) {
        return
      }
      this.mechanism = c
      this.setFen(c.fen())
      this.updatePositions(c.history())
      let i = this.get("i")
      if (i < 0) {
        this.set({ i: 1 })
      } else {
        this.set({ i: i + 1 })
      }
    }

    updatePositions(moves) {
      let c = new Chess
      let positions = [c.fen()]
      for (let move of moves) {
        c.move(move)
        positions.push(c.fen())
      }
      this.set({
        moves: moves,
        positions: positions
      })
    }

    analyzePosition(fen) {
      let analysis = analysisCache.get(fen)
      if (!analysis) {
        return;
      }
      this.set({ j: 0, analysis: analysis, mode: "analysis" })
    }

    getMovePrefix() {
      let nMoves = this.get("i")
      let moveNum = 1 + ~~(nMoves / 2)
      return moveNum + (nMoves % 2 == 0 ? "." : "...")
    }

    loadPgn(pgn) {
      if (!this.mechanism.load_pgn(pgn)) {
        return false
      }
      this.updatePositions(this.mechanism.history())
      this.setPositionIndex(1)
      return true
    }

    firstMove() {
      this.setPositionIndex(1)
    }

    prevMove() {
      this.setPositionIndex(this.get("i") - 1)
    }

    nextMove() {
      this.setPositionIndex(this.get("i") + 1)
    }

    lastMove() {
      this.setPositionIndex(this.get("positions").length - 1)
    }

    setPositionIndex(i) {
      if (this.get("mode") === "analysis") {
        this.set({ mode: "normal" })
        return
      }
      if (i < 0 || i >= this.get("positions").length) {
        return
      }
      this.set({ i: i })
    }

    prevEngineMove() {
      this.setEnginePositionIndex(this.get("j") - 1)
    }

    nextEngineMove() {
      this.setEnginePositionIndex(this.get("j") + 1)
    }

    setEnginePositionIndex(j) {
      if (this.get("mode") === "normal" && j >= 0) {
        this.analyzePosition(this.get("positions")[this.get("i")])
        return
      }
      if (j >= this.get("analysis").n) {
        return
      }
      if (j < 0) {
        this.set({ mode: "normal" })
        return
      }
      this.set({ j: j })
    }

  }


  Components.ChessMechanism = ChessMechanism

}
