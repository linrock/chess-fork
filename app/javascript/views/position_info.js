import Backbone from 'backbone'

import PositionMenu from './position_menu'
import { world } from '../main'
import { chess } from '../chess_mechanism'

export default class PositionInfo extends Backbone.View {

  get el() {
    return ".position-info"
  }

  get events() {
    return {
      "click .show-position-actions" : "_toggleMenu"
    }
  }

  initialize() {
    this.$positionDescription = this.$(".position-description")
    this.menu = new PositionMenu
    this.listenForEvents()
  }

  listenForEvents() {
    this.listenTo(world, "change:i", (model, i) => {
      let prevI = i - 1
      if (prevI < 0) {
        this.$el.addClass("invisible")
        return
      }
      this.renderMove(prevI)
    })
    this.listenTo(chess, "change:mode", (model, mode) => {
      let i = world.get("i")
      if (mode === "normal") {
        this.renderMove(i - 1)
      } else if (mode === "analysis") {
        let firstVariationMove = chess.get("analysis").variations[0].moves[0]
        let moveStr = `${chess.getMovePrefix(i)} ${firstVariationMove}`
        this.render(`Variation after ${moveStr}`)
      }
    })
  }

  renderMove(i) {
    const moveStr = `${chess.getMovePrefix(i)} ${chess.getMoves(i)}`
    this.render(moveStr)
  }

  render(text) {
    this.$el.removeClass("invisible")
    this.$positionDescription.removeClass("fen").text(text)
  }

  _toggleMenu() {
    this.menu.toggle()
  }
}
