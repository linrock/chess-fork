{

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
      this.menu = new Components.PositionMenu
      this.listenForEvents()
    }

    listenForEvents() {
      this.listenTo(world, "change:i", (model, i) => {
        let prevI = i - 1
        if (prevI < 0) {
          this.$el.addClass("invisible")
          return
        }
        let moveStr = `${chess.getMovePrefix(prevI)} ${chess.getMoves(prevI)}`
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
