// Handles fetching analysis for a sequence of positions

{

  class AnalysisSequencer extends Backbone.Model {

    initialize() {
      this.listenForEvents()
    }

    listenForEvents() {
      this.listenTo(chess, "game:loaded", () => {
        let positions = world.get("positions").toArray()
        this.analyzePositionsSequentially(positions)
      })
    }

    analyzePositionsSequentially(positions) {
      let fen = positions.shift()
      if (!fen) {
        return
      }
      let analysis = analysisCache.get(fen)
      if (analysis) {
        this.analyzePositionsSequentially(positions)
      } else {
        analysisCache.getAnalysis(fen).then(() => {
          this.analyzePositionsSequentially(positions)
        })
      }
    }

  }

  Models.AnalysisSequencer = AnalysisSequencer

}
