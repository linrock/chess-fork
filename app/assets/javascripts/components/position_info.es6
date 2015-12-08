{

  class PositionMenu extends Backbone.View {

    get el() {
      return ".position-actions-menu"
    }

    get events() {
      return {
        "click .multi-pv" : "_multiPv",
        "click .depth-20" : "_depth20",
        "click .show-fen" : "_showFen"
      }
    }

    initialize() {
      this.listenForEvents()
    }

    listenForEvents() {
      this.listenTo(chess, "change:i", () => {
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
      this.hide()
    }

    _depth20() {
      this.hide()
    }

    _showFen() {
      this.hide()
      // TODO better way of showing the FEN string
      $(".position-description").addClass("small").text(chessboard.fen)
    }

  }



  class PositionInfo extends Backbone.View {

    get el() {
      return ".position-info"
    }

    get events() {
      return {
        "click .show-position-actions" : "_toggleMenu"
      }
    }

    initialize() {
      this.$positionDescription = this.$(".position-description")
      this.menu = new PositionMenu
      this.listenForEvents()
    }

    listenForEvents() {
      this.listenTo(chess, "change:i", (model, i) => {
        let prevI = i - 1
        if (prevI < 0) {
          this.$el.addClass("invisible")
          return
        }
        let moveStr = `${chess.getMovePrefix(prevI)} ${chess.get("moves")[prevI]}`
        this.$el.removeClass("invisible")
        this.$positionDescription.removeClass("small").text(moveStr)
      })
    }

    _toggleMenu() {
      this.menu.toggle()
    }

  }


  Components.PositionInfo = PositionInfo

}
