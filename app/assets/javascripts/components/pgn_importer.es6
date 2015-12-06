// For handling the manual import of a chess game
//
Components.PgnImporter = Backbone.View.extend({

  el: ".pgn-importer",

  events: {
    "keyup textarea"   : "_validatePgn",
    "click .load-pgn"  : "_loadPgn"
  },

  initialize: function() {
    this.$textarea = this.$("textarea")
    this.$button = this.$(".load-pgn")
    this.$error = this.$(".invalid-pgn")
    this.validator = new Chess
    this.pgnIsValid = false
    this.listenTo(chess, "change:moves", function() {
      this.$el.hide()
    });
  },

  pgn: function() {
    return this.$textarea.val()
  },

  _validatePgn: function() {
    if (this.validator.load_pgn(this.pgn())) {
      this.pgnIsValid = true;
      this.$button.removeClass("invisible")
      this.$error.addClass("invisible")
    } else {
      this.pgnIsValid = false;
    }
  },

  _loadPgn: function() {
    if (!chess.loadPgn(this.pgn())) {
      this.$error.removeClass("invisible")
    }
  }

});
