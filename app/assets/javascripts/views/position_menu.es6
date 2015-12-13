{

  class PositionMenu extends Backbone.View {

    get el() {
      return ".position-actions-menu"
    }

    get events() {
      return {
        "click .action"   : "hide",
        "click .multi-pv" : "_multiPv",
        "click .depth-20" : "_deeperAnalysis",
        "click .show-fen" : "_showFen"
      }
    }

    initialize() {
      this.listenForEvents()
    }

    listenForEvents() {
      this.listenTo(world, "change:i", () => {
        this.hide()
      })
    }

    hide() {
      this.$el.addClass("invisible")
    }

    toggle() {
      this.$el.toggleClass("invisible")
    }

    _multiPv() {
      analysisCache.remoteGet(chessboard.fen, { multipv: 3 }).then((analysis) => {
        analysisCache.notifyAnalysis(analysis)
      })
    }

    _deeperAnalysis() {
      analysisCache.remoteGet(chessboard.fen, { depth: 16 }).then((analysis) => {
        analysisCache.notifyAnalysis(analysis)
      })
    }

    _showFen() {
      // TODO better way of showing the FEN string
      $(".position-description").addClass("fen").text(chessboard.fen)
    }

  }


  Views.PositionMenu = PositionMenu

}
