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
      this.listenForEvents()
    }

    _enterAnalysisMode(event) {
      let fen = $(event.currentTarget).data("fen")
      chess.analyzePosition(fen)
    }

    listenForEvents() {
      this.listenTo(chess, "change:i", (model, i) => {
        if (i === 0) {
          this.$el.addClass("invisible")
          return
        }
        let fen = chess.get("positions")[i]
        analysisCache.getAnalysis(fen).then(_.bind(this.render, this))
      })
    }

    render(analysis) {
      if (!analysis.san) {
        this.renderGameOver()
        return
      }
      this.show()
      this.$move.
        text(chess.getMovePrefix(chess.get("i")) + " " + analysis.san).
        data("fen", analysis.fen)
      this.$evaluation.text(analysis.score)
      this.$source.text(analysis.engine + " - depth " + analysis.depth)
    }

    // TODO render a message saying the state of the game if it's over
    renderGameOver() {
      this.hide()
    }

    show() {
      this.$el.removeClass("invisible")
    }

    hide() {
      this.$el.addClass("invisible")
    }

  }


  Components.AnalysisHandler = AnalysisHandler

}
