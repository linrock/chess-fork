// The analysis view under the board

import $ from 'jquery'
import Backbone from 'backbone'

import { world } from '../main'

export default class IntroMessage extends Backbone.View {

  get el() {
    return ".intro-message"
  }

  initialize() {
    $(() => this.$el.removeClass("invisible"))
    this.listenTo(world, "change:i", () => this.$el.fadeOut(50))
  }
}
