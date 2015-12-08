// Mini hover board that shows up when hovering over
// the evaluation graph

{

  class MiniHoverBoard extends Backbone.View {

    get el() {
      return ".mini-hover-board"
    }

    initialize() {
      this.$hoverboard = this.$(".hover-board")
      this.listenToEvents()
    }

    listenToEvents() {
      this.listenTo(chess, "preview:hide", () => {
        this.hide()
      })
      this.listenTo(chess, "preview:show", () => {
        this.show()
      })
    }

    show() {
      this.$hoverboard.removeClass("invisible")
    }

    hide() {
      this.$hoverboard.addClass("invisible")
    }

  }


  Components.MiniHoverBoard = MiniHoverBoard

}
