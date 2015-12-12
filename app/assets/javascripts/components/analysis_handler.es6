// The analysis info view under the board

{

  class AnalysisHandler extends Backbone.View {

    get el() {
      return ".suggested-moves"
    }

    get moveTemplate() {
      return _.template(`
        <div class="move-row">
          <div class="move engine-move" data-fen="<%= fen %>">
            <%= move %>
          </div>
          <div class="evaluation"><%= evaluation %></div>
          <div class="source">
            <%= engine %> &ndash; depth <%= depth %>
          </div>
        </div>
      `)
    }

    get events() {
      return {
        "click .move" : "_enterAnalysisMode"
      }
    }

    initialize() {
      this.$moves = this.$(".moves")
      this.listenForEvents()
    }

    _enterAnalysisMode(event) {
      let fen = $(event.currentTarget).data("fen")
      chess.analyzePosition(fen)
    }

    listenForEvents() {
      this.listenTo(world, "change:i", (model, i) => {
        if (i <= 0) {
          this.$el.addClass("invisible")
          return
        }
        let fen = chess.getPosition(i)
        let analysis = analysisCache.get(fen)
        if (analysis) {
          this.render(analysis)
        } else {
          analysisCache.getAnalysis(fen)
        }
      })
      this.listenTo(chess, "change:analysis", (analysis) => {
        if (chessboard.fen == analysis.fen) {
          this.render(analysis)
        }
      })
    }

    render(analysis) {
      if (!analysis.variations[0].moves[0]) {
        this.renderGameOver()
        return
      }
      let variations = _.sortBy(analysis.variations, (variation) => {
        return variation.multipv
      })
      let html = ''
      for (let variation of variations) {
        html += this.moveTemplate({
          fen: analysis.fen,
          move: `${chess.getMovePrefix(world.get("i"))} ${variation.moves[0]}`,
          evaluation: variation.score,
          engine: analysis.engine,
          depth: variation.depth
        })
      }
      this.show()
      this.$moves.html(html)
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
