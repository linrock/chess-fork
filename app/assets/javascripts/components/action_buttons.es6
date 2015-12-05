// The set of action buttons under the move list
//
Components.ActionButtons = Backbone.View.extend({

  el: ".actions",

  events: {
    "click .flip-board" : "_flipBoard",
    "click .first-move" : "_firstMove",
    "click .prev-move"  : "_prevMove",
    "click .next-move"  : "_nextMove",
    "click .last-move"  : "_lastMove",
  },

  _flipBoard: () => { chess.trigger("board:flip"); },

  _firstMove: () => { chess.firstMove(); },

  _prevMove: () => { chess.prevMove(); },

  _nextMove: () => { chess.nextMove(); },

  _lastMove: () => { chess.lastMove(); }

});
