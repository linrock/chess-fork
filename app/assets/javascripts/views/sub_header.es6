{

  class SubHeader extends Backbone.View {

    get el() {
      return ".sub-header"
    }

    get events() {
      return {
        "click .reset-board" : "_resetBoard"
      }
    }

    _resetBoard() {
      world.trigger("reset")
    }

  }


  Views.SubHeader = SubHeader

}
