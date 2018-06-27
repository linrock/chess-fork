// Clickable list of moves that represent the state
// of the game

import * as $ from 'jquery'
import * as Backbone from 'backbone'

import { San, HTML } from '../types'
import { world } from '../main'
import { chess } from '../chess_mechanism'

export default class MoveList extends Backbone.View<Backbone.Model> {
  private $moveList: JQuery

  get el() {
    return ".game-move-list"
  }

  events(): Backbone.EventsHash {
    return {
      "click .move" : "_gotoMove"
    }
  }

  initialize() {
    this.$moveList = this.$(".move-list")
    this.listenToEvents()
  }

  listenToEvents() {
    this.listenTo(world, "change:moves", (model, moves) => {
      this.renderMoves(moves.toArray())
    })
    this.listenTo(world, "change:i", (model, i) => {
      this.$(".move").removeClass("current")
      if (i > 0) {
        this.$(`[data-ply="${i}"]`).addClass("current")
      }
    })
  }

  moveListHtml(moves: Array<San>): HTML {
    let moveNum = 1
    let plyNum = 1
    let html = ''
    moves.forEach(move => {
      if (plyNum % 2 === 1) {
        html += `<div class="move-num">${moveNum}. </div>`
        moveNum++
      }
      html += `<div class="move" data-ply="${plyNum}">${move} </div>`
      plyNum++
    })
    return html
  }

  renderMoves(moves: Array<San>) {
    this.$moveList.empty()
    this.$moveList.html(this.moveListHtml(moves))
  }

  _gotoMove(e) {
    const i = $(e.currentTarget).data("ply")
    chess.setPositionIndex(i)
  }
}
