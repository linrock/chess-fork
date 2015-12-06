// Clickable list of moves that represent the state
// of the game
//
Components.MoveList = Backbone.View.extend({

  el: ".move-list",

  events: {
    "click .move" : "_gotoMove"
  },

  initialize: function() {
    this.listenTo(chess, "change:moves", function(model, moves) {
      this.render(moves)
    })
    this.listenTo(chess, "change:i", function(model, i) {
      this.$(".move").removeClass("current")
      if (i === 0) {
        return
      }
      this.$(`[data-ply="${i}"]`).addClass("current")
    })
  },

  render: function(moves) {
    this.$el.empty()
    var moveNum = 1
    var plyNum = 1
    var html = ''
    _.each(moves, function(move) {
      if (plyNum % 2 === 1) {
        html += `<div class="move-num">${moveNum}.</div>`
        moveNum++
      }
      html += `<div class="move" data-ply="${plyNum}">${move}</div>`
      plyNum++
    })
    this.$el.html(html)
  },

  _gotoMove: function(e) {
    var i = $(e.currentTarget).data("ply")
    chess.setPositionIndex(i)
  }

})
