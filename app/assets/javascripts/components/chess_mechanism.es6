// Handling the internal state of chess positions/history
//
Components.ChessMechanism = Backbone.Model.extend({

  initialize: function() {
    this.mechanism = new Chess;
    this.set({
      i: 0,
      moves: [],
      positions: [this.mechanism.fen()]
    });
  },

  setFen: function(fen) {
    this.set({ fen: fen });
  },

  start: function() {
    this.setFen(this.mechanism.fen());
  },

  move: function(move) {
    var moves = this.get('moves').slice(0, this.get("i"));
    var c = new Chess;
    var positions = [c.fen()];
    _.each(moves, function(move) {
      c.move(move);
      positions.push(c.fen());
    });
    var nextMove = c.move(move);
    if (!nextMove) {
      return;
    }
    moves.push(nextMove.san);
    this.mechanism = c;
    this.setFen(c.fen());
    this.updatePositions(c.history());
    this.set({ i: this.get("i") + 1 });
  },

  // TODO DRY usage of new chess instance to generate a
  // different state and position set
  //
  updatePositions: function(moves) {
    var c = new Chess;
    var positions = [c.fen()];
    _.each(moves, function(move) {
      c.move(move);
      positions.push(c.fen());
    });
    this.set({
      moves: moves,
      positions: positions
    });
  },

  getMovePrefix: function() {
    var nMoves = this.get("i");
    var moveNum = 1 + ~~(nMoves / 2);
    return moveNum + (nMoves % 2 == 0 ? "." : "...");
  },

  loadPgn: function(pgn) {
    if (!this.mechanism.load_pgn(pgn)) {
      return false;
    }
    this.updatePositions(this.mechanism.history());
    this.firstMove();
    return true;
  },

  firstMove: function() {
    this.setPositionIndex(0);
  },

  prevMove: function() {
    this.setPositionIndex(this.get("i") - 1);
  },

  nextMove: function() {
    this.setPositionIndex(this.get("i") + 1);
  },

  lastMove: function() {
    this.setPositionIndex(this.get("positions").length - 1);
  },

  setPositionIndex: function(i) {
    if (i < 0 || i >= this.get("positions").length) {
      return;
    }
    this.set({ i: i });
  }

});
