// Handles fetching analysis from remote server + rendering it

{

  var uciToMove = function(uciMove) {
    var move = {
      from: uciMove.slice(0,2),
      to: uciMove.slice(2,4)
    }
    if (uciMove.length === 5) {
      move.promotion = uciMove[4]
    }
    return move
  }


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

    getRemote(fen) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: "/analysis",
          type: "POST",
          data: { fen: fen },
          dataType: "json",
          context: this,
          error: (xhr, status, error) => {
            reject(fen)
          },
          success: (data, status, xhr) => {
            data.san = (new Chess(fen)).move(uciToMove(data.bestmove)).san
            this.set(fen, data)
            resolve(data)
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
          this.getRemote(fen).then(resolve)
        }
      })
    }

  }


  var analysisCache = new AnalysisCache

  // The analysis view under the board
  //
  class AnalysisHandler extends Backbone.View {

    get el() {
      return ".suggested-moves"
    }

    get events() {
      return {
        "click .move" : "_enterAnalysisMode"
      }
    }

    initialize() {
      this.$move = this.$(".move")
      this.$evaluation = this.$(".evaluation")
      this.$source = this.$(".source")
      this.listenToEvents()
    }

    _enterAnalysisMode(event) {
      let fen = $(event.currentTarget).data("fen")
      console.log("Analysis mode - " + fen)
    }

    listenToEvents() {
      this.listenTo(chess, "change:fen", (model, fen) => {
        analysisCache.getAnalysis(fen).then(_.bind(this.render, this))
      })
    }

    render(analysis) {
      this.$el.removeClass("invisible")
      this.$move.
        text(chess.getMovePrefix() + " " + analysis.san).
        data("fen", analysis.fen)
      this.$evaluation.text(analysis.score)
      this.$source.text(analysis.engine + " - depth " + analysis.depth)
    }

  }


  Components.AnalysisHandler = AnalysisHandler

}
