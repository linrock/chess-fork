// The set of action buttons under the move list

import Backbone from 'backbone'

import { world } from '../main'
import { chess } from '../chess_mechanism'

export default class ActionButtons extends Backbone.View {

  get el() {
    return ".actions"
  }

  get events() {
    return {
      "click .flip-board" : () => { chess.trigger("polarity:flip") },
      "click .first-move" : () => { chess.firstMove() },
      "click .prev-move"  : () => { chess.prevMove()  },
      "click .next-move"  : () => { chess.nextMove()  },
      "click .last-move"  : () => { chess.lastMove()  }
    }
  }

  initialize() {
    this.$moveActions = this.$(".move-actions")
    this.listenTo(world, "change:i", (model, i) => {
      if (i > 0) {
        this.$moveActions.removeClass("invisible")
      }
    })
  }
}
