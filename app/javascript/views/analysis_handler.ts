// The analysis info view under the board

import * as $ from 'jquery'
import * as _ from 'underscore'
import * as Backbone from 'backbone'

import { Variation } from '../types'
import { world } from '../main'
import { chess } from '../chess_mechanism'
import analysisCache from '../analysis_cache'

interface PositionEvaluation {
  color: string
  evaluation: string
}

export default class AnalysisHandler extends Backbone.View<Backbone.Model> {
  private $moves: JQuery
  private $error: JQuery

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

  events(): Backbone.EventsHash {
    return {
      "click .move" : "_enterAnalysisMode",
      "click .engine-actions a": "_multiPv"
    }
  }

  initialize() {
    this.$moves = this.$(".moves")
    this.$error = this.$(".error")
    this.listenForEvents()
  }

  _enterAnalysisMode(event) {
    const fen = $(event.currentTarget).data("fen")
    chess.analyzePosition(fen)
  }

  _multiPv() {
    analysisCache.localGet((<any>window).chessboard.fen, { multipv: 3 }).then((analysis) => {
      analysisCache.notifyAnalysis(analysis)
    })
  }

  listenForEvents() {
    this.listenTo(world, "change:i", (model, i) => {
      if (i <= 0) {
        this.$el.addClass("invisible")
        return
      }
      const fen = chess.getPosition(i)
      const analysis = analysisCache.get(fen)
      if (analysis) {
        this.renderAnalysis(analysis)
      } else {
        analysisCache.getAnalysis(fen, {}, true) // only fetch from cache
      }
    })
    this.listenTo(chess, "analysis:pending", () => this.fade())
    this.listenTo(chess, "change:analysis", (analysis) => {
      if (analysis && (<any>window).chessboard.fen === analysis.fen) {
        this.renderAnalysis(analysis)
      }
    })
    this.listenTo(chess, "polarity:flip", () => {
      const fen = chess.getCurrentPosition()
      const analysis = analysisCache.get(fen)
      this.renderAnalysis(analysis)
    })
  }

  getFormattedEvaluation(evaluation, polarity): PositionEvaluation {
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
      const regex = /mate (-?\d+)/
      const score = Number(regex.exec(evaluation)[1]) * polarity
      if (score < 0) {
        color = 'red'
      } else {
        color = 'green'
      }
      evaluation = `Mate in ${Math.abs(score)}`
    }
    return { color, evaluation }
  }

  renderError(message) {
    this.$error.removeClass("invisible").text(message)
  }

  renderAnalysis(analysis) {
    // this.$error.addClass("invisible")
    if (!analysis) {
      return
    }
    if (!analysis.variations[0].moves[0]) {
      this.renderGameOver()
      return
    }
    const variations: Array<Variation> = _.sortBy(analysis.variations, variation => {
      return variation.multipv
    })
    let html = ''
    for (let variation of variations) {
      let polarity = (/ w /.test(analysis.fen) ? 1 : -1) * chess.get("polarity")
      const { color, evaluation } = this.getFormattedEvaluation(variation.score, polarity)
      html += this.moveTemplate({
        fen: analysis.fen,
        move: `${chess.getMovePrefix(world.get("i"))} ${variation.moves[0]}`,
        engine: analysis.engine,
        depth: variation.depth,
        evaluation,
        color,
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
