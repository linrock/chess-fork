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
            data.moves = this.sequenceToSanList(fen, data.sequence)
            this.set(fen, data)
            resolve(data)
          },
          error: (xhr, status, error) => {
            reject(fen)
          }
        })
      })
    }

    getAnalysis(fen) {
      return new Promise((resolve, reject) => {
        let analysis = analysisCache.get(fen)
        if (analysis) {
          resolve(analysis)
        } else {
          this.remoteGet(fen).then(resolve)
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
