import Backbone from 'backbone'

import PositionMenu from './position_menu'
import { world } from '../main'
import { chess } from '../chess_mechanism'

export default class PositionInfo extends Backbone.View<Backbone.Model> {
  private $positionDescription: JQuery
  private menu: PositionMenu

  get el() {
    return ".position-info"
  }

  events(): Backbone.EventsHash {
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
      this.renderMoveNum(prevI)
    })
    this.listenTo(chess, "change:mode", (model, mode) => {
      let i = world.get("i")
      if (mode === "normal") {
        this.renderMoveNum(i - 1)
      } else if (mode === "analysis") {
        this.renderText(this.getVariationMoveStr())
      }
    })
    this.listenTo(chess, "change:k", (model, k) => {
      if (chess.get("mode") === `analysis`) {
        this.renderText(this.getVariationMoveStr())
      }
    })
  }

  getVariationMoveStr(): string {
    const i = world.get("i")
    const k = chess.get("k") || 0
    return `Variation after ${chess.getMovePrefix(i)} ${this.firstVariationMove(k)}`
  }

  firstVariationMove(k): string {
    return chess.get("analysis").variations[k].moves[0]
  }

  renderMoveNum(i) {
    const moveStr = `${chess.getMovePrefix(i)} ${chess.getMoves(i)}`
    this.renderText(moveStr)
  }

  renderText(text) {
    this.$el.removeClass("invisible")
    this.$positionDescription.removeClass("fen").text(text)
  }

  _toggleMenu() {
    this.menu.toggle()
  }
}
