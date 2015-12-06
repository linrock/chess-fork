// Modal for showing computer analysis move sequence
//
Components.ModalMoveList = Backbone.View.extend({

  el: ".modal-move-list",

  events: {
    "click .move" : "_gotoMove"
  },

  initialize: function() {
    this.$moves = this.$(".moves")
    this.listenToEvents()
  },

  listenToEvents: function() {
    this.listenTo(chess, "change:j", function(model, j) {
      let i = model.get("i")
      let moveNum = 1
    })
  },

  render: function(moves) {
    this.$moves.empty()
  },

  _gotoMove: function(e) {
    var j = $(e.currentTarget).data("ply")
  }

})
