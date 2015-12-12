// The analysis view under the board

{

  class IntroMessage extends Backbone.View {

    get el() {
      return ".intro-message"
    }

    initialize() {
      this.listenTo(world, "change:i", (model, i) => {
        this.$el.fadeOut(50)
      })
      $(() => { this.$el.removeClass("invisible") })
    }

  }


  Views.IntroMessage = IntroMessage

}
