// For handling the manual import of a chess game

import * as Backbone from 'backbone'
import Chess from 'chess.js'

import { PGN } from '../types'
import { world } from '../main'
import { chess } from '../chess_mechanism'

export default class PgnImporter extends Backbone.View<Backbone.Model> {
  private $textarea: JQuery
  private $button: JQuery
  private $error: JQuery
  private validator: Chess
  private pgnIsValid: boolean

  get el() {
    return ".pgn-importer"
  }

  events(): Backbone.EventsHash {
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

  pgnInput(): string {
    return <string>this.$textarea.val()
  }

  correctPgn(pgn: string): PGN {
    return pgn.trim().replace("0-0-0", "O-O-O").replace("0-0", "O-O").
      replace("‒", "-").
      replace("–", "-").
      replace("½-½", "1/2-1/2").
      replace("0.5-0.5", "1/2-1/2")
  }

  _validatePgn() {
    if (this.validator.load_pgn(this.correctPgn(this.pgnInput()))) {
      this.pgnIsValid = true
      this.$button.removeClass("invisible")
      this.$error.addClass("invisible")
    } else {
      this.pgnIsValid = false
    }
  }

  _loadPgn() {
    if (chess.loadPgn(this.correctPgn(this.pgnInput()))) {
      this.$textarea.val("")
    } else {
      this.$error.removeClass("invisible")
    }
  }
}
