// The chessboard, which reflects the current state of the
// chess mechanism
//
{

  // For handling the DOM elements of the pieces on the board
  //
  class Pieces {

    constructor(board) {
      this.board = board;
      this.$buffer = $("<div>").addClass("piece-buffer");
    }

    reset() {
      this.board.$(".piece").appendTo(this.$buffer);
    }
    
    $getPiece(piece) {
      var className = piece.color + piece.type;
      var $piece = this.$buffer.find("." + className).first();
      if ($piece.length) {
        return $piece;
      }
      return $("<img>").
        attr("src", `/assets/pieces/${className}.png`).
        addClass(`piece ${className}`);
    }

  }


  class PieceAnimator {

    constructor(board) {
      this.board = board;
    }

    // For figuring out what pieces on squares to move
    //
    positionDiffs(fen0, fen1) {
      let c0 = new Chess(fen0);
      let c1 = new Chess(fen1);
      let from = {};
      let to = {};
			_.each(c0.SQUARES, (sq) => {
        let [p0, p1] = [c0.get(sq), c1.get(sq)];
        if (_.isEqual(p0, p1)) {
          return;
        }
        if (!p0 && p1) {
          to[p1.color + p1.type] = sq;    // square was empty and piece moved to it
        } else if (!p1 && p0) {
          from[p0.color + p0.type] = sq;  // square moved from
        } else if (p0 && p1) {            // one piece captured another
          to[p1.color + p1.type] = sq;
        }
      });
      let moves = [];
      for (let i in from) {
        if (to[i]) {
          moves.push([from[i], to[i]]);
        }
      }
      return moves;
		}

    animatePositions(...positions) {
      let fen0 = positions[0];
      let fen1 = positions[1];

      console.log("fen0: " + fen0);
      console.log("fen1: " + fen1);

      let moves = this.positionDiffs(fen0, fen1);
      let pieces = [];

      for (let move of moves) {
        let from = move[0];
        let to = move[1];
        let o0 = this.board.$getSquare(from).offset();
        let o1 = this.board.$getSquare(to).offset();
        let top = o1.top - o0.top;
        let left = o1.left - o0.left;
        let movement = {
          left: (left > 0) ? `+=${left}px` : `-=${-left}px`,
          top: (top > 0) ? `+=${top}px` : `-=${-top}px`
        };
        console.log(movement);
        let $piece = this.board.$getSquare(from).find(".piece");
        pieces.push($piece);
        $piece.animate(movement, 120);
      }
      this.board.$(".piece:animated").promise().done(() => {
        for (let $piece of pieces) {
          $piece.removeAttr("style");
        }
        if (positions.length > 2) {
          chess.setFen(fen1);
          this.animatePositions(positions.slice(1,positions.length));
        } else {
          chess.setFen(fen1);
        }
      });
    }

  }


  window.PieceAnimator = PieceAnimator;

  Components.Chessboard = Backbone.View.extend({

    el: ".chessboard",

    initialize: function() {
      this.pieces = new Pieces(this);
      this.animator = new PieceAnimator(this);
      this.listenTo(chess, "change:fen", function(model, fen) {
        this.render(fen);
      });

      this.listenTo(chess, "change:i", function(model, i) {
        let positions = model.get("positions");
        let iPrev = model.previous("i");
        let prevFen = positions[iPrev];
        let newFen = positions[i];

        // let fen = positions[i - 1];
        // let c = new Chess(fen);
        // let move = c.move(model.get("moves")[i]);

        if (Math.abs(iPrev - i) === 1) {
          this.animatePositions(prevFen, newFen);
        } else {
          chess.setFen(newFen);
        }
      });

      this.listenTo(chess, "board:flip", this.flip);
    },

    render: function(fen) {
      if (fen.split(" ").length === 4) {
        fen += "0 1";
      }
      this.renderFen(fen);
      this.initDragDrop();
    },

    renderFen: function(fen) {
      var id, piece, $square;
      var columns = ['a','b','c','d','e','f','g','h'];
      var position = new Chess(fen);
      this.pieces.reset();
      for (var row = 8; row > 0; row--) {
        for (var j = 0; j < 8; j++) {
          id = columns[j] + row;
          piece = position.get(id);
          if (piece) {
            this.pieces.$getPiece(piece).appendTo(this.$getSquare(id));
          }
        }
      }
    },

    $getSquare: function(id) {
      return $("#" + id);
    },

    initDragDrop: _.once(function() {
      this.$(".piece").draggable({
        stack: ".piece",
        revert: true,
        revertDuration: 0
      });
      this.$(".square").droppable({
        accept: ".piece",
        tolerance: "pointer",
        drop: function(event, ui) {
          var move = {
            from: $(ui.draggable).parents(".square").attr("id"),
            to: $(event.target).attr("id")
          };
          chess.move(move);
        }
      });
    }),

    flip: function() {
      let topLeft = this.$(".square")[0].id;
      this.$el.find(".square").each((i,sq) => { this.$el.prepend(sq); });
    },

    animatePositions: function(...positions) {
      this.animator.animatePositions(...positions);
    }

  });

}
