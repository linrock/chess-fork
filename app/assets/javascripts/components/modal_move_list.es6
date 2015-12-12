// Modal for showing computer analysis move sequence

{

  class ModalMoveList extends Backbone.View {

    get el() {
      return ".modal-move-list"
    }

    get events() {
      return {
        "click .modal-bg"    : "_closeModal",
        "click .close-modal" : "_closeModal",
        "click .move"        : "_gotoMove"
      }
    }

    initialize() {
      this.$engine = this.$(".engine-name")
      this.$moveList = this.$(".move-list")
      this.listenToEvents()
    }

    listenToEvents() {
      this.listenTo(chess, "change:mode", (model, mode) => {
        switch(mode) {
          case "normal":
            this.$el.addClass("invisible")
            break
          case "analysis":
            this.render()
            break
        }
      })
      this.listenTo(chess, "change:j", (model, j) => {
        if (j === -1) {
          return
        }
        this.$(".move").removeClass("current")
        $(this.$(".move[data-ply]")[j]).addClass("current")
      })
    }

    render() {
      this.$moveList.empty()
      let j = 0
      let plyNum = world.get("i")
      let moveNum = ~~ (plyNum / 2)
      let analysis = analysisCache.get(chess.getPosition(plyNum))
      let html = ''
      if (plyNum % 2 === 1) {
        moveNum += 1
        html += `<div class="move-num">${moveNum}.</div>
                 <div class="move">...</div>`
      }
      moveNum += 1
      for (let move of analysis.variations[0].moves) {
        if (plyNum % 2 === 0) {
          html += `<div class="move-num">${moveNum}.</div>`
          moveNum += 1
        }
        html += `<div class="move" data-ply="${plyNum}" data-j="${j}">${move}</div>`
        plyNum += 1
        j += 1
      }
      this.$moveList.html(html)
      this.$(".move[data-ply]").first().addClass("current")
      this.$engine.text(analysis.engine)
      this.$el.removeClass("invisible")
    }

    _closeModal() {
      chess.set({ mode: "normal" })
    }

    _gotoMove(e) {
      let j = $(e.currentTarget).data("j")
      chess.set({ j: j })
    }

  }


  Components.ModalMoveList = ModalMoveList

}
