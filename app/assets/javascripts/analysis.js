$(function() {


  var ChessState = Backbone.Model.extend({

    initialize: function() {
      this.mechanism = new Chess;
    },

    start: function() {
      this.set({ fen: this.mechanism.fen() });
    },

    getPieceAt: function(id) {
      return this.mechanism.get(id);
    }

  });

  var chess = window.chess = new ChessState();


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


  new Chessboard;
  chess.start();

});
