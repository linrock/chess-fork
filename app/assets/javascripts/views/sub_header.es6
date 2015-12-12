{

  class SubHeader extends Backbone.View {

    get el() {
      return ".sub-header"
    }

    get events() {
      return {
        "click .reset-board" : "_resetBoard",
        "click .undo"        : "_undo"
      }
    }

    _resetBoard() {
      world.trigger("reset")
    }

    _undo() {
      world.rewind()
    }

  }


  Views.SubHeader = SubHeader

}
