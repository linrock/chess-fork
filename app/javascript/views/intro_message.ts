// The intro message under the board before user makes an action

import $ from 'jquery'
import Backbone from 'backbone'

import store from '../store'

export default class IntroMessage extends Backbone.View<Backbone.Model> {

  get el() {
    return ".intro-message"
  }

  initialize() {
    $(() => this.$el.removeClass("invisible"))
    store.subscribe(mutation => {
      mutation.type === `setPositionIndex` && this.$el.fadeOut(50)
    })
  }
}
