// The subheader with action buttons under the main title bar
// and the current opening of the loaded game

import Backbone from 'backbone'

import Tooltip from './tooltip'
import openingState from '../opening_state'
import { world } from '../world_state'

export default class SubHeader extends Backbone.View {

  get el() {
    return ".sub-header"
  }

  get events() {
    return {
      "click .reset-board" : () => world.reset(),
      "click .undo"        : () => world.rewind(),
    }
  }

  initialize() {
    this.$title = this.$(".sub-header-title")
    this.initialText = this.$title.text()
    this.listenForEvents()
    this.initSubviews()
  }

  listenForEvents() {
    this.listenTo(openingState, "change:opening", (model, opening) => {
      this.$title.text(opening)
    })
    this.listenTo(world, "change:moves", (model, moves) => {
      if (moves.size === 0) {
        this.$title.text(this.initialText)
      }
    })
  }

  initSubviews() {
    this.$("[data-tooltip]").each((i, el) => new Tooltip({ el }))
  }
}
