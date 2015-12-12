// For handling the manual import of a chess game

{

  class PgnImporter extends Backbone.View {

    get el() {
      return ".pgn-importer"
    }

    get events() {
      return {
        "keyup textarea"   : "_validatePgn",
        "click .load-pgn"  : "_loadPgn"
      }
    }

    initialize() {
      this.$textarea = this.$("textarea")
      this.$button = this.$(".load-pgn")
      this.$error = this.$(".invalid-pgn")
      this.validator = new Chess
      this.pgnIsValid = false
      this.listenTo(world, "change:moves", (model, moves) => {
        if (moves.size === 0) {
          this.$el.show()
        } else {
          this.$el.hide()
        }
      })
    }

    pgn() {
      return this.$textarea.val()
    }

    correctPgn(pgn) {
      return $.trim(pgn).replace("0-0-0", "O-O-O").replace("0-0", "O-O").
        replace("‒", "-").
        replace("–", "-").
        replace("½-½", "1/2-1/2").
        replace("0.5-0.5", "1/2-1/2")
    }

    _validatePgn() {
      if (this.validator.load_pgn(this.correctPgn(this.pgn()))) {
        this.pgnIsValid = true
        this.$button.removeClass("invisible")
        this.$error.addClass("invisible")
      } else {
        this.pgnIsValid = false
      }
    }

    _loadPgn() {
      if (!chess.loadPgn(this.pgn())) {
        this.$error.removeClass("invisible")
      }
    }

  }


  Views.PgnImporter = PgnImporter

}
