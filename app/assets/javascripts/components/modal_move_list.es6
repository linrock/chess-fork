// Modal for showing computer analysis move sequence
//
Components.ModalMoveList = Backbone.View.extend({

  el: ".modal-move-list",

  events: {
    "click .modal-bg" : "_closeModal",
    "click .move"     : "_gotoMove"
  },

  initialize: function() {
    this.$moves = this.$(".moves")
    this.listenToEvents()
  },

  listenToEvents: function() {
    this.listenTo(chess, "mode:analysis", (model) => {
      let i = model.get("i")
      let moveNum = 1
      let analysis = analysisCache.get(model.get("positions")[i])
      console.log("WTF")
      this.$el.removeClass("invisible")
    })
  },

  render: function(moves) {
    this.$moves.empty()
  },

  _closeModal: function() {
    this.$el.addClass("invisible")
  },

  _gotoMove: function(e) {
    var j = $(e.currentTarget).data("ply")
  }

})
