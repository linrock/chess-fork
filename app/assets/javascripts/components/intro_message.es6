{

  // The analysis view under the board
  //
  class IntroMessage extends Backbone.View {

    get el() {
      return ".intro-message"
    }

    initialize() {
      this.listenTo(chess, "change:i", (model, i) => {
        this.$el.fadeOut()
      })
    }

  }


  Components.IntroMessage = IntroMessage

}
