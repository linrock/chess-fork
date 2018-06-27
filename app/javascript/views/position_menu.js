import $ from 'jquery'
import Backbone from 'backbone'

import { world } from '../main'
import analysisCache from '../analysis_cache'

export default class PositionMenu extends Backbone.View {

  get el() {
    return ".position-actions-menu"
  }

  get events() {
    return {
      "click .action"   : "hide",
      "click .multi-pv" : "_multiPv",
      "click .depth-20" : "_deeperAnalysis",
      "click .show-fen" : "_showFen"
    }
  }

  initialize() {
    this.listenForEvents()
  }

  listenForEvents() {
    this.listenTo(world, "change:i", () => {
      this.hide()
    })
  }

  hide() {
    this.$el.addClass("invisible")
  }

  toggle() {
    this.$el.toggleClass("invisible")
  }

  _multiPv() {
    analysisCache.getAnalysis(window.chessboard.fen, { multipv: 3 })
  }

  _deeperAnalysis() {
    analysisCache.getAnalysis(window.chessboard.fen, { multipv: 16 })
  }

  _showFen() {
    // TODO better way of showing the FEN string
    $(".position-description").addClass("fen").text(window.chessboard.fen)
  }
}
