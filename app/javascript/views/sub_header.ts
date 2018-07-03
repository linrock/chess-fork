// The subheader with action buttons under the main title bar
// and the current opening of the loaded game

import Backbone from 'backbone'

import Tooltip from './tooltip'
import store from '../store'

export default class SubHeader extends Backbone.View<Backbone.Model> {
  private $title: JQuery
  private initialText: string

  get el() {
    return ".sub-header"
  }

  events(): Backbone.EventsHash {
    return {
      "click .reset-board" : () => store.dispatch(`resetWorld`),
      "click .undo"        : () => store.dispatch(`rewindWorld`),
    }
  }

  initialize() {
    this.$title = this.$(".sub-header-title")
    this.initialText = this.$title.text()
    this.listenForEvents()
    this.initSubviews()
  }

  private listenForEvents() {
    store.watch(state => state.openingText, openingText => {
      this.$title.text(openingText)
    })
    store.watch(state => state.moves, moves => {
      if (moves.length === 0) {
        this.$title.text(this.initialText)
      }
    })
  }

  private initSubviews() {
    [].forEach.call(this.$("[data-tooltip]"), el => new Tooltip({ el }))
  }
}
