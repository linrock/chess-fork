// Handles fetching analysis from remote server + rendering it

{

  class AnalysisCache {

    constructor() {
      this.analysis = {}
    }

    get(fen) {
      return this.analysis[fen]
    }

    set(fen, analysis) {
      this.analysis[fen] = analysis
    }

    remoteGet(fen) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: "/analysis",
          type: "POST",
          data: { fen: fen },
          dataType: "json",
          context: this,
          success: (data, status, xhr) => {
            data.fen = fen
            data.san = (new Chess(fen)).move(this.uciToMove(data.bestmove)).san
            data = _.extend(data, this.calcMovesAndPositions(fen, data.sequence))
            this.set(fen, data)
            resolve(data)
          },
          error: (xhr, status, error) => {
            reject(fen)
          }
        })
      })
    }

    notifyAnalysis(analysis) {
      chess.trigger("change:analysis", analysis)
      return analysis
    }

    getAnalysis(fen) {
      return new Promise((resolve, reject) => {
        let analysis = analysisCache.get(fen)
        if (analysis) {
          resolve(analysis)
        } else {
          this.remoteGet(fen).then(this.notifyAnalysis).then(resolve)
        }
      })
    }

    uciToMove(uciMove) {
      let move = {
        from: uciMove.slice(0,2),
        to: uciMove.slice(2,4)
      }
      if (uciMove.length === 5) {
        move.promotion = uciMove[4]
      }
      return move
    }

    // TODO lazy calculate this using a generator
    //
    calcMovesAndPositions(fen, sequence) {
      let c = new Chess(fen)
      let moves = []
      let positions = [fen]
      for (let uciMove of sequence.split(/\s+/)) {
        let move = c.move(this.uciToMove(uciMove))
        moves.push(move.san)
        positions.push(c.fen())
      }
      return {
        moves: moves,
        positions: positions,
        n: moves.length
      }
    }

    sequenceToSanList(fen, sequence) {
      let c = new Chess(fen)
      let moves = []
      for (let uciMove of sequence.split(/\s+/)) {
        let move = c.move(this.uciToMove(uciMove))
        moves.push(move.san)
      }
      return moves
    }

  }


  Components.AnalysisCache = AnalysisCache

}
