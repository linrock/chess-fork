// The subheader with action buttons under the main title bar

import $ from 'jquery'
import Backbone from 'backbone'

import Tooltip from './tooltip'
import { world } from '../main'

export default class SubHeader extends Backbone.View {

  get el() {
    return ".sub-header"
  }

  get events() {
    return {
      "click .reset-board" : "_resetBoard",
      "click .undo"        : "_undo"
    }
  }

  initialize() {
    this.$title = this.$(".sub-header-title")
    this.listenForEvents()
    this.initSubviews()
  }

  listenForEvents() {
    this.listenTo(openingState, "change:opening", (model, opening) => {
      this.$title.text(opening)
    })
    this.listenTo(world, "change:moves", (model, moves) => {
      if (moves.size === 0) {
        this.$title.text("Welcome to the analysis board!")
      }
    })
  }

  initSubviews() {
    this.$("[data-tooltip]").each((i, e) => {
      new Tooltip({ el: $(e) })
    })
  }

  _resetBoard() {
    world.trigger("reset")
  }

  _undo() {
    world.rewind()
  }
}
