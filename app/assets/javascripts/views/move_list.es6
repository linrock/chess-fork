// Clickable list of moves that represent the state
// of the game

{

  class MoveList extends Backbone.View {

    get el() {
      return ".game-move-list"
    }

    get events() {
      return {
        "click .move" : "_gotoMove"
      }
    }

    initialize() {
      this.$moveList = this.$(".move-list")
      this.listenToEvents()
    }

    listenToEvents() {
      this.listenTo(world, "change:moves", (model, moves) => {
        this.render(moves)
      })
      this.listenTo(world, "change:i", (model, i) => {
        this.$(".move").removeClass("current")
        if (i <= 0) {
          return
        }
        this.$(`[data-ply="${i}"]`).addClass("current")
      })
    }

    render(moves) {
      this.$moveList.empty()
      let moveNum = 1
      let plyNum = 1
      let html = ''
      for (let move of moves) {
        if (plyNum % 2 === 1) {
          html += `<div class="move-num">${moveNum}. </div>`
          moveNum++
        }
        html += `<div class="move" data-ply="${plyNum}">${move} </div>`
        plyNum++
      }
      this.$moveList.html(html)
    }

    _gotoMove(e) {
      let i = $(e.currentTarget).data("ply")
      chess.setPositionIndex(i)
    }

  }


  Views.MoveList = MoveList

}
