$(function() {


  // Handling the internal state of chess positions/history
  //
  var ChessMechanism = Backbone.Model.extend({

    initialize: function() {
      this.mechanism = new Chess;
    },

    start: function() {
      this.set({ fen: this.mechanism.fen() });
    },

    loadPgn: function(pgn) {
      return this.mechanism.load_pgn(pgn);
    },

    getPieceAt: function(id) {
      return this.mechanism.get(id);
    }

  });


  // For handling the DOM elements of the pieces on the board
  //
  var Pieces = function(board) {
    this.board = board;
    this.$buffer = $("<div>").addClass("piece-buffer");

    this.reset = function() {
      this.board.$(".piece").appendTo(this.$buffer);
    };

    this.$getPiece = function(piece) {
      var className = piece.color + piece.type;
      var $piece = this.$buffer.find("." + className).first();
      if ($piece.length) {
        return $piece;
      }
      return $("<img>").
        attr("src", "/assets/pieces/" + className + ".png").
        addClass("piece " + className);
    };

  };


  // The chessboard, which reflects the current state of the
  // chess mechanism
  //
  var Chessboard = Backbone.View.extend({

    el: ".chessboard",

    initialize: function() {
      this.pieces = new Pieces(this);
      this.listenTo(chess, "change:fen", function(model, fen) {
        this.render(fen);
      });
    },

    render: function(fen) {
      if (fen.split(" ").length === 4) {
        fen += "0 1";
      }
      this.renderFen(fen);
    },

    renderFen: function(fen) {
      var id, piece, $square;
      var columns = ['a','b','c','d','e','f','g','h'];
      this.pieces.reset();
      for (var row = 8; row > 0; row--) {
        for (var j = 0; j < 8; j++) {
          id = columns[j] + row;
          piece = chess.getPieceAt(id);
          if (piece) {
            this.pieces.$getPiece(piece).appendTo(this.$getSquare(id));
          }
        }
      }
    },

    $getSquare: function(id) {
      return $("#" + id);
    }

  });


  // For handling the manual import of a chess game
  //
  var PgnImporter = Backbone.View.extend({

    el: ".pgn-importer",

    events: {
      "keyup textarea"   : "_validatePgn",
      "click .load-pgn"  : "_loadPgn"
    },

    initialize: function() {
      this.$textarea = this.$("textarea");
      this.$button = this.$(".load-pgn");
      this.validator = new Chess;
    },

    pgn: function() {
      return this.$textarea.val();
    },

    _validatePgn: function() {
      if (this.validator.load_pgn(this.pgn())) {
        this.$button.removeClass("invisible");
      } else {
        this.$button.addClass("invisible");
      }
    },

    _loadPgn: function() {
      if (chess.loadPgn(this.pgn())) {
        this.$el.hide();
      }
    }

  });


  var MoveList = Backbone.View.extend({

    el: ".move-list",

  });


  var ActionButtons = Backbone.View.extend({

    el: ".actions",

    events: {
      "click .first-move" : "_firstMove",
      "click .prev-move"  : "_prevMove",
      "click .next-move"  : "_nextMove",
      "click .last-move"  : "_lastMove",
    },

    _firstMove: function() {

    },

    _prevMove: function() {

    },

    _nextMove: function() {

    },

    _lastMove: function() {

    }

  });


  var chess = window.chess = new ChessMechanism;
  var chessboard = window.chessboard = new Chessboard;
  chess.start();

  new PgnImporter;
  new ActionButtons;

});
