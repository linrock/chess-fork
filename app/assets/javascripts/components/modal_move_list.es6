// Modal for showing computer analysis move sequence

{

  class ModalMoveList extends Backbone.View {

    get el() {
      return ".modal-move-list"
    }

    get events() {
      return {
        "click .modal-bg" : "_closeModal",
        "click .move"     : "_gotoMove"
      }
    }

    initialize() {
      this.$moveList = this.$(".move-list")
      this.listenToEvents()
    }

    listenToEvents() {
      this.listenTo(chess, "mode:analysis", () => {
        this.render()
      })
      this.listenTo(chess, "change:i", () => {
        this._closeModal()
      })
    }

    render() {
      this.$moveList.empty()
      let plyNum = chess.get("i")
      let moveNum = ~~ (plyNum / 2)
      let analysis = analysisCache.get(chess.get("positions")[plyNum])
      let html = ''
      if (plyNum % 2 === 1) {
        moveNum += 1
        html += `<div class="move-num">${moveNum}.</div>`
        html += `<div class="move">...</div>`
      }
      moveNum += 1
      for (let move of analysis.moves) {
        if (plyNum % 2 === 0) {
          html += `<div class="move-num">${moveNum}.</div>`
          moveNum += 1
        }
        html += `<div class="move" data-ply="${plyNum}">${move}</div>`
        plyNum++
      }
      this.$moveList.html(html)
      this.$el.removeClass("invisible")
    }

    _closeModal() {
      this.$el.addClass("invisible")
    }

    _gotoMove(e) {
      let j = $(e.currentTarget).data("ply")
    }

  }


  Components.ModalMoveList = ModalMoveList

}
