// The analysis info view under the board

{

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
      chess.analyzePosition(fen)
    }

    listenToEvents() {
      this.listenTo(chess, "change:i", (model, i) => {
        let fen = chess.get("positions")[i]
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
