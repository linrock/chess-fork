// The analysis view under the board

import $ from 'jquery'
import Backbone from 'backbone'

import { world } from '../main'

export default class IntroMessage extends Backbone.View {

  get el() {
    return ".intro-message"
  }

  initialize() {
    this.listenTo(world, "change:i", (model, i) => {
      this.$el.fadeOut(50)
    })
    $(() => { this.$el.removeClass("invisible") })
  }
}
