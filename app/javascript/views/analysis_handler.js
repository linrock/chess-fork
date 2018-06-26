// The analysis info view under the board

import $ from 'jquery'
import _ from 'underscore'
import Backbone from 'backbone'

import { world } from '../main'
import { chess } from '../chess_mechanism'

export default class AnalysisHandler extends Backbone.View {

  get el() {
    return ".suggested-moves"
  }

  get moveTemplate() {
    return _.template(`
      <div class="move-row">
        <div class="move engine-move" data-fen="<%= fen %>">
          <%= move %>
        </div>
        <div class="evaluation <%= color %>"><%= evaluation %></div>
        <div class="source">
          depth <%= depth %>
        </div>
      </div>
    `)
  }

  get events() {
    return {
      "click .move" : "_enterAnalysisMode"
    }
  }

  initialize() {
    this.$moves = this.$(".moves")
    this.$error = this.$(".error")
    this.listenForEvents()
  }

  _enterAnalysisMode(event) {
    let fen = $(event.currentTarget).data("fen")
    chess.analyzePosition(fen)
  }

  listenForEvents() {
    this.listenTo(world, "change:i", (model, i) => {
      if (i <= 0) {
        this.$el.addClass("invisible")
        return
      }
      let fen = chess.getPosition(i)
      let analysis = analysisCache.get(fen)
      if (analysis) {
        this.render(analysis)
      } else {
        analysisCache.getAnalysis(fen).catch((error) => {
          console.log(error)
        })
      }
    })
    this.listenTo(chess, "analysis:pending", () => {
      this.fade()
    })
    this.listenTo(chess, "change:analysis", (analysis) => {
      if (analysis && window.chessboard.fen === analysis.fen) {
        this.render(analysis)
      }
    })
    this.listenTo(chess, "polarity:flip", () => {
      let fen = chess.getCurrentPosition()
      let analysis = analysisCache.get(fen)
      this.render(analysis)
    })
  }

  getFormattedEvaluation(evaluation, polarity) {
    let color = ''
    if (_.isNumber(evaluation)) {
      evaluation *= polarity
      evaluation = evaluation > 0 ? `+${evaluation}` : evaluation
      if (evaluation > 0.5) {
        color = 'green'
      } else if (evaluation < -0.5) {
        color = 'red'
      }
    } else if (evaluation.indexOf("mate") === 0) {
      let regex = /mate (-?\d+)/
      let score = regex.exec(evaluation)[1] * polarity
      if (score < 0) {
        color = 'red'
      } else {
        color = 'green'
      }
      evaluation = `Mate in ${Math.abs(score)}`
    }
    return {
      color: color,
      evaluation: evaluation
    }
  }

  renderError(message) {
    this.$error.removeClass("invisible").text(message)
  }

  render(analysis) {
    // this.$error.addClass("invisible")
    if (!analysis) {
      return
    }
    if (!analysis.variations[0].moves[0]) {
      this.renderGameOver()
      return
    }
    let variations = _.sortBy(analysis.variations, (variation) => {
      return variation.multipv
    })
    let html = ''
    for (let variation of variations) {
      let polarity = (/ w /.test(analysis.fen) ? 1 : -1) * chess.get("polarity")
      let formatted = this.getFormattedEvaluation(variation.score, polarity)
      html += this.moveTemplate({
        fen: analysis.fen,
        move: `${chess.getMovePrefix(world.get("i"))} ${variation.moves[0]}`,
        evaluation: formatted.evaluation,
        color: formatted.color,
        engine: analysis.engine,
        depth: variation.depth
      })
    }
    this.show()
    this.$moves.html(html)
  }

  // TODO render a message saying the state of the game if it's over
  renderGameOver() {
    this.hide()
  }

  show() {
    this.$el.removeClass("invisible")
    this.$moves.removeClass("faded")
  }

  fade() {
    this.$moves.addClass("faded")
  }

  hide() {
    this.$el.addClass("invisible")
  }
}
