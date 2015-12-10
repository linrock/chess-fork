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

    remoteGet(fen, options = {}) {
      options.fen = fen
      return new Promise((resolve, reject) => {
        $.ajax({
          url: "/analysis",
          type: "POST",
          data: options,
          dataType: "json",
          context: this,
          success: (data, status, xhr) => {
            data.fen = fen
            for (let i in data.variations) {
              let variation = data.variations[i]
              let formatted = this.calcMovesAndPositions(fen, variation.sequence)
              data.variations[i] = _.extend(variation, formatted)
            }
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

    getAndCacheAnalysis(fen) {
      this.getAnalysis(fen).then((analysis) => {
        analysisCache.set(fen, analysis)
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
      for (let uciMove of sequence) {
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
      for (let uciMove of sequence) {
        let move = c.move(this.uciToMove(uciMove))
        moves.push(move.san)
      }
      return moves
    }

  }


  Components.AnalysisCache = AnalysisCache

}
