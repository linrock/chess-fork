{

  class PositionMenu extends Backbone.View {

    get el() {
      return ".position-actions-menu"
    }

    get events() {
      return {
        "click .action"   : "hide",
        "click .multi-pv" : "_multiPv",
        "click .depth-20" : "_depth20",
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

    _depth20() {
    }

    _showFen() {
      // TODO better way of showing the FEN string
      $(".position-description").addClass("small").text(chessboard.fen)
    }

  }


  Components.PositionMenu = PositionMenu

}
